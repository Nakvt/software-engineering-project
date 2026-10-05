const express = require('express');
const pool = require('../config/db');

const router = express.Router();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const POSTGRES_INTEGER_MIN = -2147483648;
const POSTGRES_INTEGER_MAX = 2147483647;

function sendResponse(response, status, data, error = null) {
	return response.status(status).json({
		success: error === null,
		data,
		error,
		timestamp: new Date().toISOString(),
	});
}

function isObject(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isCoordinate(value, min, max) {
	return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function isPostgresInteger(value, min = POSTGRES_INTEGER_MIN, max = POSTGRES_INTEGER_MAX) {
	return Number.isInteger(value) && value >= min && value <= max;
}

function isOptionalString(value, maxLength) {
	return value === undefined || value === null || (typeof value === 'string' && value.length <= maxLength);
}

function validateCreateBody(body) {
	if (
		!isObject(body) ||
		typeof body.code !== 'string' ||
		body.code.trim() === '' ||
		body.code.length > 50 ||
		typeof body.name !== 'string' ||
		body.name.trim() === '' ||
		body.name.length > 255 ||
		!isObject(body.location) ||
		!isCoordinate(body.location.lat, -90, 90) ||
		!isCoordinate(body.location.lng, -180, 180) ||
		!isPostgresInteger(body.radius, 1) ||
		!isObject(body.content)
	) {
		return 'Invalid POI fields';
	}

	if (
		!isPostgresInteger(body.priority ?? 1) ||
		!isPostgresInteger(body.cooldownSeconds ?? 300, 0) ||
		!isOptionalString(body.imageUrl, 500)
	) {
		return 'Invalid optional POI fields';
	}

	const content = body.content;
	if (
		typeof content.languageCode !== 'string' ||
		content.languageCode.trim() === '' ||
		content.languageCode.length > 10 ||
		typeof content.title !== 'string' ||
		content.title.trim() === '' ||
		content.title.length > 255 ||
		(content.accent !== undefined &&
			(typeof content.accent !== 'string' || content.accent.trim() === '' || content.accent.length > 20)) ||
		!isOptionalString(content.description, Number.MAX_SAFE_INTEGER) ||
		!isOptionalString(content.ttsScript, Number.MAX_SAFE_INTEGER) ||
		!isOptionalString(content.audioUrl, 500) ||
		!isPostgresInteger(content.audioDurationSeconds ?? 0, 0)
	) {
		return 'Invalid initial POI content';
	}

	return null;
}

function validateUpdateBody(body) {
	if (
		!isObject(body) ||
		!isObject(body.location) ||
		!isCoordinate(body.location.lat, -90, 90) ||
		!isCoordinate(body.location.lng, -180, 180) ||
		!isPostgresInteger(body.radius, 1)
	) {
		return 'Invalid POI location or radius';
	}

	return null;
}

function validateContentBody(body) {
	if (
		!isObject(body) ||
		typeof body.languageCode !== 'string' ||
		body.languageCode.trim() === '' ||
		body.languageCode.length > 10 ||
		typeof body.title !== 'string' ||
		body.title.trim() === '' ||
		body.title.length > 255 ||
		(body.accent !== undefined &&
			(typeof body.accent !== 'string' || body.accent.trim() === '' || body.accent.length > 20)) ||
		!isOptionalString(body.description, Number.MAX_SAFE_INTEGER) ||
		!isOptionalString(body.ttsScript, Number.MAX_SAFE_INTEGER) ||
		!isOptionalString(body.audioUrl, 500) ||
		(body.audioDurationSeconds !== undefined &&
			body.audioDurationSeconds !== null &&
			!isPostgresInteger(body.audioDurationSeconds, 0))
	) {
		return 'Invalid POI content';
	}

	return null;
}

function mapPoi(row, content) {
	return {
		id: row.id,
		code: row.code,
		name: content.title,
		location: {
			lat: Number(row.latitude),
			lng: Number(row.longitude),
		},
		radius: row.radius,
		priority: row.priority,
		cooldownSeconds: row.cooldown_seconds,
		imageUrl: row.image_url,
		audio: {
			audioUrl: content.audioUrl,
			ttsScript: content.ttsScript,
			duration: content.audioDurationSeconds,
		},
	};
}

router.post('/', async (request, response) => {
	const body = request.body;
	const validationError = validateCreateBody(body);
	if (validationError) {
		return sendResponse(response, 400, null, validationError);
	}

	const content = {
		languageCode: body.content.languageCode.trim(),
		accent: body.content.accent === undefined ? 'neutral' : body.content.accent.trim(),
		title: body.content.title.trim(),
		description: body.content.description ?? null,
		ttsScript: body.content.ttsScript ?? null,
		audioUrl: body.content.audioUrl ?? null,
		audioDurationSeconds: body.content.audioDurationSeconds ?? 0,
	};
	let client;

	try {
		client = await pool.connect();
		await client.query('BEGIN');

		const result = await client.query(
			`INSERT INTO pois (
				code,
				name_default,
				latitude,
				longitude,
				radius,
				priority,
				cooldown_seconds,
				image_url
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			RETURNING id, code, name_default, latitude, longitude, radius,
				priority, cooldown_seconds, image_url`,
			[
				body.code.trim(),
				body.name.trim(),
				body.location.lat,
				body.location.lng,
				body.radius,
				body.priority ?? 1,
				body.cooldownSeconds ?? 300,
				body.imageUrl ?? null,
			],
		);
		const poi = result.rows[0];

		await client.query(
			`INSERT INTO poi_contents (
				poi_id,
				language_code,
				accent,
				title,
				description,
				tts_script,
				audio_url,
				audio_duration_seconds
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
			[
				poi.id,
				content.languageCode,
				content.accent,
				content.title,
				content.description,
				content.ttsScript,
				content.audioUrl,
				content.audioDurationSeconds,
			],
		);

		await client.query('COMMIT');
		return sendResponse(response, 201, mapPoi(poi, content));
	} catch (error) {
		if (client) {
			try {
				await client.query('ROLLBACK');
			} catch (_rollbackError) {
				// The connection may already be unusable.
			}
		}

		if (error.code === '23505') {
			return sendResponse(response, 409, null, 'POI code or initial content already exists');
		}
		return sendResponse(response, 500, null, 'Internal server error');
	} finally {
		client?.release();
	}
});

router.post('/:id/contents', async (request, response) => {
	const { id } = request.params;
	if (!UUID_PATTERN.test(id)) {
		return sendResponse(response, 400, null, 'Invalid POI id');
	}

	const body = request.body;
	const validationError = validateContentBody(body);
	if (validationError) {
		return sendResponse(response, 400, null, validationError);
	}

	const languageCode = body.languageCode.trim();
	const accent = body.accent === undefined ? 'neutral' : body.accent.trim();
	const contentValues = [
		id,
		languageCode,
		accent,
		body.title.trim(),
		body.description ?? null,
		body.ttsScript ?? null,
		body.audioUrl ?? null,
		body.audioDurationSeconds === undefined ? 0 : body.audioDurationSeconds,
		body.description !== undefined,
		body.ttsScript !== undefined,
		body.audioUrl !== undefined,
		body.audioDurationSeconds !== undefined,
	];

	try {
		const poiResult = await pool.query(
			`SELECT p.id, pc.id AS content_id
			 FROM pois p
			 LEFT JOIN poi_contents pc
				ON pc.poi_id = p.id
				AND pc.language_code = $2
				AND pc.accent = $3
			 WHERE p.id = $1`,
			[id, languageCode, accent],
		);

		if (poiResult.rows.length === 0) {
			return sendResponse(response, 404, null, 'POI not found');
		}

		const existingContent = poiResult.rows[0].content_id !== null;
		const result = await pool.query(
			`INSERT INTO poi_contents (
				poi_id,
				language_code,
				accent,
				title,
				description,
				tts_script,
				audio_url,
				audio_duration_seconds
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			ON CONFLICT (poi_id, language_code, accent)
			DO UPDATE SET
				title = EXCLUDED.title,
				description = CASE WHEN $9 THEN EXCLUDED.description ELSE poi_contents.description END,
				tts_script = CASE WHEN $10 THEN EXCLUDED.tts_script ELSE poi_contents.tts_script END,
				audio_url = CASE WHEN $11 THEN EXCLUDED.audio_url ELSE poi_contents.audio_url END,
				audio_duration_seconds = CASE WHEN $12 THEN EXCLUDED.audio_duration_seconds ELSE poi_contents.audio_duration_seconds END
			RETURNING id, poi_id, language_code, accent, title, description,
				tts_script, audio_url, audio_duration_seconds`,
			contentValues,
		);

		return sendResponse(response, existingContent ? 200 : 201, result.rows[0]);
	} catch (error) {
		if (error.code === '23503') {
			return sendResponse(response, 404, null, 'POI not found');
		}
		if (error.code === '23505') {
			return sendResponse(response, 409, null, 'POI content already exists');
		}
		return sendResponse(response, 500, null, 'Internal server error');
	}
});

router.put('/:id', async (request, response) => {
	const { id } = request.params;
	if (!UUID_PATTERN.test(id)) {
		return sendResponse(response, 400, null, 'Invalid POI id');
	}

	const validationError = validateUpdateBody(request.body);
	if (validationError) {
		return sendResponse(response, 400, null, validationError);
	}

	try {
		const { location, radius } = request.body;
		const result = await pool.query(
			`UPDATE pois
			 SET latitude = $1,
				 longitude = $2,
				 radius = $3,
				 updated_at = CURRENT_TIMESTAMP
			 WHERE id = $4
			 RETURNING id, latitude, longitude, radius`,
			[location.lat, location.lng, radius, id],
		);

		if (result.rows.length === 0) {
			return sendResponse(response, 404, null, 'POI not found');
		}

		const poi = result.rows[0];
		return sendResponse(response, 200, {
			id: poi.id,
			location: {
				lat: Number(poi.latitude),
				lng: Number(poi.longitude),
			},
			radius: poi.radius,
		});
	} catch (_error) {
		return sendResponse(response, 500, null, 'Internal server error');
	}
});

router.delete('/:id', async (request, response) => {
	const { id } = request.params;
	if (!UUID_PATTERN.test(id)) {
		return sendResponse(response, 400, null, 'Invalid POI id');
	}

	try {
		const result = await pool.query(
			'DELETE FROM pois WHERE id = $1 RETURNING id',
			[id],
		);

		if (result.rows.length === 0) {
			return sendResponse(response, 404, null, 'POI not found');
		}

		return sendResponse(response, 200, { id: result.rows[0].id });
	} catch (_error) {
		return sendResponse(response, 500, null, 'Internal server error');
	}
});

module.exports = router;