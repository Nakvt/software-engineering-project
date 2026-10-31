const pool = require('../config/db');

/**
 * Tính khoảng cách đường chim bay giữa 2 tọa độ GPS (Công thức Haversine)
 * @returns {number} Khoảng cách tính bằng Mét
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Bán kính Trái Đất trung bình (Mét)
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
   * 2.1. Lấy danh sách POI kèm nội dung thuyết minh theo ngôn ngữ & giọng đọc
   */
  async getPois({ lat, lng, lang, accent }) {
    // Câu SQL chuẩn hóa với DISTINCT ON giúp lấy đúng 1 bản dịch tốt nhất cho từng POI
    const sqlQuery = `
      SELECT DISTINCT ON (p.id)
        p.id, 
        p.code, 
        p.name_default, 
        p.latitude, 
        p.longitude, 
        p.radius, 
        p.priority, 
        p.cooldown_seconds, 
        p.image_url,
        pc.title, 
        pc.tts_script, 
        pc.audio_url, 
        pc.audio_duration_seconds,
        CASE 
          WHEN pc.accent = $2 THEN 1 
          WHEN pc.accent = 'neutral' THEN 2 
          ELSE 3 
        END AS accent_priority
      FROM pois p
      LEFT JOIN poi_contents pc 
        ON p.id = pc.poi_id 
       AND pc.language_code = $1 
       AND (pc.accent = $2 OR pc.accent = 'neutral')
      ORDER BY p.id, accent_priority ASC, p.priority DESC, p.created_at DESC
    `;

    const result = await pool.query(sqlQuery, [lang, accent]);

    // Nếu Mobile có truyền tọa độ GPS hiện tại (lat, lng), tính thêm khoảng cách
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
        name: row.title || row.name_default,
        location: {
          lat: poiLat,
          lng: poiLng,
        },
        radius: row.radius,
        priority: row.priority,
        cooldownSeconds: row.cooldown_seconds,
        imageUrl: row.image_url,
        distanceMeters: distanceMeters !== null ? Number(distanceMeters.toFixed(1)) : null,
        audio: {
          audioUrl: row.audio_url,
          ttsScript: row.tts_script,
          duration: row.audio_duration_seconds || 0,
        },
      };
    });
  }
  /**
   * 2.2. Quét QR Code để lấy chi tiết POI theo mã Code
   */
  async getPoiByCode(code, lang, accent) {
    const query = `
      SELECT 
        p.id, p.code, p.name_default, p.latitude, p.longitude, 
        p.radius, p.priority, p.cooldown_seconds, p.image_url,
        pc.title, pc.tts_script, pc.audio_url, pc.audio_duration_seconds
      FROM pois p
      LEFT JOIN poi_contents pc 
        ON p.id = pc.poi_id 
       AND pc.language_code = $1 
       AND (pc.accent = $2 OR pc.accent = 'neutral')
      WHERE p.code = $3
      ORDER BY CASE WHEN pc.accent = $2 THEN 1 ELSE 2 END
      LIMIT 1
    `;

    const result = await pool.query(query, [lang, accent, code]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      code: row.code,
      name: row.title || row.name_default,
      location: {
        lat: Number(row.latitude),
        lng: Number(row.longitude),
      },
      radius: row.radius,
      priority: row.priority,
      cooldownSeconds: row.cooldown_seconds,
      imageUrl: row.image_url,
      audio: {
        audioUrl: row.audio_url,
        ttsScript: row.tts_script,
        duration: row.audio_duration_seconds || 0,
      },
    };
  }

  /**
   * 2.3. Nhận tọa độ GPS thời gian thực, lưu Log Heatmap & kiểm tra kích hoạt Geofence
   * Đã bổ sung Transaction (Client Checkout) giúp tránh lỗi treo connection pool.
   */
  async processTrackingPing({ sessionId, latitude, longitude, lang, accent }) {
    // 1. Kiểm tra session_id tồn tại trước khi Insert log để tránh lỗi khóa ngoại (Foreign Key Constraint)
    const sessionExists = await pool.query(
      `SELECT session_id FROM user_sessions WHERE session_id = $1`,
      [sessionId]
    );

    if (sessionExists.rows.length === 0) {
      // Nếu session chưa tồn tại trong DB, tạo mới 1 phiên ẩn danh
      await pool.query(
        `INSERT INTO user_sessions (session_id, device_type, is_online, last_active_at) 
         VALUES ($1, 'mobile', TRUE, CURRENT_TIMESTAMP)`,
        [sessionId]
      );
    } else {
      // Nếu đã có, cập nhật thời gian hoạt động gần nhất
      await pool.query(
        `UPDATE user_sessions SET last_active_at = CURRENT_TIMESTAMP, is_online = TRUE WHERE session_id = $1`,
        [sessionId]
      );
    }

    // 2. Ghi nhận vị trí thời gian thực vào tracking_logs phục vụ bản đồ Heatmap
    await pool.query(
      `INSERT INTO tracking_logs (session_id, latitude, longitude) VALUES ($1, $2, $3)`,
      [sessionId, latitude, longitude]
    );

    // 3. Lấy danh sách POI để đối chiếu bán kính Geofence
    const pois = await this.getPois({ lat: latitude, lng: longitude, lang, accent });
    let triggeredPoi = null;

    for (const poi of pois) {
      const distance = calculateDistanceMeters(
        latitude,
        longitude,
        poi.location.lat,
        poi.location.lng
      );

      // Nếu vị trí nằm trong bán kính Geofence của POI
      if (distance <= poi.radius) {
        // Kiểm tra lịch sử nghe gần nhất của session này đối với POI này
        const cooldownCheck = await pool.query(
          `SELECT played_at FROM play_history 
           WHERE session_id = $1 AND poi_id = $2 
           ORDER BY played_at DESC LIMIT 1`,
          [sessionId, poi.id]
        );

        let canTrigger = true;
        if (cooldownCheck.rows.length > 0) {
          const lastPlayed = new Date(cooldownCheck.rows[0].played_at).getTime();
          const now = new Date().getTime();
          const elapsedSeconds = (now - lastPlayed) / 1000;

          // Nếu khoảng thời gian từ lần nghe trước chưa vượt qua cooldownSeconds -> Bỏ qua không phát lại
          if (elapsedSeconds < poi.cooldownSeconds) {
            canTrigger = false;
          }
        }

        if (canTrigger) {
          triggeredPoi = poi;
          break; // Lấy POI có độ ưu tiên (priority) cao nhất khớp vị trí
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
    await pool.query(query, [sessionId, poiId, triggerType, durationListenedSeconds || 0, completed || false]);
  }
}

module.exports = new MobilePoiService();