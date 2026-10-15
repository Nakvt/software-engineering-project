const express = require('express');
const pool = require('../config/db');

const router = express.Router();
const EARTH_RADIUS_METERS = 6371000;
const DEBOUNCE_MILLISECONDS = 3000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sendResponse(response, status, data, error = null) {
	return response.status(status).json({
		success: error === null,
		data,
		error,
		timestamp: new Date().toISOString(),
	});
}

function isValidCoordinate(value, min, max) {
	return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function getLocale(body) {
	const lang = body.lang === undefined ? 'vi' : body.lang;
	const accent = body.accent === undefined ? 'north' : body.accent;

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

	return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function hasDebounced(previousLocation, latitude, longitude) {
	if (!previousLocation) return false;

	const elapsedMilliseconds = Date.now() - new Date(previousLocation.recorded_at).getTime();
	return Number.isFinite(elapsedMilliseconds) && elapsedMilliseconds >= DEBOUNCE_MILLISECONDS;
}

router.post('/ping', async (request, response) => {
	const body = request.body || {};
	const { sessionId, latitude, longitude } = body;

	if (
		typeof sessionId !== 'string' ||
		!UUID_PATTERN.test(sessionId) ||
		!isValidCoordinate(latitude, -90, 90) ||
		!isValidCoordinate(longitude, -180, 180)
	) {
		return sendResponse(response, 400, null, 'Invalid ping request');
	}

	const locale = getLocale(body);
	if (!locale) {
		return sendResponse(response, 400, null, 'Invalid lang or accent');
	}

	let client;

	try {
		client = await pool.connect();
		await client.query('BEGIN');

		const sessionResult = await client.query(
			'SELECT session_id FROM user_sessions WHERE session_id = $1 FOR UPDATE',
			[sessionId],
		);

		if (sessionResult.rows.length === 0) {
			await client.query('ROLLBACK');
			return sendResponse(response, 404, null, 'Session not found');
		}

		const previousResult = await client.query(
			`SELECT latitude, longitude, recorded_at
			 FROM tracking_logs
			 WHERE session_id = $1
			 ORDER BY recorded_at DESC
			 LIMIT 1`,
			[sessionId],
		);
		const previousLocation = previousResult.rows[0];

		await client.query(
			`INSERT INTO tracking_logs (session_id, latitude, longitude)
			 VALUES ($1, $2, $3)`,
			[sessionId, latitude, longitude],
		);

		let eligiblePois = [];

		if (hasDebounced(previousLocation, latitude, longitude)) {
			const poiResult = await client.query(
				`SELECT
					p.id,
					COALESCE(pc.title, p.name_default) AS name,
					p.latitude,
					p.longitude,
					p.radius,
					p.priority,
					p.cooldown_seconds,
					pc.audio_url,
					EXISTS (
						SELECT 1
						FROM play_history ph
						WHERE ph.session_id = $1
							AND ph.poi_id = p.id
							AND ph.played_at > NOW() - (p.cooldown_seconds * INTERVAL '1 second')
					) AS on_cooldown
				 FROM pois p
				 LEFT JOIN poi_contents pc
					ON pc.poi_id = p.id
					AND pc.language_code = $2
					AND pc.accent = $3`,
				[sessionId, locale.lang, locale.accent],
			);

			eligiblePois = poiResult.rows
				.map((poi) => ({
					...poi,
					distance: distanceMeters(
						latitude,
						longitude,
						Number(poi.latitude),
						Number(poi.longitude),
					),
					previousDistance: distanceMeters(
						Number(previousLocation.latitude),
						Number(previousLocation.longitude),
						Number(poi.latitude),
						Number(poi.longitude),
					),
				}))
				.filter((poi) => {
					const radius = Number(poi.radius);
					return (
						Number.isFinite(radius) &&
						poi.distance <= radius &&
						poi.previousDistance <= radius &&
						poi.on_cooldown !== true &&
						typeof poi.audio_url === 'string' &&
						poi.audio_url.trim() !== ''
					);
				})
				.sort(
					(first, second) =>
						Number(second.priority || 0) - Number(first.priority || 0) ||
						first.distance - second.distance,
				);
		}

		await client.query('COMMIT');

		if (eligiblePois.length === 0) {
			return sendResponse(response, 200, { shouldTrigger: false, poi: null });
		}

		const poi = eligiblePois[0];
		return sendResponse(response, 200, {
			shouldTrigger: true,
			poi: {
				id: poi.id,
				name: poi.name,
				priority: poi.priority,
				audioUrl: poi.audio_url,
			},
		});
	} catch (_error) {
		if (client) {
			try {
				await client.query('ROLLBACK');
			} catch (_rollbackError) {
				// The connection may already be unusable.
			}
		}
		return sendResponse(response, 500, null, 'Internal server error');
	} finally {
		client?.release();
	}
});

module.exports = router;