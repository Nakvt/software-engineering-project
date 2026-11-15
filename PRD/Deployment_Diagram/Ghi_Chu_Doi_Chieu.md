# Đối chiếu chỉnh sửa Deployment Diagram

Nguồn: báo cáo Copilot tại commit `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`; không truy cập hay chạy source ở máy người dùng.

| Vị trí template gốc | Cách xử lý | Bằng chứng báo cáo |
|---|---|---|
| Admin Device -> Vercel | Giữ HTTPS Browser -> CMS | `web-cms/package.json`, `web-cms/vercel.json` |
| Web CMS -> Render | Giữ HTTPS REST API; Vercel URL là cấu hình chưa kiểm thử | `web-cms/src/data/api/apiClient.ts` |
| Tourist Mobile Device -> Render | Giữ HTTPS REST API | `mobile-gps/src/config/Api.ts` (Render URL) |
| Render -> Map & Location Services | **Bỏ** vì backend không gọi OSM/Leaflet | `mobile-gps/src/presentation/screens/MapScreen.tsx` 129–143 |
| Mobile -> OpenStreetMap | **Thêm** HTTPS tải bản đồ từ WebView | `mobile-gps/src/presentation/screens/MapScreen.tsx` 129–143 |
| Leaflet Maps nằm cùng external service | **Chuyển thành thư viện client** trong Expo/WebView | `MapScreen.tsx` tải Leaflet từ CDN |
| Backend -> Translate | **Thêm** translation service best-effort | `backend/src/routes/admin-poi.routes.js` 172–201 |
| TTS | Giữ on-device; không khẳng định audio file URL phát được | `mobile-gps/src/libs/audio.ts` 75–113 |
| GPS & QR là artifact | Đổi thành on-device features / component phù hợp | `expo-location`, `expo-camera` từ mobile |
| Database: POI, Tour, Users, GPS, QR | **Thay bằng** PostgreSQL database / 10 bảng | `database-schema.sql` 5–118: `categories`, `tours`, `user_sessions`, `pois`, `tour_pois`, `poi_contents`, `tracking_logs`, `play_history`, `admins`, `admin_refresh_tokens` |
| PostgreSQL (SSL) | Đổi nhãn 'SSL for Neon', SSL tùy runtime | `backend/src/config/db.js` |
| Render, Vercel, Neon nodes | Giữ template nhưng đánh dấu cấu hình/runtime chưa kiểm tra | source hiện chỉ có cấu hình/URL, không bằng chứng runtime |

Lưu ý: Dịch vụ dịch được gọi qua `@vitalets/google-translate-api`; không nên khẳng định chắc đây là Google Cloud Translate API trả phí. Tên 'Google Translate API*' trong hình là nhãn logic theo template, không phải kết luận SDK sử dụng.

**Chưa đưa QR generation service** `https://api.qrserver.com/v1/create-qr-code/...` vào hình chính để không làm đổi bố cục nhiều; có thể bổ sung nếu cần sơ đồ đầy đủ tất cả external dependencies.
