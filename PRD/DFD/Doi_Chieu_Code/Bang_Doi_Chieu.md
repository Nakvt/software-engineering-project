# ĐỐI CHIẾU CODE 28 XỬ LÝ – CẬP NHẬT V10

**Commit:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`

**Nguồn:** báo cáo kiểm tra source do GitHub Copilot cung cấp ở commit trên. Bảng giữ nguyên số dòng báo cáo; không suy đoán dòng khi chưa xác định.

| Xử lý | Đường dẫn từ gốc repo | Hàm/route | Dòng | Vai trò |
|---|---|---|---|---|
| 1.1 | `backend/src/routes/authRoutes.js` | `router.post(login/refresh-token/logout)` | 13–15 | Tiếp nhận ba API xác thực |
| 1.1 | `backend/src/controllers/authController.js` | `login/refreshToken/logout` | 4–78 | Nhận request và trả kết quả |
| 1.2 | `backend/src/services/authService.js` | `login/refreshToken` | 20–67 | Điều phối tra cứu admin và refresh token |
| 1.2 | `backend/src/repositories/adminRepository.js` | `repository query` | 4–15 | Tra cứu tài khoản |
| 1.2 | `backend/src/repositories/refreshTokenRepository.js` | `repository query` | 4–22 | Tra cứu token |
| 1.3 | `backend/src/services/authService.js` | `login/refreshToken` | 20–35; 55–70 | Đối chiếu bcrypt, xác minh JWT |
| 1.4 | `backend/src/services/authService.js` | `login/refreshToken/logout` | 32–42; 75–89 | Cấp access/refresh khi login, refresh chỉ cấp access mới, logout xóa refresh |
| 1.4 | `backend/src/repositories/refreshTokenRepository.js` | `token repository` | 4–22 | Ghi/tra cứu/xóa token |
| 1.5 | `backend/src/controllers/authController.js` | `login/refreshToken/logout` | 4–78 | Tạo phản hồi JSON kết quả xác thực |
| 2.1 | `mobile-gps/src/domain/services/poiService.ts` | `getAllPOIs` | 15–27 | Gọi API lấy POI |
| 2.1 | `backend/src/controllers/mobilePoiController.js` | `getPois` | 8–52 | Tiếp nhận tọa độ, ngôn ngữ, giọng |
| 2.2 | `mobile-gps/src/presentation/screens/QRScannerScreen.tsx` | `handleBarCodeScanned` | 31–57 | Quét QR; client hiện gọi getPOIById(data) |
| 2.2 | `mobile-gps/src/domain/services/poiService.ts` | `getPOIById` | 34–61 | Gọi route /pois/:id chưa thấy ở backend |
| 2.2 | `backend/src/services/mobilePoiService.js` | `getPoiByCode` | 111–157 | Backend tra cứu theo code |
| 2.3 | `backend/src/services/mobilePoiService.js` | `getPois/getPoiByCode` | 25–109; 111–157 | Tra cứu POI và chọn nội dung theo ngôn ngữ, fallback tiếng Việt |
| 2.4 | `mobile-gps/src/domain/services/AudioQueueService.ts` | `extractTtsScript/processQueue` | 58–83; 89–136 | Chuẩn bị script TTS, fallback description/name |
| 2.5 | `mobile-gps/src/domain/services/AudioQueueService.ts` | `processQueue/onAudioFinished` | 89–166 | Điều phối phát và gửi listen event khi hoàn tất |
| 2.5 | `mobile-gps/src/libs/audio.ts` | `playTTS/playAudio` | 75–113 | TTS chạy trên thiết bị; phát file audio URL chưa hoạt động thực |
| 3.1 | `mobile-gps/src/presentation/hooks/useGeofencing.ts` | `checkAndTriggerPOI` | 40–78 | Đọc GPS và gửi tracking ping; chưa có debounce ổn định |
| 3.1 | `backend/src/controllers/mobilePoiController.js` | `pingGeofence` | 114–152 | Kiểm tra dữ liệu tọa độ |
| 3.2 | `backend/src/services/mobilePoiService.js` | `getPois` | 25–109 | Đọc thông số vùng POI |
| 3.2 | `database-schema.sql` | `pois` | 34–49 | Định nghĩa vị trí/bán kính POI |
| 3.3 | `backend/src/services/mobilePoiService.js` | `calculateDistanceMeters/processTrackingPing` | 7–21; 190–214 | Haversine, đối chiếu bán kính |
| 3.4 | `backend/src/services/mobilePoiService.js` | `processTrackingPing` | 209–224 | Cooldown dựa play_history.played_at, chưa ngăn lặp trước khi ghi lịch sử |
| 3.5 | `backend/src/services/mobilePoiService.js` | `processTrackingPing` | 160–188; 222–238 | Lưu tracking_logs, cập nhật phiên, trả shouldTrigger |
| 4.0 | `backend/src/routes/sessions.routes.js` | `POST /, heartbeat, offline` | 18–98 | Tạo phiên, heartbeat, đánh dấu offline |
| 4.0 | `mobile-gps/src/domain/services/sessionService.ts` | `session service` | 32–171 | Client quản lý session; heartbeat được báo cáo có lớp 20 giây |
| 5.0 | `mobile-gps/src/domain/services/poiService.ts` | `logListenEvent` | 101–121 | Gửi sự kiện nghe |
| 5.0 | `backend/src/controllers/mobilePoiController.js` | `logListenEvent` | 154–214 | Tiếp nhận/kiểm tra sự kiện |
| 5.0 | `backend/src/services/mobilePoiService.js` | `recordListenEvent` | 243–303 | Ghi play_history |
| 5.0 | `mobile-gps/src/domain/services/AudioQueueService.ts` | `onAudioFinished` | 151–158 | Đang gửi triggerType geofence cho mọi trường hợp |
| 6.1 | `backend/src/routes/admin-poi.routes.js` | `validator/POST` | 24–64; 91–136 | Kiểm tra dữ liệu POI nhận từ CMS |
| 6.2 | `backend/src/services/mobilePoiService.js` | `getPois` | 25–109 | Đọc POI qua public endpoint |
| 6.2 | `web-cms/src/data/api/poiApi.ts` | `getPois` | 42–47 | CMS đang dùng public GET /pois |
| 6.3 | `backend/src/routes/admin-poi.routes.js` | `POST/DELETE/PUT` | 91–229; 232–263; 266–423 | Tạo, xóa, sửa POI; file có hai route PUT trùng path |
| 6.4 | `backend/src/routes/admin-poi.routes.js` | `translate` | 172–201 | Gọi dịch tự động best-effort; thất bại không chặn nghiệp vụ |
| 6.5 | `backend/src/routes/admin-poi.routes.js` | `POST/PUT transaction` | 130–229; 337–423 | Ghi pois/poi_contents và trả kết quả |
| 7.0 | `backend/src/routes/tour.route.js` | `GET/POST/PUT/DELETE` | 7–76; 78–136; 138–229; 232–244 | Có xem, tạo, sửa và xóa tour |
| 7.0 | `backend/src/app.js` | `middleware mount` | 27–29 | Route admin tour đi qua authMiddleware và requireAdmin |
| 7.0 | `web-cms/src/data/api/tourApi.ts` | `tour client API` | 36–74 | CMS gọi API tour |
| 8.1 | `backend/src/routes/admin-analytics.routes.js` | `heatmap/online sessions handlers` | 18–22; 104–108 | Nhận request, chưa hỗ trợ điều kiện lọc động |
| 8.2 | `backend/src/routes/admin-analytics.routes.js` | `online sessions` | 99–121 | Đếm phiên hoạt động trong cửa sổ cố định 5 phút |
| 8.3 | `backend/src/routes/admin-analytics.routes.js` | `dashboard` | 45–95 | Tổng hợp play_history/POI; chưa lọc động |
| 8.4 | `backend/src/routes/admin-analytics.routes.js` | `heatmap` | 18–35 | Tổng hợp tọa độ tracking_logs, chưa lọc thời gian |
| 8.5 | `web-cms/src/data/api/analyticsApi.ts` | `analytics API` | 41–143 | Nhận kết quả và đưa về CMS |
| 8.5 | `web-cms/src/presentation/screens/AdminDashboardScreen.tsx` | `dashboard UI` | chưa xác định trong báo cáo | Hiển thị bảng thống kê; chưa có dòng chính xác |

## Những thay đổi so với V9

- P7: đã có DELETE tour và bảo vệ auth/requireAdmin.
- QR: route mobile chưa khớp backend; chưa coi là end-to-end hoàn tất.
- Geofence: chưa có debounce ổn định; cooldown dựa play_history.
- Audio: TTS trên mobile hoạt động; audio URL fallback.
- Analytics: chưa có filter động; nhãn T81/T82 đã cập nhật ở sơ đồ P8.
- Các phiếu P1–P8 đã bỏ bảng dẫn chứng commit cũ; giữ nguyên dữ liệu vào/ra theo DFD.

## Giới hạn

Đối chiếu bằng báo cáo Copilot do người dùng cung cấp; bản source mới không được đính kèm để xác minh độc lập từng hàm/số dòng. Các khối xử lý DFD là mô hình logic, có thể có luồng được thiết kế nhưng chức năng chưa hoàn tất.
