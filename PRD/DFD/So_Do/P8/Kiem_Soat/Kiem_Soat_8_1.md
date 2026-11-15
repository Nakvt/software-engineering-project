# KIỂM SOÁT XỬ LÝ 8.1 – Tiếp nhận yêu cầu thống kê

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 8.1.

**Chức năng:** Nhận yêu cầu xem dashboard/heatmap/online. Chọn loại yêu cầu thực tế, chuyển ngữ cảnh các nhánh.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **F15** | F15 · Yêu cầu thống kê (chưa lọc động) | từ Quản trị viên |

**Nhóm luồng vào trên hình kiểm soát:** Tác nhân ngoài (F15).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T81** | T81 · Yêu cầu dashboard/heatmap/online | đến 8.2 – Tổng hợp phiên hoạt động |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T81).

## Thuật toán B1–B3 theo source mới

### B1

Nhận yêu cầu dashboard, heatmap hoặc online sessions.

### B2

Chọn endpoint nghiệp vụ; chưa hỗ trợ lọc tùy ý theo tham số.

### B3

Chuyển yêu cầu thống kê mặc định cho các bước tổng hợp.

## Đối chiếu code của xử lý 8.1

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/routes/admin-analytics.routes.js` | `heatmap/online sessions handlers` | 18–22; 104–108 | Nhận request, chưa hỗ trợ điều kiện lọc động |

**Điểm cần lưu ý:** Chưa hỗ trợ bộ lọc thống kê động; không mô tả nhận thời gian/POI/tour như tham số đã triển khai.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
