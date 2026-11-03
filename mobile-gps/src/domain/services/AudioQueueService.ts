import { POI } from '../models/POI';
import { AudioLib } from '../../libs/audio';
import { poiService } from './poiService';
import { SessionService } from './sessionService';

export interface QueueItem {
  poi: POI;
  language: string;
  addedAt: number;
}

class AudioQueueServiceClass {
  private queue: QueueItem[] = [];
  private currentItem: QueueItem | null = null;
  private isProcessing: boolean = false;
  private cooldownMap: Map<string, number> = new Map();

  /**
   * 1. Thêm một POI vào hàng chờ phát thuyết minh
   */
  public enqueue(poi: POI, language: string = 'vi'): boolean {
    const now = Date.now();

    // 1.1 Kiểm tra Cooldown local
    const cooldownUntil = this.cooldownMap.get(poi.id) || 0;
    if (now < cooldownUntil) {
      const remainingSecs = Math.ceil((cooldownUntil - now) / 1000);
      console.log(`⏱️ [Queue] POI ${poi.code || poi.id} đang trong Cooldown (${remainingSecs}s)`);
      return false;
    }

    // 1.2 Tránh trùng lặp POI đang phát hoặc đã nằm trong Queue
    if (this.currentItem?.poi.id === poi.id) {
      return false;
    }
    const isAlreadyInQueue = this.queue.some((item) => item.poi.id === poi.id);
    if (isAlreadyInQueue) {
      return false;
    }

    // 1.3 Đẩy vào Queue và sắp xếp theo Priority
    const newItem: QueueItem = { poi, language, addedAt: now };
    this.queue.push(newItem);
    this.queue.sort((a, b) => (b.poi.priority || 0) - (a.poi.priority || 0));

    console.log(
      `📥 [Queue] Đã thêm ${poi.code || poi.name} vào hàng chờ (Ngôn ngữ: ${language}). Độ dài hàng chờ: ${this.queue.length}`
    );

    // 1.4 Kích hoạt tiến trình phát
    this.processQueue();
    return true;
  }

  /**
   * 2. Bóc tách kịch bản TTS đa cấu trúc (API Backend / Mock Data / Translations)
   */
  private extractTtsScript(poi: any, language: string): string | null {
    if (!poi) return null;

    // TH1: Chuỗi string nhận trực tiếp từ API Backend (Ưu tiên số 1)
    if (typeof poi.audio?.ttsScript === 'string' && poi.audio.ttsScript.trim() !== '') {
      return poi.audio.ttsScript;
    }

    // TH2: Object đa ngôn ngữ từ Mock Data { vi: "...", en: "..." }
    if (typeof poi.audio?.ttsScript === 'object' && poi.audio?.ttsScript !== null) {
      const script = poi.audio.ttsScript[language] || poi.audio.ttsScript.vi;
      if (script) return script;
    }

    // TH3: Mảng translations
    if (Array.isArray(poi.translations)) {
      const matchedTrans = poi.translations.find(
        (t: any) => t.lang === language || t.language === language || t.language_code === language
      );
      if (matchedTrans && (matchedTrans.tts_script || matchedTrans.description || matchedTrans.name)) {
        return matchedTrans.tts_script || matchedTrans.description || matchedTrans.name;
      }
    }

    // Fallback cuối cùng
    return poi.description || poi.name || null;
  }

  /**
   * 3. Xử lý bài thuyết minh tiếp theo trong Queue
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
      `▶️ [Queue] Bắt đầu phát thuyết minh POI: ${poi.code || poi.name} (Ngôn ngữ: ${language}, Priority: ${poi.priority})`
    );

    const ttsScript = this.extractTtsScript(poi, language);

    // Ghi mốc Cooldown local
    const cooldownDuration = (poi.cooldownSeconds || 300) * 1000;
    this.cooldownMap.set(poi.id, Date.now() + cooldownDuration);

    try {
      if (ttsScript) {
        const localeMap: Record<string, string> = {
          vi: 'vi-VN',
          en: 'en-US',
          ja: 'ja-JP',
          zh: 'zh-CN',
          ko: 'ko-KR',
        };
        const locale = localeMap[language] || 'vi-VN';

        console.log(`🔊 [Replay TTS ${language}]: ${ttsScript}`);

        // Gọi AudioLib phát TTS kèm Callback an toàn
        AudioLib.playTTS(ttsScript, locale, () => this.onAudioFinished());
      } else if (poi.audio?.audioUrl) {
        AudioLib.playAudio(poi.audio.audioUrl, () => this.onAudioFinished());
      } else {
        console.warn(`⚠️ [Queue] POI ${poi.code || poi.id} không có dữ liệu âm thanh/TTS.`);
        this.onAudioFinished();
      }
    } catch (error) {
      console.error(`❌ [Queue Error] Lỗi khi phát âm thanh cho POI ${poi.code}:`, error);
      this.onAudioFinished();
    }
  }

  /**
   * 4. Giải phóng cờ bận & Tự động gửi Log Analytics (API 4) khi phát xong bài đọc
   */
  private onAudioFinished(): void {
    if (this.currentItem) {
      const { poi } = this.currentItem;
      console.log(`✅ [Queue] Hoàn thành bài thuyết minh: ${poi.code || poi.name}`);

      // 4.1 Lấy Session ID hiện tại từ SessionService (hoặc fallback ID an toàn)
      const activeSessionId = SessionService.getSessionId() || 'a73985d2-f67a-42c2-8419-58b9f36fba7c';

      // 4.2 Tự động gọi API 4 (POST /analytics/listen-event) lưu lịch sử vào play_history trên DB Neon
      poiService.logListenEvent({
        sessionId: activeSessionId,
        poiId: poi.id,
        triggerType: 'geofence',
        durationListenedSeconds: poi.audio?.duration || 30,
        completed: true,
      });
    }

    this.currentItem = null;
    this.isProcessing = false;

    // 4.3 Tiếp tục kiểm tra phát bài tiếp theo nếu còn trong Queue
    this.processQueue();
  }

  /**
   * 5. Dọn dẹp Queue
   */
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