# ĐỐI CHIẾU TỪNG BƯỚC B1–B3 VỚI CODE — 28 XỬ LÝ DFD

- Commit source Copilot đọc gần nhất: `863a8a32336e5895e85ad3321db7b480d229549f`.
- Khoảng dòng tham chiếu: báo cáo Copilot V10 tại `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`; báo cáo mới xác nhận chức năng nhưng không cung cấp số dòng chi tiết cho từng B1–B3. **Cần xác minh lại số dòng ngay trong VS Code ở commit hiện tại trước khi bảo vệ.**
- Mã luồng DFD là **mô hình logic**; B1–B3 dưới đây là diễn giải luồng code, **không khẳng định tồn tại ba hàm độc lập**.
- Không có sửa đổi source code. Các hạn chế được đánh dấu rõ để tránh nhầm thiết kế với chức năng đã chạy.

## Ví dụ trình bày trước giảng viên
**1.1:** B1 nhận POST qua `backend/src/routes/authRoutes.js`; B2 controller lấy/kiểm tra request trong `backend/src/controllers/authController.js`; B3 controller gọi service và trả JSON. Khi hỏi “B2 nằm ở đâu?”, mở đúng file controller và chỉ nhánh login/refresh/logout.

---

## Xử lý 1.1 – Tiếp nhận yêu cầu xác thực

**Phiếu:** `So_Do/P1/Kiem_Soat/Kiem_Soat_1_1.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận POST /auth/login, /auth/refresh-token hoặc /auth/logout | `backend/src/routes/authRoutes.js` — router.post (login/refresh-token/logout) — 13–15 |
| B2 | Đọc và kiểm tra trường dữ liệu request của từng thao tác | `backend/src/controllers/authController.js` — login / refreshToken / logout — 4–78 |
| B3 | Gọi service xác thực và trả HTTP JSON | `backend/src/controllers/authController.js` — login / refreshToken / logout — 4–78<br>`backend/src/services/authService.js` — login / refreshToken / logout — 20–89 |


## Xử lý 1.2 – Tra cứu tài khoản và token

**Phiếu:** `So_Do/P1/Kiem_Soat/Kiem_Soat_1_2.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận username hoặc refresh token cần tra cứu | `backend/src/services/authService.js` — login / refreshToken — 20–67 |
| B2 | Tra cứu bản ghi admin đang hoạt động hoặc refresh token đã lưu | `backend/src/repositories/adminRepository.js` — truy vấn tài khoản — 4–15<br>`backend/src/repositories/refreshTokenRepository.js` — truy vấn token — 4–22 |
| B3 | Trả bản ghi tra cứu được cho bước xác minh | `backend/src/services/authService.js` — login / refreshToken — 20–67 |


## Xử lý 1.3 – Kiểm tra mật khẩu hoặc token

**Phiếu:** `So_Do/P1/Kiem_Soat/Kiem_Soat_1_3.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận tài khoản/hash và mật khẩu hoặc refresh token | `backend/src/services/authService.js` — login / refreshToken — 20–35; 55–70 |
| B2 | Xác minh mật khẩu bcrypt hoặc chữ ký/hạn JWT | `backend/src/services/authService.js` — login / refreshToken — 20–35; 55–70 |
| B3 | Nếu sai trả lỗi; nếu đúng chuyển sang tạo token hoặc xử lý đăng xuất | `backend/src/services/authService.js` — login / refreshToken — 20–42; 55–70 |


## Xử lý 1.4 – Cấp, làm mới hoặc thu hồi token

**Phiếu:** `So_Do/P1/Kiem_Soat/Kiem_Soat_1_4.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận trạng thái login/refresh/logout hợp lệ | `backend/src/services/authService.js` — login / refreshToken / logout — 32–42; 55–89 |
| B2 | Tạo access/refresh khi login; refresh chỉ cấp access; logout hủy refresh | `backend/src/services/authService.js` — login / refreshToken / logout — 32–42; 55–89 |
| B3 | Ghi hoặc xóa refresh token trong database, trả token/trạng thái | `backend/src/repositories/refreshTokenRepository.js` — lưu/tra cứu/xóa refresh token — 4–22<br>`backend/src/services/authService.js` — login / refreshToken / logout — 32–89 |


## Xử lý 1.5 – Tổng hợp và trả kết quả

