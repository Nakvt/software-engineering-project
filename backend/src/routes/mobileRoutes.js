const express = require('express');
const router = express.Router();
const mobilePoiController = require('../controllers/mobilePoiController');

// 2.1. Lấy danh sách POI trên bản đồ
router.get('/pois', mobilePoiController.getPois);

// 2.2. Quét QR Code lấy chi tiết POI
router.get('/pois/by-code/:code', mobilePoiController.getPoiByCode);

// 2.3. Gửi tọa độ thời gian thực & Ping Geofence
router.post('/tracking/ping', mobilePoiController.pingGeofence);

// 2.4. Ghi nhận nhật ký nghe (Analytics)
router.post('/analytics/listen-event', mobilePoiController.logListenEvent);

// BẮT BUỘC PHẢI CÓ DÒNG NÀY Ở CUỐI FILE
module.exports = router;