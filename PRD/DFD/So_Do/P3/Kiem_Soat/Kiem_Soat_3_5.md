# KIỂM SOÁT XỬ LÝ 3.5 – Ghi GPS và phát hành kết quả

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 3.5.

**Chức năng:** Nhận GPS/timestamp và kết quả trigger. Ghi tracking_logs và trả shouldTrigger/POI.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **T04** | T04 · Kết quả kiểm tra trigger | từ 3.4 – Kiểm tra cooldown |
| **T06** | T06 · Bản ghi tọa độ / thời điểm | từ 3.1 – Tiếp nhận và chuẩn hóa GPS |

**Nhóm luồng vào trên hình kiểm soát:** Luồng trung gian (T04, T06).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **F04** | F04 · POI được kích hoạt | đến Khách tham quan |
| **I05** | I05 · Bản ghi GPS | đến Kho nhật ký GPS |
| **I06** | I06 · Ngữ cảnh trigger (chưa phải nghe) | đến 5.0 – Ghi nhận lịch sử nghe |

**Nhóm luồng ra trên hình kiểm soát:** Tác nhân ngoài (F04) ; Kho dữ liệu (I05) ; Tiến trình khác (I06).

## Thuật toán B1–B3 theo source mới

### B1

Nhận kết quả kích hoạt và tọa độ.

### B2

Ghi tracking_logs, cập nhật trạng thái session.

### B3

Trả shouldTrigger và POI cho mobile.

## Đối chiếu code của xử lý 3.5

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `backend/src/services/mobilePoiService.js` | `processTrackingPing` | 160–188; 222–238 | Lưu tracking_logs, cập nhật phiên, trả shouldTrigger |

**Điểm cần lưu ý:** I06 là luồng dữ liệu logic, không có API chuyển giao riêng tới P5.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
