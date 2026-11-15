# KIỂM SOÁT XỬ LÝ 6.2 – Tra cứu POI hiện có

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 6.2.

**Chức năng:** Nhận tiêu chí tra cứu. Lấy nội dung POI hiện có từ D1.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **I16** | I16 · POI / nội dung hiện có | từ Kho POI/danh mục/nội dung |
| **T61** | T61 · Tiêu chí tra cứu | từ 6.1 – Tiếp nhận, kiểm tra dữ liệu |

**Nhóm luồng vào trên hình kiểm soát:** Kho dữ liệu (I16) ; Luồng trung gian (T61).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T63** | T63 · Dữ liệu POI hiện có | đến 6.3 – Xử lý tạo/sửa/xóa POI |
| **T64** | T64 · Danh sách / chi tiết tra cứu | đến 6.5 – Lưu và trả kết quả |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T63, T64).

## Thuật toán B1–B3 theo source mới

### B1

Nhận yêu cầu tra cứu POI hiện có.

### B2

CMS hiện dùng public /pois để lấy danh sách.

### B3

Trả dữ liệu POI phục vụ thao tác quản trị.

## Đối chiếu code của xử lý 6.2

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/services/mobilePoiService.js` | `getPois` | 25–109 | Đọc POI qua public endpoint |
| `web-cms/src/data/api/poiApi.ts` | `getPois` | 42–47 | CMS đang dùng public GET /pois |

**Điểm cần lưu ý:** CMS đang đọc POI qua public GET /pois; chưa có GET admin riêng theo báo cáo.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
