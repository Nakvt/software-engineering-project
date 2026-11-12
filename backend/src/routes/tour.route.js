const express = require('express');
const pool = require('../config/db');

const router = express.Router();

/**
 * 🟢 1. GET /api/v1/tours
 * Lấy danh sách tất cả Tour cho Mobile App (kèm số lượng POI)
 */
router.get('/', async (req, res) => {
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
    console.error('❌ [Mobile] Lỗi lấy danh sách tour:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 🟢 2. GET /api/v1/tours/:id
 * Lấy chi tiết 1 Tour kèm danh sách POI (sắp xếp chuẩn sequence_order & ép kiểu tọa độ Number)
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { lang = 'vi' } = req.query;

  try {
    // 1. Kiểm tra Tour có tồn tại không
    const tourResult = await pool.query(
      `SELECT id, name, COALESCE(description, '') AS description, created_at FROM tours WHERE id::text = $1`,
      [id.trim()]
    );

    if (tourResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Tour không tồn tại' });
    }

    const tour = tourResult.rows[0];

    // 2. Lấy danh sách POIs thuộc Tour theo thứ tự sequence_order
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

    // Format lại dữ liệu cho React Native (ép latitude/longitude về số thực)
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
    console.error('❌ [Mobile] Lỗi lấy chi tiết tour:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;