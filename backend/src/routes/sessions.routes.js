const { randomUUID } = require('node:crypto');
const express = require('express');
const pool = require('../config/db');

const router = express.Router();

function sendResponse(response, status, data, error = null) {
	return response.status(status).json({
		success: error === null,
		data,
		error,
		timestamp: new Date().toISOString(),
	});
}

router.post('/', async (request, response) => {
	const body = request.body || {};
	const { deviceType } = body;

	if (
		deviceType !== undefined &&
		(typeof deviceType !== 'string' || deviceType.length > 50)
	) {
		return sendResponse(response, 400, null, 'Invalid deviceType');
	}

	const sessionId = randomUUID();

	try {
		await pool.query(
			'INSERT INTO user_sessions (session_id, device_type) VALUES ($1, $2)',
			[sessionId, deviceType ?? null],
		);

		return sendResponse(response, 201, { sessionId });
	} catch (_error) {
		return sendResponse(response, 500, null, 'Internal server error');
	}
});

module.exports = router;
