const express = require('express');
const pool = require('../config/db');

const router = express.Router();

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_DEVICE_TYPE_LENGTH = 50;

function sendResponse(res, status, data, error = null) {
  return res.status(status).json({
    success: error === null,
    data,
    error,
    timestamp: new Date().toISOString(),
  });
}

router.post('/', async (req, res) => {
  const deviceType = req.body && req.body.deviceType;
  if (
    typeof deviceType !== 'string' ||
    deviceType.trim().length === 0 ||
    deviceType.trim().length > MAX_DEVICE_TYPE_LENGTH
  ) {
    return sendResponse(
      res,
      400,
      null,
      `deviceType must be a non-empty string of at most ${MAX_DEVICE_TYPE_LENGTH} characters`,
    );
  }

  try {
    const result = await pool.query(
      'INSERT INTO user_sessions (device_type) VALUES ($1) RETURNING session_id',
      [deviceType.trim()],
    );
    return sendResponse(res, 201, { sessionId: result.rows[0].session_id });
  } catch {
    return sendResponse(res, 500, null, 'Internal server error');
  }
});

router.post('/:sessionId/heartbeat', async (req, res) => {
  const { sessionId } = req.params;
  if (!UUID_PATTERN.test(sessionId)) {
    return sendResponse(res, 400, null, 'sessionId must be a valid UUID');
  }

  try {
    const result = await pool.query(
      `UPDATE user_sessions
       SET last_active_at = NOW(), is_online = TRUE
       WHERE session_id = $1
       RETURNING session_id, last_active_at`,
      [sessionId],
    );
    if (result.rows.length === 0) {
      return sendResponse(res, 404, null, 'Session not found');
    }
    return sendResponse(res, 200, {
      sessionId: result.rows[0].session_id,
      lastActiveAt: result.rows[0].last_active_at,
    });
  } catch {
    return sendResponse(res, 500, null, 'Internal server error');
  }
});

module.exports = router;
