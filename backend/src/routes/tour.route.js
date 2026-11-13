const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// 1. GET /api/v1/admin/tours - Lấy danh sách Tour đầy đủ tất cả trường
router.get('/', async (_req, res) => {
  try {
    const query = `
      SELECT 
        t.id, 
        t.name, 
        COALESCE(t.description, '') AS description,
        t.estimated_duration_minutes AS "estimatedDurationMinutes",
        t.distance_km AS "distanceKm",
        COALESCE(t.thumbnail_url, '') AS "thumbnailUrl",
        COUNT(tp.poi_id)::int AS "poiCount",
        t.created_at AS "createdAt",
        t.updated_at AS "updatedAt"
      FROM tours t
      LEFT JOIN tour_pois tp ON tp.tour_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ [Admin Tours] Lỗi lấy danh sách:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. GET /api/v1/admin/tours/:id - Lấy chi tiết 1 Tour + danh sách POI theo thứ tự
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const tourRes = await pool.query(
      `SELECT 
        id, 
        name, 
        COALESCE(description, '') AS description,
        estimated_duration_minutes AS "estimatedDurationMinutes",
        distance_km AS "distanceKm",
        COALESCE(thumbnail_url, '') AS "thumbnailUrl",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM tours WHERE id::text = $1`,
      [id.trim()]
    );

    if (tourRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Tour không tồn tại' });
    }

    const poisRes = await pool.query(
      `SELECT p.id, p.code, p.name_default AS name, tp.sequence_order AS "sequenceOrder"
       FROM tour_pois tp
       JOIN pois p ON p.id = tp.poi_id
       WHERE tp.tour_id = $1
       ORDER BY tp.sequence_order ASC`,
      [tourRes.rows[0].id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...tourRes.rows[0],
        pois: poisRes.rows,
      },
    });
  } catch (error) {
    console.error('❌ [Admin Tours] Lỗi lấy chi tiết:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. POST /api/v1/admin/tours - Tạo Tour mới (kèm đầy đủ thông tin + gán POI nếu có)
router.post('/', async (req, res) => {
  const {
    name,
    description = '',
    estimatedDurationMinutes = null,
    distanceKm = null,
    thumbnailUrl = '',
    poiIds = [],
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Tên tour không được để trống' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertRes = await client.query(
      `INSERT INTO tours (name, description, estimated_duration_minutes, distance_km, thumbnail_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING 
         id, name, description,
         estimated_duration_minutes AS "estimatedDurationMinutes",
         distance_km AS "distanceKm",
         thumbnail_url AS "thumbnailUrl",
         created_at AS "createdAt"`,
      [
        name.trim(),
        description.trim(),
        estimatedDurationMinutes !== '' && estimatedDurationMinutes !== null ? Number(estimatedDurationMinutes) : null,
        distanceKm !== '' && distanceKm !== null ? Number(distanceKm) : null,
        thumbnailUrl ? thumbnailUrl.trim() : null,
      ]
    );

    const newTour = insertRes.rows[0];

    if (Array.isArray(poiIds) && poiIds.length > 0) {
      for (let i = 0; i < poiIds.length; i++) {
        const poiId = typeof poiIds[i] === 'object' ? poiIds[i].id || poiIds[i].poiId : poiIds[i];
        await client.query(
          `INSERT INTO tour_pois (tour_id, poi_id, sequence_order) VALUES ($1, $2, $3)`,
          [newTour.id, poiId, i + 1]
        );
      }
    }

    await client.query('COMMIT');
    return res.status(201).json({ success: true, data: newTour });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [Admin Tours] Lỗi tạo tour:', error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// 4. PUT /api/v1/admin/tours/:id - Sửa toàn bộ thông tin Tour & thứ tự POI
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    estimatedDurationMinutes,
    distanceKm,
    thumbnailUrl,
    poiIds,
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE tours 
       SET 
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         estimated_duration_minutes = $3,
         distance_km = $4,
         thumbnail_url = $5,
         updated_at = NOW()
       WHERE id::text = $6`,
      [
        name !== undefined ? name.trim() : null,
        description !== undefined ? description.trim() : null,
        estimatedDurationMinutes !== '' && estimatedDurationMinutes !== null && estimatedDurationMinutes !== undefined
          ? Number(estimatedDurationMinutes)
          : null,
        distanceKm !== '' && distanceKm !== null && distanceKm !== undefined
          ? Number(distanceKm)
          : null,
        thumbnailUrl !== undefined && thumbnailUrl !== '' ? thumbnailUrl.trim() : null,
        id.trim(),
      ]
    );

    if (Array.isArray(poiIds)) {
      await client.query(`DELETE FROM tour_pois WHERE tour_id::text = $1`, [id.trim()]);
      for (let i = 0; i < poiIds.length; i++) {
        const poiId = typeof poiIds[i] === 'object' ? poiIds[i].id || poiIds[i].poiId : poiIds[i];
        await client.query(
          `INSERT INTO tour_pois (tour_id, poi_id, sequence_order) VALUES ($1, $2, $3)`,
          [id.trim(), poiId, i + 1]
        );
      }
    }

    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: 'Cập nhật toàn bộ Tour thành công' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [Admin Tours] Lỗi cập nhật tour:', error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// Hỗ trợ thêm endpoint PUT /:id/pois cho nút gán POI riêng
router.put('/:id/pois', async (req, res) => {
  const { id } = req.params;
  const poiIds = req.body.poiIds || req.body.pois || req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM tour_pois WHERE tour_id::text = $1`, [id.trim()]);

    if (Array.isArray(poiIds)) {
      for (let i = 0; i < poiIds.length; i++) {
        const poiId = typeof poiIds[i] === 'object' ? poiIds[i].id || poiIds[i].poiId : poiIds[i];
        await client.query(
          `INSERT INTO tour_pois (tour_id, poi_id, sequence_order) VALUES ($1, $2, $3)`,
          [id.trim(), poiId, i + 1]
        );
      }
    }

    await client.query(`UPDATE tours SET updated_at = NOW() WHERE id::text = $1`, [id.trim()]);
    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: 'Cập nhật danh sách POI cho Tour thành công' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [Admin Tours] Lỗi gán POI:', error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// 5. DELETE /api/v1/admin/tours/:id - Xóa Tour
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM tour_pois WHERE tour_id::text = $1`, [id.trim()]);
    await pool.query(`DELETE FROM tours WHERE id::text = $1`, [id.trim()]);
    return res.status(200).json({ success: true, message: 'Đã xóa Tour' });
  } catch (error) {
    console.error('❌ [Admin Tours] Lỗi xóa tour:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;