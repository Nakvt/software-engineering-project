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
      console.log(
        `⏱️ [Queue] POI ${poi.code} đang trong thời gian cooldown (${Math.ceil(
          (cooldownUntil - now) / 1000
        )}s)`
      );
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
    this.queue.sort((a, b) => (b.poi.priority || 0) - (a.poi.priority || 0));

    console.log(
      `📥 [Queue] Đã thêm ${poi.code} vào hàng chờ (Ngôn ngữ: ${language}). Độ dài hàng chờ: ${this.queue.length}`
    );

    // Kích hoạt tiến trình xử lý hàng chờ
    this.processQueue();
    return true;
  }

  /**
   * Trích xuất văn bản kịch bản thuyết minh theo đúng ngôn ngữ chọn
   */
  private extractTtsScript(poi: any, language: string): string | null {
    if (!poi) return null;

    // 1. Trường hợp ttsScript là Object đa ngôn ngữ { vi: "...", en: "...", ja: "..." } (Mock Data)
    if (typeof poi.audio?.ttsScript === 'object' && poi.audio?.ttsScript !== null) {
      const script = poi.audio.ttsScript[language] || poi.audio.ttsScript.vi;
      if (script) return script;
    }

    // 2. Trường hợp ttsScript là String đơn nhận trực tiếp từ Backend API
    if (typeof poi.audio?.ttsScript === 'string' && poi.audio.ttsScript.trim() !== '') {
      return poi.audio.ttsScript;
    }

    // 3. Trường hợp dữ liệu Backend có mảng translations: [{ lang: 'ja', description: '...' }]
    if (Array.isArray(poi.translations)) {
      const matchedTrans = poi.translations.find(
        (t: any) => t.lang === language || t.language === language || t.language_code === language
      );
      if (matchedTrans && (matchedTrans.tts_script || matchedTrans.description || matchedTrans.name)) {
        return matchedTrans.tts_script || matchedTrans.description || matchedTrans.name;
      }
    }

    // 4. Fallback cuối cùng: Dùng description hoặc name
    return poi.description || poi.name || null;
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
    console.log(
      `▶️ [Queue] Bắt đầu phát thuyết minh POI: ${poi.code} (Ngôn ngữ: ${language}, Priority: ${poi.priority})`
    );

    try {
      const ttsScript = this.extractTtsScript(poi, language);

      if (ttsScript) {
        const localeMap: Record<string, string> = {
          vi: 'vi-VN',
          en: 'en-US',
          ja: 'ja-JP',
          zh: 'zh-CN',
          ko: 'ko-KR',
        };
        const locale = localeMap[language] || 'vi-VN';

        console.log(`🔊 [Replay TTS ${language}]: ${ttsScript.substring(0, 60)}...`);

        // Gọi thư viện phát TTS
        AudioLib.playTTS(ttsScript, locale);
      } else if (poi.audio?.audioUrl) {
        AudioLib.playAudio(poi.audio.audioUrl);
      }
    } catch (error) {
      console.error(`❌ [Queue Error] Lỗi khi phát âm thanh cho POI ${poi.code}:`, error);
    }

    const cooldownDuration = (poi.cooldownSeconds || 300) * 1000;
    this.cooldownMap.set(poi.id, Date.now() + cooldownDuration);

    const durationMs = (poi.audio?.duration || 10) * 1000;
    setTimeout(() => {
      this.onAudioFinished();
    }, durationMs);
  }

  private onAudioFinished(): void {
    console.log(`✅ [Queue] Hoàn thành bài thuyết minh: ${this.currentItem?.poi.code}`);
    this.currentItem = null;
    this.isProcessing = false;

    this.processQueue();
  }

  public clearQueue(): void {
    this.queue = [];
    this.currentItem = null;
    this.isProcessing = false;
    AudioLib.stop();
    console.log('🧹 [Queue] Đã dọn sạch hàng chờ thuyết minh.');
  }

  public getCurrentPOI(): POI | null {
    return this.currentItem?.poi || null;
  }
}

export const AudioQueueService = new AudioQueueServiceClass();