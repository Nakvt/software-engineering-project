const express = require('express');
const pool = require('../config/db');

const router = express.Router();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sendResponse(res, status, data, error = null) {
  return res.status(status).json({
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

function isInteger(value, min = -2147483648) {
  return Number.isInteger(value) && value >= min && value <= 2147483647;
}

function isOptionalString(value, maxLength) {
  return value === undefined || value === null || (typeof value === 'string' && value.length <= maxLength);
}

function validateContent(content) {
  return (
    isObject(content) &&
    typeof content.languageCode === 'string' &&
    content.languageCode.trim() !== '' &&
    content.languageCode.length <= 10 &&
    typeof content.title === 'string' &&
    content.title.trim() !== '' &&
    content.title.length <= 255 &&
    (content.accent === undefined ||
      (typeof content.accent === 'string' && content.accent.trim() !== '' && content.accent.length <= 20)) &&
    isOptionalString(content.description, Number.MAX_SAFE_INTEGER) &&
    isOptionalString(content.ttsScript, Number.MAX_SAFE_INTEGER) &&
    isOptionalString(content.audioUrl, 500) &&
    (content.audioDurationSeconds === undefined ||
      content.audioDurationSeconds === null ||
      isInteger(content.audioDurationSeconds, 0))
  );
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

/**
 * 4.1a. Tạo mới POI kèm Content ban đầu
 * POST /api/v1/admin/pois
 */
router.post('/', async (req, res) => {
  const { body } = req;
  const content = body && body.content;
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
    !isInteger(body.radius, 1) ||
    !isInteger(body.priority ?? 1) ||
    !isInteger(body.cooldownSeconds ?? 300, 0) ||
    !isOptionalString(body.imageUrl, 500) ||
    !validateContent(content)
  ) {
    return sendResponse(res, 400, null, 'Invalid POI fields or content');
  }

  const initialContent = {
    languageCode: content.languageCode.trim(),
    accent: content.accent === undefined ? 'neutral' : content.accent.trim(),
    title: content.title.trim(),
    description: content.description ?? null,
    ttsScript: content.ttsScript ?? null,
    audioUrl: content.audioUrl ?? null,
    audioDurationSeconds: content.audioDurationSeconds ?? 0,
  };
  let client;

  try {
    // 💡 GIẢI THÍCH LOGIC TRANSACTION:
    // Dùng Database Transaction (BEGIN -> COMMIT/ROLLBACK) để đảm bảo khi tạo POI
    // thì bảng `pois` và `poi_contents` cùng được ghi đồng thời. Nếu 1 trong 2 gặp lỗi sẽ tự ROLLBACK hoàn toàn.
    client = await pool.connect();
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO pois (
        code, name_default, latitude, longitude, radius, priority, cooldown_seconds, image_url
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
        poi_id, language_code, accent, title, description, tts_script, audio_url, audio_duration_seconds
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        poi.id,
        initialContent.languageCode,
        initialContent.accent,
        initialContent.title,
        initialContent.description,
        initialContent.ttsScript,
        initialContent.audioUrl,
        initialContent.audioDurationSeconds,
      ],
    );
    await client.query('COMMIT');
    return sendResponse(res, 201, mapPoi(poi, initialContent));
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Transaction client may already be closed
      }
    }
    if (error.code === '23505') {
      return sendResponse(res, 409, null, 'POI code or initial content already exists');
    }
    return sendResponse(res, 500, null, 'Internal server error');
  } finally {
    if (client) {
      client.release();
    }
  }
});

/**
 * 4.1b. Cập nhật vị trí và bán kính POI
 * PUT /api/v1/admin/pois/:id
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  if (
    !UUID_PATTERN.test(id) ||
    !isObject(body) ||
    !isObject(body.location) ||
    !isCoordinate(body.location.lat, -90, 90) ||
    !isCoordinate(body.location.lng, -180, 180) ||
    !isInteger(body.radius, 1)
  ) {
    return sendResponse(res, 400, null, 'Invalid POI id, location or radius');
  }

  try {
    const result = await pool.query(
      `UPDATE pois
       SET latitude = $1, longitude = $2, radius = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, latitude, longitude, radius`,
      [body.location.lat, body.location.lng, body.radius, id],
    );
    if (result.rows.length === 0) {
      return sendResponse(res, 404, null, 'POI not found');
    }

    const poi = result.rows[0];
    return sendResponse(res, 200, {
      id: poi.id,
      location: { lat: Number(poi.latitude), lng: Number(poi.longitude) },
      radius: poi.radius,
    });
  } catch {
    return sendResponse(res, 500, null, 'Internal server error');
  }
});

/**
 * 4.1c. Cập nhật Kịch bản TTS / Audio thuyết minh theo ngôn ngữ & giọng đọc
 * POST /api/v1/admin/pois/:id/contents
 */
router.post('/:id/contents', async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  if (!UUID_PATTERN.test(id) || !validateContent(body)) {
    return sendResponse(res, 400, null, 'Invalid POI id or content');
  }

  const languageCode = body.languageCode.trim();
  const accent = body.accent === undefined ? 'neutral' : body.accent.trim();
  const values = [
    id,
    languageCode,
    accent,
    body.title.trim(),
    body.description ?? null,
    body.ttsScript ?? null,
    body.audioUrl ?? null,
    body.audioDurationSeconds ?? 0,
    body.description !== undefined,
    body.ttsScript !== undefined,
    body.audioUrl !== undefined,
    body.audioDurationSeconds !== undefined,
  ];

  try {
    // 💡 GIẢI THÍCH LOGIC UPSERT:
    // 1. Lọt qua truy vấn kiểm tra sự tồn tại của POI
    // 2. Sử dụng ON CONFLICT (poi_id, language_code, accent) DO UPDATE
    //    để tự động chèn mới nếu chưa có bài dịch, hoặc cập nhật đè thông tin nếu đã tồn tại bài dịch cho ngôn ngữ đó.
    const existing = await pool.query(
      `SELECT p.id, pc.id AS content_id
       FROM pois p
       LEFT JOIN poi_contents pc
         ON pc.poi_id = p.id AND pc.language_code = $2 AND pc.accent = $3
       WHERE p.id = $1`,
      [id, languageCode, accent],
    );
    if (existing.rows.length === 0) {
      return sendResponse(res, 404, null, 'POI not found');
    }

    const result = await pool.query(
      `INSERT INTO poi_contents (
        poi_id, language_code, accent, title, description, tts_script, audio_url, audio_duration_seconds
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (poi_id, language_code, accent) DO UPDATE SET
        title = EXCLUDED.title,
        description = CASE WHEN $9 THEN EXCLUDED.description ELSE poi_contents.description END,
        tts_script = CASE WHEN $10 THEN EXCLUDED.tts_script ELSE poi_contents.tts_script END,
        audio_url = CASE WHEN $11 THEN EXCLUDED.audio_url ELSE poi_contents.audio_url END,
        audio_duration_seconds = CASE WHEN $12 THEN EXCLUDED.audio_duration_seconds
          ELSE poi_contents.audio_duration_seconds END
      RETURNING id, poi_id, language_code, accent, title, description,
        tts_script, audio_url, audio_duration_seconds`,
      values,
    );
    const status = existing.rows[0].content_id === null ? 201 : 200;
    return sendResponse(res, status, result.rows[0]);
  } catch (error) {
    if (error.code === '23503') {
      return sendResponse(res, 404, null, 'POI not found');
    }
    return sendResponse(res, 500, null, 'Internal server error');
  }
});

module.exports = router;