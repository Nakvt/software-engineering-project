const express = require('express');
const pool = require('../config/db');

const router = express.Router();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TRIGGER_TYPES = new Set(['geofence', 'qr_code', 'manual']);

function sendResponse(response, status, data, error = null) {
	return response.status(status).json({
		success: error === null,
		data,
		error,
		timestamp: new Date().toISOString(),
	});
}

router.post('/listen-event', async (request, response) => {
	const body = request.body || {};
	const { sessionId, poiId, triggerType, durationListenedSeconds, completed } = body;

	if (
		typeof sessionId !== 'string' ||
		!UUID_PATTERN.test(sessionId) ||
		typeof poiId !== 'string' ||
		!UUID_PATTERN.test(poiId) ||
		!TRIGGER_TYPES.has(triggerType) ||
		!Number.isSafeInteger(durationListenedSeconds) ||
		durationListenedSeconds < 0 ||
		typeof completed !== 'boolean'
	) {
		return sendResponse(response, 400, null, 'Invalid listen event');
	}

	try {
		await pool.query(
			`INSERT INTO play_history (
				session_id,
				poi_id,
				trigger_type,
				duration_listened_seconds,
				completed
			) VALUES ($1, $2, $3, $4, $5)`,
			[sessionId, poiId, triggerType, durationListenedSeconds, completed],
		);

		return sendResponse(response, 201, {});
	} catch (error) {
		if (error.code === '23503') {
			return sendResponse(response, 404, null, 'Session or POI not found');
		}
		return sendResponse(response, 500, null, 'Internal server error');
	}
});

module.exports = router;