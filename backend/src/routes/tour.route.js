const express = require('express');
const pool = require('../config/db');

const router = express.Router();

/**
 * GET /api/v1/admin/tours
 * Lấy danh sách Tour từ CSDL Neon
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id, 
        t.name, 
        COALESCE(t.description, '') AS description, 
        true AS "isActive",
        COUNT(tp.poi_id)::int AS "poiCount"
      FROM tours t
      LEFT JOIN tour_pois tp ON tp.tour_id = t.id
      GROUP BY t.id, t.name, t.description, t.created_at
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Lỗi lấy danh sách tour:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/admin/tours/:id/pois
 * Lấy danh sách POI của Tour theo thứ tự sequence_order
 */
router.get('/:id/pois', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT p.id, p.code, p.name_default AS name, tp.sequence_order AS "orderIndex"
      FROM tour_pois tp
      JOIN pois p ON p.id = tp.poi_id
      WHERE tp.tour_id = $1
      ORDER BY tp.sequence_order ASC
    `;
    const result = await pool.query(query, [id]);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Lỗi lấy danh sách POIs của tour:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/admin/tours
 * Tạo mới Tour + Gán danh sách POI kèm sequence_order
 */
router.post('/', async (req, res) => {
  const { name, description, poiIds } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, error: 'Tên tour không được để trống' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const tourResult = await client.query(
      `INSERT INTO tours (name, description)
       VALUES ($1, $2)
       RETURNING id, name, description`,
      [name.trim(), description ? description.trim() : '']
    );
    const createdTour = tourResult.rows[0];

    if (Array.isArray(poiIds) && poiIds.length > 0) {
      for (let i = 0; i < poiIds.length; i++) {
        await client.query(
          `INSERT INTO tour_pois (tour_id, poi_id, sequence_order)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [createdTour.id, poiIds[i], i + 1]
        );
      }
    }

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      data: {
        ...createdTour,
        isActive: true,
        poiCount: Array.isArray(poiIds) ? poiIds.length : 0
      }
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Lỗi tạo tour:', error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    if (client) client.release();
  }
});

/**
 * 💡 PUT /api/v1/admin/tours/:id/pois
 * Cập nhật danh sách POI cho Tour có sẵn với sequence_order
 */
router.put('/:id/pois', async (req, res) => {
  const { id } = req.params;
  const { poiIds } = req.body;

  if (!Array.isArray(poiIds)) {
    return res.status(400).json({ success: false, error: 'Danh sách poiIds không hợp lệ' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // 1. Xóa liên kết cũ
    await client.query('DELETE FROM tour_pois WHERE tour_id = $1', [id]);

    // 2. Chèn lại liên kết mới kèm cột sequence_order bắt buộc
    if (poiIds.length > 0) {
      for (let i = 0; i < poiIds.length; i++) {
        await client.query(
          `INSERT INTO tour_pois (tour_id, poi_id, sequence_order)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [id, poiIds[i], i + 1]
        );
      }
    }

    await client.query('COMMIT');
    return res.status(200).json({
      success: true,
      message: 'Cập nhật danh sách POI cho Tour thành công',
      poiCount: poiIds.length
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Lỗi cập nhật POIs cho tour:', error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    if (client) client.release();
  }
});

// DELETE /api/v1/admin/tours/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Xóa các bản ghi liên kết trong bảng tour_pois trước
    await client.query('DELETE FROM tour_pois WHERE tour_id = $1', [id]);

    // 2. Xóa Tour trong bảng tours
    const result = await client.query('DELETE FROM tours WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Không tìm thấy Tour để xóa',
      });
    }

    await client.query('COMMIT');
    return res.status(200).json({
      success: true,
      data: { id },
      message: 'Xóa Tour thành công',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi khi xóa tour:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Lỗi hệ thống khi xóa Tour',
    });
  } finally {
    client.release();
  }
});

// PUT /api/v1/admin/tours/:id - Cập nhật Tour & Danh sách POI thuộc Tour
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, poiIds } = req.body; // poiIds là mảng id POI theo đúng thứ tự [poi1_id, poi2_id, ...]
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Cập nhật thông tin Tour
    const tourResult = await client.query(
      `UPDATE tours SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [name, description, id]
    );

    if (tourResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Không tìm thấy Tour',
      });
    }

    // 2. Nếu có truyền danh sách poiIds, cập nhật lại bảng liên kết tour_pois
    if (Array.isArray(poiIds)) {
      // Xóa liên kết cũ
      await client.query('DELETE FROM tour_pois WHERE tour_id = $1', [id]);

      // Thêm lại liên kết mới với order_index tương ứng
      for (let i = 0; i < poiIds.length; i++) {
        await client.query(
          `INSERT INTO tour_pois (tour_id, poi_id, sequence_order) VALUES ($1, $2, $3)`,
          [id, poiIds[i], i + 1]
        );
      }
    }

    await client.query('COMMIT');
    return res.status(200).json({
      success: true,
      data: tourResult.rows[0],
      message: 'Cập nhật Tour thành công',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi cập nhật Tour:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Lỗi hệ thống khi cập nhật Tour',
    });
  } finally {
    client.release();
  }
});
module.exports = router;