**Phiếu:** `So_Do/P1/Kiem_Soat/Kiem_Soat_1_5.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận token mới hoặc lỗi nghiệp vụ | `backend/src/controllers/authController.js` — login / refreshToken / logout — 4–78 |
| B2 | Định dạng mã trạng thái và phản hồi JSON | `backend/src/controllers/authController.js` — login / refreshToken / logout — 4–78 |
| B3 | Gửi kết quả về Web CMS / quản trị viên | `backend/src/controllers/authController.js` — login / refreshToken / logout — 4–78 |


## Xử lý 2.1 – Tiếp nhận tra cứu POI

**Phiếu:** `So_Do/P2/Kiem_Soat/Kiem_Soat_2_1.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Mobile gửi yêu cầu danh sách POI | `mobile-gps/src/domain/services/poiService.ts` — getAllPOIs — 15–27 |
| B2 | Backend đọc query lat/lng/lang/accent | `backend/src/controllers/mobilePoiController.js` — getPois — 8–52 |
| B3 | Chuyển tiêu chí tra cứu xuống nghiệp vụ POI | `backend/src/controllers/mobilePoiController.js` — getPois — 8–52 |


## Xử lý 2.2 – Tiếp nhận mã QR POI

**Phiếu:** `So_Do/P2/Kiem_Soat/Kiem_Soat_2_2.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Camera quét và nhận chuỗi QR | `mobile-gps/src/presentation/screens/QRScannerScreen.tsx` — handleBarCodeScanned — 31–57 |
| B2 | Mobile hiện chuyển nguyên chuỗi sang getPOIById | `mobile-gps/src/presentation/screens/QRScannerScreen.tsx` — handleBarCodeScanned — 31–57<br>`mobile-gps/src/domain/services/poiService.ts` — getPOIById — 34–61 |
| B3 | Đáng ra tra cứu theo code, nhưng luồng QR end-to-end chưa nối | `backend/src/services/mobilePoiService.js` — getPoiByCode — 111–157<br>`backend/src/routes/mobileRoutes.js` — GET /pois/by-code/:code — 6–16 |


## Xử lý 2.3 – Tra cứu POI và chọn ngôn ngữ

**Phiếu:** `So_Do/P2/Kiem_Soat/Kiem_Soat_2_3.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận tiêu chí vị trí, ngôn ngữ, accent hoặc mã POI | `backend/src/controllers/mobilePoiController.js` — getPois / getPoiByCode — 8–111 |
| B2 | Truy vấn POI và nội dung; chọn ngôn ngữ, fallback tiếng Việt | `backend/src/services/mobilePoiService.js` — getPois / getPoiByCode — 25–109; 111–157 |
| B3 | Đóng gói metadata và nội dung trả về mobile | `backend/src/controllers/mobilePoiController.js` — getPois / getPoiByCode — 8–111 |


## Xử lý 2.4 – Chuẩn bị nội dung thuyết minh

**Phiếu:** `So_Do/P2/Kiem_Soat/Kiem_Soat_2_4.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận POI và các trường nội dung được trả về | `mobile-gps/src/domain/services/AudioQueueService.ts` — processQueue — 89–136 |
| B2 | Chọn TTS script, bản dịch, description hoặc name theo fallback | `mobile-gps/src/domain/services/AudioQueueService.ts` — extractTtsScript — 58–83 |
| B3 | Chuyển text/script cho phần điều phối phát | `mobile-gps/src/domain/services/AudioQueueService.ts` — processQueue — 89–136 |


## Xử lý 2.5 – Điều phối phát audio/TTS

**Phiếu:** `So_Do/P2/Kiem_Soat/Kiem_Soat_2_5.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận nội dung POI từ hàng đợi và quyết định lượt phát | `mobile-gps/src/domain/services/AudioQueueService.ts` — processQueue — 89–136 |
| B2 | Gọi TTS on-device hoặc nhánh audio URL fallback | `mobile-gps/src/libs/audio.ts` — playTTS / playAudio — 75–113 |
| B3 | Khi kết thúc, giải phóng lượt phát và yêu cầu ghi listen event | `mobile-gps/src/domain/services/AudioQueueService.ts` — onAudioFinished — 143–166<br>`mobile-gps/src/domain/services/poiService.ts` — logListenEvent — 101–121 |


## Xử lý 3.1 – Tiếp nhận và chuẩn hóa GPS

