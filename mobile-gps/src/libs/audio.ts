import * as Speech from 'expo-speech';

export interface VoiceOption {
  identifier: string;
  name: string;
  language: string;
}

export class AudioLib {
  /**
   * Lấy danh sách các giọng đọc hỗ trợ trên thiết bị
   */
  static async getSupportedVoices(): Promise<VoiceOption[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.map((v) => ({
        identifier: v.identifier,
        name: v.name,
        language: v.language,
      }));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách giọng đọc:', error);
      return [];
    }
  }

  /**
   * Phát Text-to-Speech (TTS) theo kịch bản văn bản và mã ngôn ngữ
   */
  static async playTTS(
    text: string,
    languageCode: string = 'vi-VN',
    onFinish?: () => void
  ): Promise<void> {
    // Ngắt câu đọc cũ trước khi cất giọng đọc câu mới
    await this.stopAll();

    Speech.speak(text, {
      language: languageCode,
      pitch: 1.0,
      rate: 0.9,
      onDone: onFinish,
      onError: () => onFinish?.(),
    });
  }

  /**
   * Giả lập phát thuyết minh từ URL/File thu âm bằng TTS Fallback
   */
  static async playAudio(url: string, onFinish?: () => void): Promise<void> {
    console.log('Đang phát audio từ URL (chế độ TTS Fallback):', url);
    await this.playTTS('Đang phát thuyết minh từ file thu âm.', 'vi-VN', onFinish);
  }

  /**
   * Dừng toàn bộ âm thanh đang đọc trên thiết bị
   */
  static async stopAll(): Promise<void> {
    try {
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }
    } catch (error) {
      console.error('Lỗi khi dừng âm thanh TTS:', error);
    }
  }

  /**
   * Alias phương thức stop() giúp tương thích 100% với AudioQueueService
   */
  static async stop(): Promise<void> {
    await this.stopAll();
  }
}