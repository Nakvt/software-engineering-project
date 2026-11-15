# KIỂM SOÁT XỬ LÝ 8.5 – Kết xuất báo cáo

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 8.5.

**Chức năng:** Nhận thống kê từ các nhánh. Định dạng và trả dashboard/heatmap cho admin.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **T83** | T83 · Tổng số phiên / phiên online | từ 8.2 – Tổng hợp phiên hoạt động |
| **T85** | T85 · Lượt nghe, thời lượng và top POI | từ 8.3 – Thống kê lượt nghe & POI |
| **T86** | T86 · Dữ liệu tổng hợp bản đồ nhiệt | từ 8.4 – Phân tích vị trí/heatmap |

**Nhóm luồng vào trên hình kiểm soát:** Luồng trung gian (T83, T85, T86).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **F16** | F16 · Thống kê, heatmap | đến Quản trị viên |

**Nhóm luồng ra trên hình kiểm soát:** Tác nhân ngoài (F16).

## Thuật toán B1–B3 theo source mới

### B1

Nhận kết quả thống kê phiên, nghe và heatmap.

### B2

CMS chuyển dữ liệu API về cấu trúc hiển thị.

### B3

Hiển thị thống kê và bản đồ nhiệt cho quản trị viên.

## Đối chiếu code của xử lý 8.5

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `web-cms/src/data/api/analyticsApi.ts` | `analytics API` | 41–143 | Nhận kết quả và đưa về CMS |
| `web-cms/src/presentation/screens/AdminDashboardScreen.tsx` | `dashboard UI` | chưa xác định trong báo cáo | Hiển thị bảng thống kê; chưa có dòng chính xác |

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