**Phiếu:** `So_Do/P3/Kiem_Soat/Kiem_Soat_3_1.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Xin quyền vị trí, lấy GPS và theo dõi cập nhật foreground | `mobile-gps/src/presentation/hooks/useGeofencing.ts` — checkAndTriggerPOI / hook — 40–78; 109–132 |
| B2 | Gửi tọa độ/session qua API, backend kiểm tra tham số | `mobile-gps/src/presentation/hooks/useGeofencing.ts` — checkAndTriggerPOI — 40–78<br>`backend/src/controllers/mobilePoiController.js` — pingGeofence — 114–152 |
| B3 | Chuyển GPS hợp lệ sang nghiệp vụ geofence | `backend/src/controllers/mobilePoiController.js` — pingGeofence — 114–152 |


## Xử lý 3.2 – Tra cứu thông số vùng POI

**Phiếu:** `So_Do/P3/Kiem_Soat/Kiem_Soat_3_2.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận tọa độ yêu cầu xác định vùng | `backend/src/services/mobilePoiService.js` — processTrackingPing — 160–214 |
| B2 | Tra POI và thông số geofence từ DB | `backend/src/services/mobilePoiService.js` — getPois / processTrackingPing — 25–109; 190–214<br>`database-schema.sql` — bảng pois — 34–49 |
| B3 | Chuyển danh sách vùng và tham số để tính khoảng cách | `backend/src/services/mobilePoiService.js` — processTrackingPing — 190–214 |


## Xử lý 3.3 – Xác định POI trong bán kính

**Phiếu:** `So_Do/P3/Kiem_Soat/Kiem_Soat_3_3.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận GPS và tọa độ các POI | `backend/src/services/mobilePoiService.js` — processTrackingPing — 190–214 |
| B2 | Tính khoảng cách cung lớn bằng Haversine | `backend/src/services/mobilePoiService.js` — calculateDistanceMeters — 7–21 |
| B3 | So sánh khoảng cách với radius và xác định POI trong vùng | `backend/src/services/mobilePoiService.js` — processTrackingPing — 190–214 |


## Xử lý 3.4 – Kiểm tra cooldown

**Phiếu:** `So_Do/P3/Kiem_Soat/Kiem_Soat_3_4.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận các POI đã vượt qua kiểm tra khoảng cách | `backend/src/services/mobilePoiService.js` — processTrackingPing — 209–224 |
| B2 | Đọc thời gian nghe gần nhất trong play_history để xét cooldown | `backend/src/services/mobilePoiService.js` — processTrackingPing — 209–224 |
| B3 | Trả quyết định có thể kích hoạt hoặc tạm chặn | `backend/src/services/mobilePoiService.js` — processTrackingPing — 209–224 |


## Xử lý 3.5 – Ghi GPS và phát hành kết quả

**Phiếu:** `So_Do/P3/Kiem_Soat/Kiem_Soat_3_5.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận session, GPS và kết quả kiểm tra kích hoạt | `backend/src/services/mobilePoiService.js` — processTrackingPing — 160–188; 222–238 |
| B2 | Ghi tracking_logs và cập nhật hoạt động user_sessions | `backend/src/services/mobilePoiService.js` — processTrackingPing — 160–188 |
| B3 | Trả shouldTrigger/POI về mobile cho hàng đợi phát | `backend/src/services/mobilePoiService.js` — processTrackingPing — 222–238<br>`backend/src/controllers/mobilePoiController.js` — pingGeofence — 114–152 |


## Xử lý 4.0 – Quản lý phiên tham quan

**Phiếu:** `So_Do/P4/Kiem_Soat/Kiem_Soat_4_0.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Mobile tạo phiên hoặc báo heartbeat/offline | `mobile-gps/src/domain/services/sessionService.ts` — session service — 32–171<br>`backend/src/routes/sessions.routes.js` — POST /sessions — 18–98 |
| B2 | Xác minh phiên và cập nhật trạng thái hoạt động | `backend/src/routes/sessions.routes.js` — POST /:id/heartbeat; /:id/offline — 18–98<br>`mobile-gps/src/presentation/hooks/useOnlineSession.ts` — useOnlineSession — chưa chốt dòng |
| B3 | Lưu user_sessions và trả sessionId/trạng thái | `backend/src/routes/sessions.routes.js` — sessions handlers — 18–98 |


