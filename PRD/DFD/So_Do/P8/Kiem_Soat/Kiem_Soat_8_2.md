# KIỂM SOÁT XỬ LÝ 8.2 – Tổng hợp phiên hoạt động

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 8.2.

**Chức năng:** Nhận trạng thái phiên từ D3 và ngữ cảnh yêu cầu. Đếm phiên hoạt động, chuyển tổng số phiên.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **I20** | I20 · Phiên và trạng thái online | từ Kho phiên tham quan |
| **T81** | T81 · Yêu cầu dashboard/heatmap/online | từ 8.1 – Tiếp nhận yêu cầu thống kê |

**Nhóm luồng vào trên hình kiểm soát:** Kho dữ liệu (I20) ; Luồng trung gian (T81).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T82** | T82 · Yêu cầu tổng hợp mặc định | đến 8.3 – Thống kê lượt nghe & POI |
| **T83** | T83 · Tổng số phiên / phiên online | đến 8.5 – Kết xuất báo cáo |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T82, T83).

## Thuật toán B1–B3 theo source mới

### B1

Nhận yêu cầu tổng hợp phiên hoạt động.

### B2

Đếm session trong cửa sổ cố định 5 phút.

### B3

Trả dữ liệu phiên online/tổng phiên.

## Đối chiếu code của xử lý 8.2

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/routes/admin-analytics.routes.js` | `online sessions` | 99–121 | Đếm phiên hoạt động trong cửa sổ cố định 5 phút |

**Điểm cần lưu ý:** Online sessions dùng cửa sổ 5 phút cố định, không lọc theo tham số.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
