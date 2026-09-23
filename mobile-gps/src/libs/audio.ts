import * as Speech from 'expo-speech';

export interface VoiceOption {
  identifier: string;
  name: string;
  language: string;
}

export class AudioLib {
  /**
   * Lấy danh sách giọng đọc có sẵn trên máy
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
   * Phát Text-to-Speech bằng bộ máy giọng nói của máy
   */
  static playTTS(
    text: string,
    languageCode: string = 'vi-VN',
    onFinish?: () => void
  ): void {
    this.stopAll();

    Speech.speak(text, {
      language: languageCode,
      pitch: 1.0,
      rate: 0.9,
      onDone: onFinish,
      onError: () => onFinish?.(),
    });
  }

  /**
   * Tạm thời giả lập phát file mp3 bằng TTS trong môi trường Expo Go
   */
  static async playAudio(url: string, onFinish?: () => void): Promise<void> {
    console.log('Đang phát file audio (giả lập):', url);
    // Khi chưa build native, ta dùng TTS để báo hiệu thay thế
    this.playTTS('Đang phát thuyết minh từ file thu âm.', 'vi-VN', onFinish);
  }

  /**
   * Dừng âm thanh đang phát
   */
  static async stopAll(): Promise<void> {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }
  }
}