## Xử lý 5.0 – Ghi nhận lịch sử nghe

**Phiếu:** `So_Do/P5/Kiem_Soat/Kiem_Soat_5_0.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Khi phát kết thúc, mobile tạo listen event | `mobile-gps/src/domain/services/AudioQueueService.ts` — onAudioFinished — 143–166<br>`mobile-gps/src/domain/services/poiService.ts` — logListenEvent — 101–121 |
| B2 | Backend kiểm tra POI, session và chuẩn hóa event | `backend/src/controllers/mobilePoiController.js` — logListenEvent — 154–214 |
| B3 | Ghi dữ liệu lịch sử vào play_history và trả kết quả | `backend/src/services/mobilePoiService.js` — recordListenEvent — 243–303 |


## Xử lý 6.1 – Tiếp nhận, kiểm tra dữ liệu

**Phiếu:** `So_Do/P6/Kiem_Soat/Kiem_Soat_6_1.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | CMS gửi yêu cầu tạo/sửa POI hoặc nội dung | `web-cms/src/data/api/poiApi.ts` — POI API client — chưa chốt dòng<br>`backend/src/routes/admin-poi.routes.js` — POST /admin/pois — 91–136 |
| B2 | Validator kiểm tra code, tên, tọa độ, radius và dữ liệu content | `backend/src/routes/admin-poi.routes.js` — validator — 24–64 |
| B3 | Chuyển trường hợp hợp lệ sang xử lý tạo/sửa/xóa | `backend/src/routes/admin-poi.routes.js` — POST / PUT / DELETE — 91–136; 232–423 |


## Xử lý 6.2 – Tra cứu POI hiện có

**Phiếu:** `So_Do/P6/Kiem_Soat/Kiem_Soat_6_2.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | CMS yêu cầu đọc danh sách POI hiện có | `web-cms/src/data/api/poiApi.ts` — getPois — 42–47 |
| B2 | Dùng public GET /pois lấy dữ liệu POI hiện có | `backend/src/services/mobilePoiService.js` — getPois — 25–109 |
| B3 | Trả danh sách về CMS để hiển thị/chỉnh sửa | `web-cms/src/data/api/poiApi.ts` — getPois — 42–47 |


## Xử lý 6.3 – Xử lý tạo/sửa/xóa POI

**Phiếu:** `So_Do/P6/Kiem_Soat/Kiem_Soat_6_3.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận yêu cầu tạo, cập nhật hoặc xóa POI | `backend/src/routes/admin-poi.routes.js` — POST /: ; PUT /:id ; DELETE /:id — 91–136; 232–263; 266–423 |
| B2 | Xử lý dữ liệu POI và nhánh tạo/sửa/xóa | `backend/src/routes/admin-poi.routes.js` — POST / DELETE / PUT — 91–229; 232–263; 266–423 |
| B3 | Chuyển kết quả cập nhật/xóa sang lưu và phản hồi | `backend/src/routes/admin-poi.routes.js` — POST / PUT / DELETE — 130–229; 232–263; 266–423 |


## Xử lý 6.4 – Chuẩn bị/dịch nội dung

**Phiếu:** `So_Do/P6/Kiem_Soat/Kiem_Soat_6_4.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận nội dung nguồn cần tạo bản dịch | `backend/src/routes/admin-poi.routes.js` — POST /admin/pois — 114–180 |
| B2 | Gọi thư viện Google Translate wrapper để dịch | `backend/src/routes/admin-poi.routes.js` — translate — 172–201 |
| B3 | Nếu có bản dịch thì chuyển lưu; nếu lỗi vẫn cho tiếp tục | `backend/src/routes/admin-poi.routes.js` — translate + xử lý warning — 172–201 |


## Xử lý 6.5 – Lưu và trả kết quả

**Phiếu:** `So_Do/P6/Kiem_Soat/Kiem_Soat_6_5.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận POI/contents đã được validate hoặc dịch | `backend/src/routes/admin-poi.routes.js` — POST / PUT — 130–229; 337–423 |
| B2 | Thực hiện transaction và ghi bảng pois, poi_contents | `backend/src/routes/admin-poi.routes.js` — POST / PUT transaction — 130–229; 337–423 |
| B3 | Trả response JSON cho CMS hoặc rollback/trả lỗi | `backend/src/routes/admin-poi.routes.js` — POST / PUT handlers — 130–229; 337–423 |


