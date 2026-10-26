const express = require('express');
const pool = require('../config/db');

const router = express.Router();

function sendResponse(res, status, data, error = null) {
  return res.status(status).json({
    success: error === null,
    data,
    error,
    timestamp: new Date().toISOString(),
  });
}

router.get('/heatmap', async (req, res) => {
  if (Object.keys(req.query).length > 0) {
    return sendResponse(res, 400, null, 'Heatmap query parameters are not supported');
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
    return sendResponse(res, 200, data);
  } catch {
    return sendResponse(res, 500, null, 'Internal server error');
  }
});

router.get('/dashboard', async (req, res) => {
  if (Object.keys(req.query).length > 0) {
    return sendResponse(res, 400, null, 'Dashboard query parameters are not supported');
  }

  try {
    const [topPoisResult, averageResult] = await Promise.all([
      pool.query(
        `SELECT p.id AS poi_id, p.code, p.name_default AS name, COUNT(ph.id) AS play_count
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
    return sendResponse(res, 200, {
      topPois: topPoisResult.rows.map((row) => ({
        poiId: row.poi_id,
        code: row.code,
        name: row.name,
        playCount: Number(row.play_count),
      })),
      averageListeningSeconds: Number(averageResult.rows[0].average_listening_seconds),
    });
  } catch {
    return sendResponse(res, 500, null, 'Internal server error');
  }
});

const ONLINE_WINDOW_MINUTES = 5;

// Counts sessions (not unique users): a session is online if it was active in the last window.
router.get('/online-sessions', async (req, res) => {
  if (Object.keys(req.query).length > 0) {
    return sendResponse(res, 400, null, 'Online sessions query parameters are not supported');
  }

  try {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS online_sessions, NOW() AS as_of
       FROM user_sessions
       WHERE last_active_at >= NOW() - ($1 * INTERVAL '1 minute')`,
      [ONLINE_WINDOW_MINUTES],
    );
    return sendResponse(res, 200, {
      onlineSessions: Number(result.rows[0].online_sessions),
      windowMinutes: ONLINE_WINDOW_MINUTES,
      asOf: result.rows[0].as_of,
    });
  } catch {
    return sendResponse(res, 500, null, 'Internal server error');
  }
});

module.exports = router;
