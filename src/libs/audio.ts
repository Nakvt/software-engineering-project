import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

// Định nghĩa kiểu dữ liệu cho giọng đọc trả về
export interface VoiceOption {
  identifier: string; // Mã định danh của giọng đọc trên máy
  name: string;       // Tên giọng đọc (ví dụ: "Google Tiếng Việt", "Siri")
  language: string;   // Mã ngôn ngữ chuẩn (ví dụ: 'vi-VN', 'en-US', 'es-ES')
}

export class AudioLib {
  private static soundInstance: Audio.Sound | null = null;

  /**
   * Lấy danh sách toàn bộ các ngôn ngữ/giọng đọc mà thiết bị này hỗ trợ
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
   * Phát Text-to-Speech với ngôn ngữ bất kỳ
   * @param text Đoạn văn bản thuyết minh
   * @param languageCode Mã ngôn ngữ (ví dụ: 'vi-VN', 'en-US', 'fr-FR', 'ja-JP')
   * @param onFinish Hàm callback gọi khi đọc xong
   */
  static playTTS(
    text: string,
    languageCode: string = 'vi-VN',
    onFinish?: () => void
  ): void {
    this.stopAll();

    Speech.speak(text, {
      language: languageCode,
      pitch: 1.0, // Cao độ chuẩn
      rate: 0.9,  // Tốc độ đọc chậm rãi, rõ ràng cho thuyết minh
      onDone: onFinish,
      onError: () => onFinish?.(),
    });
  }

  /**
   * Phát file âm thanh thu sẵn (URL hoặc local file)
   */
  static async playAudio(url: string, onFinish?: () => void): Promise<void> {
    await this.stopAll();

    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true }
    );
    this.soundInstance = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        onFinish?.();
      }
    });
  }

  /**
   * Dừng toàn bộ âm thanh đang phát (cả Audio lẫn TTS)
   */
  static async stopAll(): Promise<void> {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }
    if (this.soundInstance) {
      await this.soundInstance.stopAsync();
      await this.soundInstance.unloadAsync();
      this.soundInstance = null;
    }
  }
}