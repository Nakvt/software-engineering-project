const pool = require('../config/db');

/**
 * Tính khoảng cách đường chim bay giữa 2 tọa độ GPS (Haversine)
 * @returns {number} Khoảng cách (Mét)
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

class MobilePoiService {
  /**
   * 2.1. Lấy danh sách POI kèm nội dung thuyết minh theo ngôn ngữ
   */
  async getPois({ lat, lng, lang = 'vi' }) {
    // 1. Lấy mã ngôn ngữ ngắn (en, ja, zh, vi)
    const cleanLang = String(lang).split('-')[0].trim().toLowerCase();

    // 2. Query trực tiếp với LIKE %...% để trị dứt điểm khoảng trắng/định dạng char trong Postgres
    const sqlQuery = `
      SELECT 
        p.id, 
        p.code, 
        p.name_default, 
        p.latitude, 
        p.longitude, 
        p.radius, 
        p.priority, 
        p.cooldown_seconds, 
        p.image_url,
        COALESCE(
          (SELECT title FROM poi_contents WHERE poi_id = p.id AND LOWER(language_code) LIKE $1 LIMIT 1),
          (SELECT title FROM poi_contents WHERE poi_id = p.id AND LOWER(language_code) LIKE 'vi%' LIMIT 1),
          p.name_default
        ) AS title,
        COALESCE(
          (SELECT description FROM poi_contents WHERE poi_id = p.id AND LOWER(language_code) LIKE $1 LIMIT 1),
          (SELECT description FROM poi_contents WHERE poi_id = p.id AND LOWER(language_code) LIKE 'vi%' LIMIT 1),
          ''
        ) AS description,
        COALESCE(
          (SELECT tts_script FROM poi_contents WHERE poi_id = p.id AND LOWER(language_code) LIKE $1 LIMIT 1),
          (SELECT tts_script FROM poi_contents WHERE poi_id = p.id AND LOWER(language_code) LIKE 'vi%' LIMIT 1),
          ''
        ) AS tts_script,
        COALESCE(
          (SELECT audio_url FROM poi_contents WHERE poi_id = p.id AND LOWER(language_code) LIKE $1 LIMIT 1),
          (SELECT audio_url FROM poi_contents WHERE poi_id = p.id AND LOWER(language_code) LIKE 'vi%' LIMIT 1),
          ''
        ) AS audio_url,
        COALESCE(
          (SELECT audio_duration_seconds FROM poi_contents WHERE poi_id = p.id AND LOWER(language_code) LIKE $1 LIMIT 1),
          (SELECT audio_duration_seconds FROM poi_contents WHERE poi_id = p.id AND LOWER(language_code) LIKE 'vi%' LIMIT 1),
          0
        ) AS audio_duration_seconds
      FROM pois p
      ORDER BY p.priority DESC, p.created_at DESC
    `;

    // Truyền tham số dạng wildcard pattern: '%en%'
    const result = await pool.query(sqlQuery, [`%${cleanLang}%`]);
    console.log(`🔍 [DB DEBUG - lang=${cleanLang}] POI 1 tts_script:`, result.rows[0]?.tts_script);
    const parsedLat = lat !== undefined && lat !== null ? Number(lat) : null;
    const parsedLng = lng !== undefined && lng !== null ? Number(lng) : null;

    return result.rows.map((row) => {
      const poiLat = Number(row.latitude);
      const poiLng = Number(row.longitude);

      let distanceMeters = null;
      if (parsedLat !== null && parsedLng !== null && !isNaN(parsedLat) && !isNaN(parsedLng)) {
        distanceMeters = calculateDistanceMeters(parsedLat, parsedLng, poiLat, poiLng);
      }

      return {
        id: row.id,
        code: row.code,
        name: row.title,
        description: row.description,
        location: {
          lat: poiLat,
          lng: poiLng,
        },
        radius: Number(row.radius) || 50,
        priority: Number(row.priority) || 1,
        cooldownSeconds: Number(row.cooldown_seconds) || 300,
        imageUrl: row.image_url || null,
        distanceMeters: distanceMeters !== null ? Number(distanceMeters.toFixed(1)) : null,
        audio: {
          audioUrl: row.audio_url,
          ttsScript: row.tts_script,
          duration: Number(row.audio_duration_seconds) || 0,
        },
      };
    });
  }

  /**
   * 2.2. Quét QR Code để lấy chi tiết POI theo mã Code
   */
  async getPoiByCode(code, lang = 'vi') {
    const cleanLang = String(lang).split('-')[0].trim().toLowerCase();

    const query = `
      SELECT 
        p.id, p.code, p.name_default, p.latitude, p.longitude, 
        p.radius, p.priority, p.cooldown_seconds, p.image_url,
        COALESCE(pc_lang.title, pc_vi.title, p.name_default) AS title,
        COALESCE(pc_lang.description, pc_vi.description, '') AS description,
        COALESCE(pc_lang.tts_script, pc_vi.tts_script, '') AS tts_script,
        COALESCE(pc_lang.audio_url, pc_vi.audio_url, '') AS audio_url,
        COALESCE(pc_lang.audio_duration_seconds, pc_vi.audio_duration_seconds, 0) AS audio_duration_seconds
      FROM pois p
      LEFT JOIN poi_contents pc_lang 
        ON p.id = pc_lang.poi_id AND LOWER(TRIM(pc_lang.language_code)) = $1
      LEFT JOIN poi_contents pc_vi 
        ON p.id = pc_vi.poi_id AND LOWER(TRIM(pc_vi.language_code)) = 'vi'
      WHERE p.code = $2
      LIMIT 1
    `;

    const result = await pool.query(query, [cleanLang, code]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      code: row.code,
      name: row.title,
      description: row.description,
      location: {
        lat: Number(row.latitude),
        lng: Number(row.longitude),
      },
      radius: Number(row.radius) || 50,
      priority: Number(row.priority) || 1,
      cooldownSeconds: Number(row.cooldown_seconds) || 300,
      imageUrl: row.image_url || null,
      audio: {
        audioUrl: row.audio_url,
        ttsScript: row.tts_script,
        duration: Number(row.audio_duration_seconds) || 0,
      },
    };
  }

  /**
   * 2.3. Nhận tọa độ GPS thời gian thực & kiểm tra Geofence
   */
  async processTrackingPing({ sessionId, latitude, longitude, lang = 'vi' }) {
    const sessionExists = await pool.query(
      `SELECT session_id FROM user_sessions WHERE session_id = $1`,
      [sessionId]
    );

    if (sessionExists.rows.length === 0) {
      await pool.query(
        `INSERT INTO user_sessions (session_id, device_type, is_online, last_active_at) 
         VALUES ($1, 'mobile', TRUE, CURRENT_TIMESTAMP)`,
        [sessionId]
      );
    } else {
      await pool.query(
        `UPDATE user_sessions SET last_active_at = CURRENT_TIMESTAMP, is_online = TRUE WHERE session_id = $1`,
        [sessionId]
      );
    }

    await pool.query(
      `INSERT INTO tracking_logs (session_id, latitude, longitude) VALUES ($1, $2, $3)`,
      [sessionId, latitude, longitude]
    );

    const pois = await this.getPois({ lat: latitude, lng: longitude, lang });
    let triggeredPoi = null;

    for (const poi of pois) {
      const distance = calculateDistanceMeters(
        latitude,
        longitude,
        poi.location.lat,
        poi.location.lng
      );

      if (distance <= poi.radius) {
        const cooldownCheck = await pool.query(
          `SELECT played_at FROM play_history 
           WHERE session_id = $1 AND poi_id = $2 
           ORDER BY played_at DESC LIMIT 1`,
          [sessionId, poi.id]
        );

        let canTrigger = true;
        if (cooldownCheck.rows.length > 0) {
          const lastPlayed = new Date(cooldownCheck.rows[0].played_at).getTime();
          const now = Date.now();
          const elapsedSeconds = (now - lastPlayed) / 1000;

          if (elapsedSeconds < poi.cooldownSeconds) {
            canTrigger = false;
          }
        }

        if (canTrigger) {
          triggeredPoi = poi;
          break;
        }
      }
    }

    if (triggeredPoi) {
      return {
        shouldTrigger: true,
        poi: {
          id: triggeredPoi.id,
          name: triggeredPoi.name,
          priority: triggeredPoi.priority,
          audioUrl: triggeredPoi.audio.audioUrl,
          ttsScript: triggeredPoi.audio.ttsScript,
        },
      };
    }

    return {
      shouldTrigger: false,
      poi: null,
    };
  }

  /**
   * 2.4. Ghi nhận nhật ký nghe thuyết minh (Analytics Log)
   */
  async recordListenEvent({ sessionId, poiId, triggerType, durationListenedSeconds, completed }) {
    const query = `
      INSERT INTO play_history (session_id, poi_id, trigger_type, duration_listened_seconds, completed)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(query, [
      sessionId,
      poiId,
      triggerType,
      durationListenedSeconds || 0,
      completed || false,
    ]);
  }
}

module.exports = new MobilePoiService();