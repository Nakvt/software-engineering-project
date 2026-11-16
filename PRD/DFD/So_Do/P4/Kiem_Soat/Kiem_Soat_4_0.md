# KIỂM SOÁT XỬ LÝ 4.0 – Quản lý phiên tham quan

**Nguồn:** DFD mức 1; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 4.0.

**Chức năng:** Nhận dữ liệu thiết bị / heartbeat / offline, ngữ cảnh GPS. Tạo/cập nhật user_sessions, trả mã phiên/trạng thái.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **I07** | I07 · Hoạt động GPS / phiên | từ P3 |
| **I09** | I09 · Mã phiên / trạng thái | từ Kho phiên tham quan |
| **F19** | F19 · Dữ liệu thiết bị/phiên, heartbeat, offline | từ Khách tham quan |

**Nhóm luồng vào trên hình kiểm soát:** Tiến trình khác (I07) ; Kho dữ liệu (I09) ; Tác nhân ngoài (F19).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **I08** | I08 · Tạo phiên / heartbeat / offline | đến Kho phiên tham quan |
| **I10** | I10 | đến 5.0 – Ghi nhận lịch sử nghe |
| **F20** | F20 · Mã phiên / trạng thái phiên | đến Khách tham quan |

**Nhóm luồng ra trên hình kiểm soát:** Kho dữ liệu (I08) ; Tiến trình khác (I10) ; Tác nhân ngoài (F20).

## Thuật toán B1–B3 theo source mới

### B1

Nhận yêu cầu tạo session hoặc cập nhật trạng thái.

### B2

Kiểm tra session và nhận heartbeat định kỳ.

### B3

Lưu user_sessions; trả sessionId/trạng thái.

## Đối chiếu code của xử lý 4.0

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/routes/sessions.routes.js` | `POST /, heartbeat, offline` | 18–98 | Tạo phiên, heartbeat, đánh dấu offline |
| `mobile-gps/src/domain/services/sessionService.ts` | `session service` | 32–171 | Client quản lý session; heartbeat được báo cáo có lớp 20 giây |

**Điểm cần lưu ý:** Tạo phiên, heartbeat và offline đã có; không thấy hàng đợi offline lưu bền vững. I10 là luồng logic.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
