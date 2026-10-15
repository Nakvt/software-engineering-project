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

router.get('/heatmap', async (request, response) => {
	if (Object.keys(request.query).length > 0) {
		return sendResponse(response, 400, null, 'Heatmap query parameters are not supported');
	}

	try {
		const result = await pool.query(
			`SELECT latitude, longitude, COUNT(*) AS count
			 FROM tracking_logs
			 GROUP BY latitude, longitude
			 ORDER BY latitude, longitude`,
		);

		const data = result.rows.map((row) => [
			Number(row.latitude),
			Number(row.longitude),
			Number(row.count),
		]);

		return sendResponse(response, 200, data);
	} catch (_error) {
		return sendResponse(response, 500, null, 'Internal server error');
	}
});

router.get('/dashboard', async (request, response) => {
	if (Object.keys(request.query).length > 0) {
		return sendResponse(response, 400, null, 'Dashboard query parameters are not supported');
	}

	try {
		const [topPoisResult, averageResult] = await Promise.all([
			pool.query(
				`SELECT
					p.id AS poi_id,
					p.code,
					p.name_default AS name,
					COUNT(ph.id) AS play_count
				 FROM play_history ph
				 JOIN pois p ON p.id = ph.poi_id
				 GROUP BY p.id, p.code, p.name_default
				 ORDER BY play_count DESC, p.id ASC`,
			),
			pool.query(
				`SELECT COALESCE(AVG(duration_listened_seconds), 0) AS average_listening_seconds
				 FROM play_history`,
			),
		]);

		return sendResponse(response, 200, {
			topPois: topPoisResult.rows.map((row) => ({
				poiId: row.poi_id,
				code: row.code,
				name: row.name,
				playCount: Number(row.play_count),
			})),
			averageListeningSeconds: Number(averageResult.rows[0].average_listening_seconds),
		});
	} catch (_error) {
		return sendResponse(response, 500, null, 'Internal server error');
	}
});

module.exports = router;