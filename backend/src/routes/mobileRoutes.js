const express = require('express');
const router = express.Router();
const mobilePoiController = require('../controllers/mobilePoiController');
const pool = require('../config/db');

// 2.1. Lấy danh sách POI trên bản đồ
router.get('/pois', mobilePoiController.getPois);

// 2.2. Quét QR Code lấy chi tiết POI
router.get('/pois/by-code/:code', mobilePoiController.getPoiByCode);

// 2.3. Gửi tọa độ thời gian thực & Ping Geofence
router.post('/tracking/ping', mobilePoiController.pingGeofence);

// 2.4. Ghi nhận nhật ký nghe (Analytics)
router.post('/analytics/listen-event', mobilePoiController.logListenEvent);

/**
 * GET /api/v1/tours
 * Lấy danh sách Tours cho Mobile App
 */
router.get('/tours', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id, 
        t.name, 
        COALESCE(t.description, '') AS description, 
        COUNT(tp.poi_id)::int AS "poiCount",
        t.created_at AS "createdAt"
      FROM tours t
      LEFT JOIN tour_pois tp ON tp.tour_id = t.id
      GROUP BY t.id, t.name, t.description, t.created_at
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ [Mobile API] Lỗi lấy tours:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/tours/:id
 * Lấy chi tiết 1 Tour kèm danh sách POIs (ép latitude/longitude về Number)
 */
router.get('/tours/:id', async (req, res) => {
  const { id } = req.params;
  const { lang = 'vi' } = req.query;

  try {
    const tourResult = await pool.query(
      `SELECT id, name, COALESCE(description, '') AS description FROM tours WHERE id::text = $1`,
      [id.trim()]
    );

    if (tourResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Tour không tồn tại' });
    }

    const tour = tourResult.rows[0];

    const poisQuery = `
      SELECT 
        p.id, 
        p.code, 
        COALESCE(pc.title, p.name_default) AS name, 
        COALESCE(pc.description, '') AS description,
        p.latitude,
        p.longitude,
        p.radius,
        p.image_url AS "imageUrl",
        tp.sequence_order AS "sequenceOrder"
      FROM tour_pois tp
      JOIN pois p ON p.id = tp.poi_id
      LEFT JOIN poi_contents pc ON pc.poi_id = p.id AND LOWER(pc.language_code) = $2
      WHERE tp.tour_id = $1
      ORDER BY tp.sequence_order ASC
    `;

    const poisResult = await pool.query(poisQuery, [tour.id, lang.toLowerCase()]);

    const formattedPois = poisResult.rows.map(poi => ({
      id: poi.id,
      code: poi.code,
      name: poi.name,
      description: poi.description,
      location: {
        lat: Number(poi.latitude),
        lng: Number(poi.longitude),
      },
      radius: Number(poi.radius),
      imageUrl: poi.imageUrl,
      sequenceOrder: poi.sequenceOrder,
    }));

    return res.status(200).json({
      success: true,
      data: {
        ...tour,
        pois: formattedPois,
      },
    });
  } catch (error) {
    console.error('❌ [Mobile API] Lỗi lấy chi tiết tour:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// BẮT BUỘC PHẢI CÓ DÒNG NÀY Ở CUỐI FILE
module.exports = router;