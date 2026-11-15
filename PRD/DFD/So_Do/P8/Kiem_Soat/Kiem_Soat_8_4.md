# KIỂM SOÁT XỬ LÝ 8.4 – Phân tích vị trí/heatmap

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 8.4.

**Chức năng:** Nhận tracking logs và ngữ cảnh. Nhóm tọa độ tạo dữ liệu heatmap.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **I21** | I21 · Nhật ký vị trí | từ Kho nhật ký GPS |
| **T84** | T84 · Ngữ cảnh POI và phạm vi thống kê | từ 8.3 – Thống kê lượt nghe & POI |

**Nhóm luồng vào trên hình kiểm soát:** Kho dữ liệu (I21) ; Luồng trung gian (T84).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T86** | T86 · Dữ liệu tổng hợp bản đồ nhiệt | đến 8.5 – Kết xuất báo cáo |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T86).

## Thuật toán B1–B3 theo source mới

### B1

Nhận yêu cầu bản đồ nhiệt và tracking_logs.

### B2

Nhóm số lần xuất hiện theo vị trí latitude/longitude.

### B3

Trả các điểm heatmap.

## Đối chiếu code của xử lý 8.4

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/routes/admin-analytics.routes.js` | `heatmap` | 18–35 | Tổng hợp tọa độ tracking_logs, chưa lọc thời gian |

**Điểm cần lưu ý:** Heatmap nhóm tọa độ tracking_logs, chưa lọc thời gian.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
