# KIỂM SOÁT XỬ LÝ 2.5 – Điều phối phát audio/TTS

**Nguồn:** DFD mức 2; **đơn vị kiểm soát:** đúng 1 vòng tròn xử lý 2.5.

**Chức năng:** Nhận audio/TTS và yêu cầu phát/tạm dừng. Phát thuyết minh, chuyển sự kiện nghe thực tế sang P5.

## Các luồng dữ liệu VÀO

| Mã luồng | Nội dung trên DFD | Nguồn |
|---|---|---|
| **T04** | T04 · Audio URL hoặc script TTS | từ 2.4 – Chuẩn bị nội dung thuyết minh |
| **F08** | F08 · Yêu cầu phát / tạm dừng | từ Khách tham quan |

**Nhóm luồng vào trên hình kiểm soát:** Luồng trung gian (T04) ; Tác nhân ngoài (F08).

## Các luồng dữ liệu RA

| Mã luồng | Nội dung trên DFD | Đích |
|---|---|---|
| **F07** | F07 · Nội dung thuyết minh | đến Khách tham quan |
| **I11** | I11 · Sự kiện nghe thực tế / thời lượng | đến 5.0 – Ghi nhận lịch sử nghe |

**Nhóm luồng ra trên hình kiểm soát:** Tác nhân ngoài (F07) ; Tiến trình khác (I11).

## Thuật toán B1–B3 theo source mới

### B1

Nhận nội dung và yêu cầu phát/tạm dừng.

### B2

Phát bằng expo-speech; URL audio chưa có đường phát file thật.

### B3

Trả nội dung thuyết minh và gửi listen event khi audio kết thúc.

## Đối chiếu code của xử lý 2.5

| File (từ root repository) | Hàm / route / thành phần | Dòng theo Copilot | Vai trò |
|---|---|---|---|
| `mobile-gps/src/domain/services/AudioQueueService.ts` | `processQueue/onAudioFinished` | 89–166 | Điều phối phát và gửi listen event khi hoàn tất |
| `mobile-gps/src/libs/audio.ts` | `playTTS/playAudio` | 75–113 | TTS chạy trên thiết bị; phát file audio URL chưa hoạt động thực |

**Điểm cần lưu ý:** Phát TTS thực hiện trên thiết bị; playAudio(URL) hiện fallback sang TTS. onAudioFinished chưa phân biệt triggerType đúng.

**Commit đối chiếu:** `e75a63f7b916d0d90c2a608d1fc8af3d4907489b`. **Nguồn:** báo cáo Copilot do nhóm cung cấp; số dòng chưa được đối chiếu độc lập bằng bản source trong môi trường tạo tài liệu.

**Nguyên tắc DFD:** Txx/Ixx là luồng dữ liệu logic; không đồng nghĩa mỗi mũi tên có API hoặc hàm riêng. Luồng chưa hoạt động hoàn chỉnh được giữ để bảo toàn thiết kế nhưng phải ghi đúng trạng thái.
