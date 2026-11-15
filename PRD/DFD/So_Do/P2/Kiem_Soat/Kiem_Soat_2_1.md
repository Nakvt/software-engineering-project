# KIỂM SOÁT XỬ LÝ 2.1 – Tiếp nhận tra cứu POI

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 2.1.

**Chức năng:** Nhận tiêu chí tra cứu của khách. Chuyển tiêu chí nội bộ để tìm POI.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **F01** | F01 · Yêu cầu tra cứu | từ Khách tham quan |

**Nhóm luồng vào trên hình kiểm soát:** Tác nhân ngoài (F01).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T01** | T01 · Tiêu chí POI | đến 2.3 – Tra cứu POI và chọn ngôn ngữ |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T01).

## Thuật toán B1–B3 theo source mới

### B1

Nhận yêu cầu tra cứu POI từ ứng dụng.

### B2

Lấy/chuẩn hóa tham số lat, lng, lang, accent.

### B3

Chuyển tiêu chí tra cứu cho nghiệp vụ đọc POI.

## Đối chiếu code của xử lý 2.1

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `mobile-gps/src/domain/services/poiService.ts` | `getAllPOIs` | 15–27 | Gọi API lấy POI |
| `backend/src/controllers/mobilePoiController.js` | `getPois` | 8–52 | Tiếp nhận tọa độ, ngôn ngữ, giọng |

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
