# KIỂM SOÁT XỬ LÝ 8.3 – Thống kê lượt nghe & POI

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 8.3.

**Chức năng:** Nhận lịch sử nghe, POI và ngữ cảnh. Tính lượt nghe, thời lượng, POI nổi bật.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **I22** | I22 · Lịch sử nghe | từ Kho lịch sử nghe |
| **I23** | I23 · Thông tin POI | từ Kho POI/danh mục/nội dung |
| **T82** | T82 · Yêu cầu tổng hợp mặc định | từ 8.2 – Tổng hợp phiên hoạt động |

**Nhóm luồng vào trên hình kiểm soát:** Kho dữ liệu (I22, I23) ; Luồng trung gian (T82).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T84** | T84 · Ngữ cảnh POI và phạm vi thống kê | đến 8.4 – Phân tích vị trí/heatmap |
| **T85** | T85 · Lượt nghe, thời lượng và top POI | đến 8.5 – Kết xuất báo cáo |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T84, T85).

## Thuật toán B1–B3 theo source mới

### B1

Nhận yêu cầu thống kê lượt nghe và POI.

### B2

Tổng hợp play_history, thời lượng và POI nổi bật, chưa lọc động.

### B3

Trả kết quả thống kê nghe.

## Đối chiếu code của xử lý 8.3

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/routes/admin-analytics.routes.js` | `dashboard` | 45–95 | Tổng hợp play_history/POI; chưa lọc động |

**Điểm cần lưu ý:** Dashboard thống kê toàn bộ lịch sử hiện có, chưa lọc động theo POI/tour/ngôn ngữ/thời gian.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
