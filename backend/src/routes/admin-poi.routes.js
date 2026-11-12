const express = require('express');
const { translate } = require('@vitalets/google-translate-api');
const pool = require('../config/db');

const router = express.Router();

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
 * 4.1a. Tạo mới POI
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
      } catch {error}
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
 * 4.1d. Xóa POI
 * DELETE /api/v1/admin/pois/:id
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return sendResponse(res, 400, null, 'Invalid POI id');
  }

  try {
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
 * 🟢 4.1b. CẬP NHẬT POI (TỐI GIẢN - TRÁNH HANG/TIMEOUT DB)
 * PUT /api/v1/admin/pois/:id
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  // Bắt các kiểu key tên và mô tả từ Web CMS
  const nameVal = (body?.name_default || body?.name || '').trim();
  const descVal = (body?.description_default || body?.description || '').trim();
  
  const location = isObject(body?.location) ? body.location : body;
  const latVal = Number(location?.lat ?? body?.latitude);
  const lngVal = Number(location?.lng ?? body?.longitude);
  const radVal = Number(body?.radius_meters ?? body?.radius ?? 30);
  const imgVal = body?.image_url || null;

  if (!id || !latVal || !lngVal) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin POI' });
  }

  try {
    // 1. Update bảng pois
    const poiResult = await pool.query(
      `UPDATE pois
       SET name_default = CASE WHEN $1 != '' THEN $1 ELSE name_default END,
           latitude = $2,
           longitude = $3,
           radius = $4,
           image_url = COALESCE($5, image_url),
           updated_at = NOW()
       WHERE id::text = $6 OR code = $6
       RETURNING id, code, name_default, latitude, longitude, radius, image_url`,
      [nameVal, latVal, lngVal, radVal, imgVal, id.trim()]
    );

    if (poiResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Không tìm thấy POI: ${id}` });
    }

    const updatedPoi = poiResult.rows[0];

    // 2. Update mô tả tiếng Việt trong bảng poi_contents
    if (descVal !== '') {
      await pool.query(
        `UPDATE poi_contents
         SET title = $1, description = $2, tts_script = $2
         WHERE poi_id = $3 AND LOWER(language_code) = 'vi'`,
        [updatedPoi.name_default, descVal, updatedPoi.id]
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        id: updatedPoi.id,
        code: updatedPoi.code,
        name_default: updatedPoi.name_default,
        description_default: descVal || updatedPoi.name_default,
        location: { lat: Number(updatedPoi.latitude), lng: Number(updatedPoi.longitude) },
        radius_meters: updatedPoi.radius,
        image_url: updatedPoi.image_url,
      },
    });
  } catch (error) {
    console.error('❌ Lỗi DB:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 🟢 4.1b. CẬP NHẬT POI VÀ NỘI DUNG THUYẾT MINH
 * PUT /api/v1/admin/pois/:id
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  // Khai báo đầy đủ các biến để tránh lỗi is not defined
  const nameVal = (body?.name_default || body?.name || '').trim();
  const descVal = (body?.description_default || body?.description || '').trim();
  
  const location = isObject(body?.location) ? body.location : body;
  const latVal = Number(location?.lat ?? body?.latitude);
  const lngVal = Number(location?.lng ?? body?.longitude);
  const radVal = Number(body?.radius_meters ?? body?.radius ?? 30);
  const imgVal = body?.image_url || null;

  if (!id || !latVal || !lngVal) {
    return res.status(400).json({ success: false, message: 'Invalid POI id or location' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // 1. Update trực tiếp bảng pois
    const poiResult = await client.query(
      `UPDATE pois
       SET name_default = CASE WHEN $1 != '' THEN $1 ELSE name_default END,
           latitude = $2,
           longitude = $3,
           radius = $4,
           image_url = COALESCE($5, image_url),
           updated_at = NOW()
       WHERE id::text = $6 OR code = $6
       RETURNING id, code, name_default, latitude, longitude, radius, image_url`,
      [nameVal, latVal, lngVal, radVal, imgVal, id.trim()]
    );

    if (poiResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Không tìm thấy POI: ${id}` });
    }

    const updatedPoi = poiResult.rows[0];

    // 2. Update nội dung thuyết minh tiếng Việt trong poi_contents
    if (descVal !== '') {
      const updateContentRes = await client.query(
        `UPDATE poi_contents
         SET title = $1, description = $2, tts_script = $2
         WHERE poi_id = $3 AND LOWER(language_code) = 'vi'`,
        [updatedPoi.name_default, descVal, updatedPoi.id]
      );

      // Nếu chưa từng có bản ghi tiếng Việt thì INSERT
      if (updateContentRes.rowCount === 0) {
        await client.query(
          `INSERT INTO poi_contents (poi_id, language_code, accent, title, description, tts_script)
           VALUES ($1, 'vi', 'north', $2, $3, $3)`,
          [updatedPoi.id, updatedPoi.name_default, descVal]
        );
      }
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      data: {
        id: updatedPoi.id,
        code: updatedPoi.code,
        name_default: updatedPoi.name_default,
        description_default: descVal || updatedPoi.name_default,
        location: { lat: Number(updatedPoi.latitude), lng: Number(updatedPoi.longitude) },
        radius_meters: updatedPoi.radius,
        image_url: updatedPoi.image_url,
      },
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('❌ Lỗi DB:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
});

module.exports = router;