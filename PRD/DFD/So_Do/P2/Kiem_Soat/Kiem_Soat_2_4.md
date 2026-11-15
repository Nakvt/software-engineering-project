# KIỂM SOÁT XỬ LÝ 2.4 – Chuẩn bị nội dung thuyết minh

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 2.4.

**Chức năng:** Nhận nội dung POI được chọn. Tạo dữ liệu audio URL / TTS script cho bộ phát.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **T03** | T03 · Nội dung/metadata đã chọn | từ 2.3 – Tra cứu POI và chọn ngôn ngữ |

**Nhóm luồng vào trên hình kiểm soát:** Luồng trung gian (T03).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **T04** | T04 · Audio URL hoặc script TTS | đến 2.5 – Điều phối phát audio/TTS |

**Nhóm luồng ra trên hình kiểm soát:** Luồng trung gian (T04).

## Thuật toán B1–B3 theo source mới

### B1

Nhận thông tin nội dung POI.

### B2

Chọn TTS script, bản dịch hoặc fallback mô tả/tên.

### B3

Chuyển nội dung dự kiến phát cho bộ điều phối.

## Đối chiếu code của xử lý 2.4

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `mobile-gps/src/domain/services/AudioQueueService.ts` | `extractTtsScript/processQueue` | 58–83; 89–136 | Chuẩn bị script TTS, fallback description/name |

**Điểm cần lưu ý:** Script TTS có nhiều nguồn fallback, chưa chứng minh pipeline lưu audio thật.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