## Xử lý 7.0 – Quản lý tour

**Phiếu:** `So_Do/P7/Kiem_Soat/Kiem_Soat_7_0.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | CMS gọi API quản lý tour; backend kiểm tra JWT/role | `web-cms/src/data/api/tourApi.ts` — tour API methods — 36–74<br>`backend/src/app.js` — app.use admin tours + middlewares — 27–29 |
| B2 | Xử lý đọc, tạo, cập nhật, gán POI hoặc xóa tour | `backend/src/routes/tour.route.js` — GET / POST / PUT / DELETE — 7–76; 78–136; 138–229; 232–244 |
| B3 | Ghi tours/tour_pois và trả kết quả HTTP | `backend/src/routes/tour.route.js` — POST / PUT / DELETE — 78–244 |


## Xử lý 8.1 – Tiếp nhận yêu cầu thống kê

**Phiếu:** `So_Do/P8/Kiem_Soat/Kiem_Soat_8_1.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Admin truy cập dashboard, heatmap hoặc phiên online | `web-cms/src/data/api/analyticsApi.ts` — dashboard / heatmap / online sessions API — 41–143 |
| B2 | Backend xác định endpoint và kiểm tra tham số | `backend/src/routes/admin-analytics.routes.js` — heatmap / online session handlers — 18–22; 104–108 |
| B3 | Chuyển yêu cầu thống kê mặc định đến các truy vấn tương ứng | `backend/src/routes/admin-analytics.routes.js` — handlers cho heatmap/dashboard/online — 18–121 |


## Xử lý 8.2 – Tổng hợp phiên hoạt động

**Phiếu:** `So_Do/P8/Kiem_Soat/Kiem_Soat_8_2.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận yêu cầu đếm phiên đang hoạt động | `backend/src/routes/admin-analytics.routes.js` — online-sessions handler — 99–121 |
| B2 | Truy vấn user_sessions theo cửa sổ hoạt động cố định 5 phút | `backend/src/routes/admin-analytics.routes.js` — online-sessions aggregation — 99–121 |
| B3 | Trả thống kê phiên cho CMS | `backend/src/routes/admin-analytics.routes.js` — online-sessions handler — 99–121 |


## Xử lý 8.3 – Thống kê lượt nghe & POI

**Phiếu:** `So_Do/P8/Kiem_Soat/Kiem_Soat_8_3.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận request thống kê lượt nghe và POI | `backend/src/routes/admin-analytics.routes.js` — dashboard handler — 45–95 |
| B2 | Tổng hợp play_history, thời lượng nghe, top POI | `backend/src/routes/admin-analytics.routes.js` — dashboard SQL — 45–95 |
| B3 | Trả chỉ số dashboard dưới dạng JSON | `backend/src/routes/admin-analytics.routes.js` — dashboard handler — 45–95 |


## Xử lý 8.4 – Phân tích vị trí/heatmap

**Phiếu:** `So_Do/P8/Kiem_Soat/Kiem_Soat_8_4.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | Nhận yêu cầu heatmap vị trí | `backend/src/routes/admin-analytics.routes.js` — heatmap handler — 18–35 |
| B2 | Nhóm tracking_logs theo latitude/longitude để tính mật độ | `backend/src/routes/admin-analytics.routes.js` — heatmap SQL — 18–35 |
| B3 | Trả các điểm heatmap cho CMS | `backend/src/routes/admin-analytics.routes.js` — heatmap handler — 18–35 |


## Xử lý 8.5 – Kết xuất báo cáo

**Phiếu:** `So_Do/P8/Kiem_Soat/Kiem_Soat_8_5.md`

| Bước | Nội dung | File / hàm / dòng tham chiếu |
|---|---|---|
| B1 | CMS gọi các API đọc thống kê và nhận JSON | `web-cms/src/data/api/analyticsApi.ts` — getDashboard / getHeatmap / getOnlineSessions — 41–143 |
| B2 | Chuyển JSON thành cấu trúc dữ liệu hiển thị, xử lý fallback | `web-cms/src/data/api/analyticsApi.ts` — analytics API mapping/fallback — 41–143 |
| B3 | Hiển thị dashboard, heatmap, session cho quản trị viên | `web-cms/src/presentation/screens/AdminDashboardScreen.tsx` — dashboard UI — chưa xác định số dòng |

