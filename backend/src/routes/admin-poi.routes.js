const express = require('express');
const { translate } = require('@vitalets/google-translate-api');
const pool = require('../config/db');

const router = express.Router();
// const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Danh sách các ngôn ngữ cần tự động dịch từ bản gốc (Tiếng Việt)
const TARGET_LANGUAGES = [
  { code: 'en', accent: 'neutral' },
  { code: 'zh-CN', dbCode: 'zh', accent: 'neutral' },
  { code: 'ja', accent: 'neutral' },
  { code: 'ko', accent: 'neutral' },
];

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

// 💡 HÀM BỔ TRỢ: Tính thời lượng đọc audio ước tính (TB 1 từ đọc khoảng 0.4 giây)
function calculateAudioDuration(text) {
  if (!text || typeof text !== 'string') return 60;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(10, Math.ceil(wordCount * 0.4));
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
 * 4.1a. Tạo mới POI kèm Content ban đầu & TỰ ĐỘNG DỊCH 4 NGÔN NGỮ (EN, ZH, JA, KO)
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

  const rawScript = content.ttsScript || content.description || body.name;
  
  const duration = (content.audioDurationSeconds && content.audioDurationSeconds > 0)
    ? content.audioDurationSeconds
    : calculateAudioDuration(rawScript);

  const defaultAudioUrl = content.audioUrl || `https://cdn.example.com/audio/${body.code.trim()}_${content.languageCode.trim()}.mp3`;

  const initialContent = {
    languageCode: content.languageCode.trim(),
    accent: content.accent === undefined ? 'north' : content.accent.trim(),
    title: content.title.trim(),
    description: content.description ?? rawScript,
    ttsScript: content.ttsScript ?? rawScript,
    audioUrl: defaultAudioUrl,
    audioDurationSeconds: duration,
  };
  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // 1. Chèn POI vào bảng `pois`
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

    // 2. Chèn bản ghi gốc (Tiếng Việt) vào `poi_contents`
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

    // 3. TỰ ĐỘNG DỊCH SANG 4 NGÔN NGỮ (EN, ZH, JA, KO) VÀ LƯU VÀO DB
    for (const target of TARGET_LANGUAGES) {
      try {
        const langCodeInDb = target.dbCode || target.code;

        if (langCodeInDb === initialContent.languageCode) continue;

        const [transTitle, transScript] = await Promise.all([
          translate(initialContent.title, { to: target.code }),
          translate(initialContent.ttsScript, { to: target.code }),
        ]);

        const translatedTitle = transTitle.text;
        const translatedScript = transScript.text;
        const translatedDuration = calculateAudioDuration(translatedScript);
        const translatedAudioUrl = `https://cdn.example.com/audio/${body.code.trim()}_${langCodeInDb}.mp3`;

        await client.query(
          `INSERT INTO poi_contents (
            poi_id, language_code, accent, title, description, tts_script, audio_url, audio_duration_seconds
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (poi_id, language_code, accent) DO NOTHING`,
          [
            poi.id,
            langCodeInDb,
            target.accent,
            translatedTitle,
            translatedScript,
            translatedScript,
            translatedAudioUrl,
            translatedDuration,
          ],
        );
      } catch (transError) {
        console.warn(`Lỗi dịch tự động sang ${target.code}:`, transError.message);
      }
    }

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
 * 💡 BỔ SUNG QUAN TRỌNG: 4.1d. Xóa POI khỏi CSDL Neon
 * DELETE /api/v1/admin/pois/:id
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return sendResponse(res, 400, null, 'Invalid POI id');
  }

  try {
    // Tìm và xóa POI dựa theo id (UUID) hoặc code (Mã POI)
    const result = await pool.query(
      `DELETE FROM pois 
       WHERE id::text = $1 OR code = $1 
       RETURNING id, code`,
      [id.trim()]
    );

    if (result.rows.length === 0) {
      return sendResponse(res, 404, null, 'POI not found');
    }

    return sendResponse(res, 200, {
      message: 'Xóa POI thành công',
      id: result.rows[0].id,
      code: result.rows[0].code
    });
  } catch (error) {
    console.error('Lỗi khi xóa POI:', error);
    return sendResponse(res, 500, null, 'Internal server error');
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
    !id ||
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
       WHERE id::text = $4 OR code = $4
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
  if (!id || !validateContent(body)) {
    return sendResponse(res, 400, null, 'Invalid POI id or content');
  }

  const languageCode = body.languageCode.trim();
  const accent = body.accent === undefined ? 'neutral' : body.accent.trim();
  
  const ttsText = body.ttsScript || body.description || body.title;
  const computedDuration = (body.audioDurationSeconds && body.audioDurationSeconds > 0)
    ? body.audioDurationSeconds
    : calculateAudioDuration(ttsText);
  const computedAudioUrl = body.audioUrl || `https://cdn.example.com/audio/${id}_${languageCode}.mp3`;

  const values = [
    id,
    languageCode,
    accent,
    body.title.trim(),
    body.description ?? ttsText,
    body.ttsScript ?? ttsText,
    computedAudioUrl,
    computedDuration,
    body.description !== undefined,
    body.ttsScript !== undefined,
    body.audioUrl !== undefined,
    body.audioDurationSeconds !== undefined,
  ];

  try {
    const existing = await pool.query(
      `SELECT p.id, pc.id AS content_id
       FROM pois p
       LEFT JOIN poi_contents pc
         ON pc.poi_id = p.id AND pc.language_code = $2 AND pc.accent = $3
       WHERE p.id::text = $1 OR p.code = $1`,
      [id, languageCode, accent],
    );
    if (existing.rows.length === 0) {
      return sendResponse(res, 404, null, 'POI not found');
    }

    const targetPoiId = existing.rows[0].id;
    values[0] = targetPoiId;

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