const mobilePoiService = require('../services/mobilePoiService');

class MobilePoiController {
  // 2.1. GET /api/v1/pois - Lấy danh sách POI trên bản đồ
  async getPois(req, res) {
    try {
      const { lat, lng, lang = 'vi', accent = 'neutral' } = req.query;

      const parsedLat = lat !== undefined ? parseFloat(lat) : null;
      const parsedLng = lng !== undefined ? parseFloat(lng) : null;

      if (
        (lat !== undefined && (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90)) ||
        (lng !== undefined && (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180))
      ) {
        return res.status(400).json({
          success: false,
          data: null,
          error: 'Tọa độ lat/lng không hợp lệ',
          timestamp: new Date().toISOString(),
        });
      }

      const pois = await mobilePoiService.getPois({
        lat: parsedLat,
        lng: parsedLng,
        lang: lang.trim(),
        accent: accent.trim(),
      });

      return res.status(200).json({
        success: true,
        data: pois,
        error: null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in getPois:', error);
      return res.status(500).json({
        success: false,
        data: null,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 2.2. GET /api/v1/pois/by-code/:code - Quét QR Code lấy chi tiết POI
  async getPoiByCode(req, res) {
    try {
      const { code } = req.params;
      const { lang = 'vi', accent = 'neutral' } = req.query;

      if (!code || code.trim() === '') {
        return res.status(400).json({
          success: false,
          data: null,
          error: 'Mã POI không được để trống',
          timestamp: new Date().toISOString(),
        });
      }

      const poi = await mobilePoiService.getPoiByCode(code.trim(), lang.trim(), accent.trim());

      if (!poi) {
        return res.status(404).json({
          success: false,
          data: null,
          error: 'Không tìm thấy điểm tham quan với mã này',
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json({
        success: true,
        data: poi,
        error: null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in getPoiByCode:', error);
      return res.status(500).json({
        success: false,
        data: null,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 2.3. POST /api/v1/tracking/ping - Gửi tọa độ & kiểm tra Geofence
  async pingGeofence(req, res) {
    try {
      const { sessionId, latitude, longitude, lang = 'vi', accent = 'neutral' } = req.body;

      if (!sessionId || typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({
          success: false,
          data: null,
          error: 'Thiếu hoặc sai định dạng sessionId, latitude, longitude',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await mobilePoiService.processTrackingPing({
        sessionId,
        latitude,
        longitude,
        lang: lang.trim(),
        accent: accent.trim(),
      });

      return res.status(200).json({
        success: true,
        data: result,
        error: null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in pingGeofence:', error);
      return res.status(500).json({
        success: false,
        data: null,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 2.4. POST /api/v1/analytics/listen-event - Ghi nhận nhật ký nghe
  async logListenEvent(req, res) {
    try {
      const { sessionId, poiId, triggerType, durationListenedSeconds = 0, completed = false } = req.body;

      if (!sessionId || !poiId || !['geofence', 'qr_code', 'manual'].includes(triggerType)) {
        return res.status(400).json({
          success: false,
          data: null,
          error: 'Dữ liệu sự kiện nghe không hợp lệ (triggerType phải là geofence, qr_code, hoặc manual)',
          timestamp: new Date().toISOString(),
        });
      }

      await mobilePoiService.recordListenEvent({
        sessionId,
        poiId,
        triggerType,
        durationListenedSeconds,
        completed,
      });

      return res.status(200).json({
        success: true,
        data: { message: 'Đã ghi nhận nhật ký nghe thành công' },
        error: null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in logListenEvent:', error);
      return res.status(500).json({
        success: false,
        data: null,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

module.exports = new MobilePoiController();