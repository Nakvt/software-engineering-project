import { POI } from '../models/POI';
import { AudioLib } from '../../libs/audio';

export interface QueueItem {
  poi: POI;
  language: string;
  addedAt: number;
}

class AudioQueueServiceClass {
  private queue: QueueItem[] = [];
  private currentItem: QueueItem | null = null;
  private isProcessing: boolean = false;
  private cooldownMap: Map<string, number> = new Map(); // Lưu timestamp hết cooldown của POI

  /**
   * Thêm một POI vào hàng chờ phát thuyết minh
   */
  public enqueue(poi: POI, language: string = 'vi'): boolean {
    const now = Date.now();

    // 1. Kiểm tra Cooldown: Nếu POI đang trong thời gian cooldown thì bỏ qua
    const cooldownUntil = this.cooldownMap.get(poi.id) || 0;
    if (now < cooldownUntil) {
      console.log(`⏱️ [Queue] POI ${poi.code} đang trong thời gian cooldown (${Math.ceil((cooldownUntil - now) / 1000)}s)`);
      return false;
    }

    // 2. Kiểm tra trùng lặp: Nếu POI đã có trong hàng chờ hoặc đang phát thì không thêm nữa
    if (this.currentItem?.poi.id === poi.id) {
      return false;
    }
    const isAlreadyInQueue = this.queue.some((item) => item.poi.id === poi.id);
    if (isAlreadyInQueue) {
      return false;
    }

    // 3. Tạo item mới và đẩy vào hàng chờ
    const newItem: QueueItem = { poi, language, addedAt: now };
    this.queue.push(newItem);

    // 4. Sắp xếp hàng chờ theo độ ưu tiên Priority (Ưu tiên cao hơn đứng trước)
    this.queue.sort((a, b) => b.poi.priority - a.poi.priority);

    console.log(`📥 [Queue] Đã thêm ${poi.code} vào hàng chờ. Độ dài hàng chờ: ${this.queue.length}`);

    // Kích hoạt tiến trình xử lý hàng chờ
    this.processQueue();
    return true;
  }

  /**
   * Tiến trình lấy POI tiếp theo trong hàng chờ ra phát
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.currentItem = this.queue.shift() || null;

    if (!this.currentItem) {
      this.isProcessing = false;
      return;
    }

    const { poi, language } = this.currentItem;
    console.log(`▶️ [Queue] Bắt đầu phát thuyết minh POI: ${poi.code} (Priority: ${poi.priority})`);

    // Trích xuất kịch bản thuyết minh TTS theo ngôn ngữ
    const ttsScript =
      typeof poi.audio?.ttsScript === 'string'
        ? poi.audio.ttsScript
        : poi.audio?.ttsScript?.[language as keyof typeof poi.audio.ttsScript] || poi.audio?.ttsScript?.vi;

    if (ttsScript) {
      const localeMap: Record<string, string> = {
        vi: 'vi-VN',
        en: 'en-US',
        ja: 'ja-JP',
        zh: 'zh-CN',
        ko: 'ko-KR',
      };
      const locale = localeMap[language] || 'vi-VN';

      // Gọi thư viện phát TTS
      AudioLib.playTTS(ttsScript, locale);
    } else if (poi.audio?.audioUrl) {
      AudioLib.playAudio(poi.audio.audioUrl);
    }

    // Thiết lập thời gian Cooldown cho POI này sau khi bắt đầu phát
    const cooldownDuration = (poi.cooldownSeconds || 300) * 1000;
    this.cooldownMap.set(poi.id, Date.now() + cooldownDuration);

    // Giả lập/theo dõi thời lượng phát audio để chuyển bài tiếp theo
    const durationMs = (poi.audio?.duration || 10) * 1000;
    setTimeout(() => {
      this.onAudioFinished();
    }, durationMs);
  }

  /**
   * Khi bài thuyết minh phát xong
   */
  private onAudioFinished(): void {
    console.log(`✅ [Queue] Hoàn thành bài thuyết minh: ${this.currentItem?.poi.code}`);
    this.currentItem = null;
    this.isProcessing = false;

    // Tiếp tục phát POI tiếp theo trong hàng chờ (nếu có)
    this.processQueue();
  }

  /**
   * Dừng phát ngay lập tức và xoá sạch hàng chờ
   */
  public clearQueue(): void {
    this.queue = [];
    this.currentItem = null;
    this.isProcessing = false;
    AudioLib.stop();
    console.log('🧹 [Queue] Đã dọn sạch hàng chờ thuyết minh.');
  }

  /**
   * Lấy POI đang phát hiện tại
   */
  public getCurrentPOI(): POI | null {
    return this.currentItem?.poi || null;
  }
}

// Export một Singleton Instance dùng chung toàn ứng dụng
export const AudioQueueService = new AudioQueueServiceClass();