const express = require('express');
const pool = require('../config/db');

const router = express.Router();
const EARTH_RADIUS_METERS = 6371000;

const poiSelect = `
	SELECT
		p.id,
		p.code,
		COALESCE(pc.title, p.name_default) AS name,
		p.latitude,
		p.longitude,
		p.radius,
		p.priority,
		p.cooldown_seconds,
		p.image_url,
		pc.audio_url,
		pc.tts_script,
		pc.audio_duration_seconds
	FROM pois p
	LEFT JOIN poi_contents pc
		ON pc.poi_id = p.id
		AND pc.language_code = $1
		AND pc.accent = $2
`;

function sendResponse(response, status, data, error = null) {
	return response.status(status).json({
		success: error === null,
		data,
		error,
		timestamp: new Date().toISOString(),
	});
}

function isValidCoordinate(value, min, max) {
	if (value === undefined) return true;
	if (typeof value !== 'string' || value.trim() === '') return false;

	const coordinate = Number(value);
	return Number.isFinite(coordinate) && coordinate >= min && coordinate <= max;
}

function getLocale(query) {
	const lang = query.lang === undefined ? 'vi' : query.lang;
	const accent = query.accent === undefined ? 'north' : query.accent;

	if (
		typeof lang !== 'string' ||
		lang.trim() === '' ||
		typeof accent !== 'string' ||
		accent.trim() === ''
	) {
		return null;
	}

	return { lang, accent };
}

function toNumberOrNull(value) {
	return value === null || value === undefined ? null : Number(value);
}

function distanceMeters(firstLatitude, firstLongitude, secondLatitude, secondLongitude) {
	const toRadians = (degrees) => (degrees * Math.PI) / 180;
	const latitudeDifference = toRadians(secondLatitude - firstLatitude);
	const longitudeDifference = toRadians(secondLongitude - firstLongitude);
	const firstLatitudeRadians = toRadians(firstLatitude);
	const secondLatitudeRadians = toRadians(secondLatitude);
	const haversine =
		Math.sin(latitudeDifference / 2) ** 2 +
		Math.cos(firstLatitudeRadians) *
			Math.cos(secondLatitudeRadians) *
			Math.sin(longitudeDifference / 2) ** 2;
	const boundedHaversine = Math.min(1, haversine);

	return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(boundedHaversine), Math.sqrt(1 - boundedHaversine));
}

function mapPoi(row) {
	return {
		id: row.id,
		code: row.code,
		name: row.name,
		location: {
			lat: Number(row.latitude),
			lng: Number(row.longitude),
		},
		radius: row.radius,
		priority: row.priority,
		cooldownSeconds: row.cooldown_seconds,
		imageUrl: row.image_url,
		audio: {
			audioUrl: row.audio_url,
			ttsScript: row.tts_script,
			duration: toNumberOrNull(row.audio_duration_seconds),
		},
	};
}

router.get('/', async (request, response) => {
	const { lat, lng } = request.query;
	if (!isValidCoordinate(lat, -90, 90)) {
		return sendResponse(response, 400, null, 'Invalid lat query parameter');
	}
	if (!isValidCoordinate(lng, -180, 180)) {
		return sendResponse(response, 400, null, 'Invalid lng query parameter');
	}

	const locale = getLocale(request.query);
	if (!locale) {
		return sendResponse(response, 400, null, 'Invalid lang or accent query parameter');
	}

	try {
		const result = await pool.query(poiSelect, [locale.lang, locale.accent]);
		const pois = result.rows.map(mapPoi);

		if (lat !== undefined && lng !== undefined) {
			const requestLatitude = Number(lat);
			const requestLongitude = Number(lng);
			pois.sort(
				(first, second) =>
					distanceMeters(
						requestLatitude,
						requestLongitude,
						first.location.lat,
						first.location.lng,
					) -
					distanceMeters(
						requestLatitude,
						requestLongitude,
						second.location.lat,
						second.location.lng,
					),
			);
		}

		return sendResponse(response, 200, pois);
	} catch (_error) {
		return sendResponse(response, 500, null, 'Internal server error');
	}
});

router.get('/by-code/:code', async (request, response) => {
	const code = request.params.code.trim();
	if (!code) {
		return sendResponse(response, 400, null, 'Invalid POI code');
	}

	const locale = getLocale(request.query);
	if (!locale) {
		return sendResponse(response, 400, null, 'Invalid lang or accent query parameter');
	}

	try {
		const result = await pool.query(`${poiSelect} WHERE p.code = $3`, [
			locale.lang,
			locale.accent,
			code,
		]);

		if (result.rows.length === 0) {
			return sendResponse(response, 404, null, 'POI not found');
		}

		return sendResponse(response, 200, mapPoi(result.rows[0]));
	} catch (_error) {
		return sendResponse(response, 500, null, 'Internal server error');
	}
});

module.exports = router;
