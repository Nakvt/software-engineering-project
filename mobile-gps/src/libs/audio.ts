import * as Speech from 'expo-speech';

export interface VoiceOption {
  identifier: string;
  name: string;
  language: string;
}

export type RegionAccent = 'north' | 'central' | 'south';

export class AudioLib {
  private static selectedVoiceIdentifier?: string;
  private static currentRegion: RegionAccent = 'north';

  /**
   * Chọn giọng đọc cụ thể theo Identifier
   */
  static setVoice(voiceIdentifier?: string): void {
    this.selectedVoiceIdentifier = voiceIdentifier;
  }

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
   * Cài đặt giọng đọc 3 miền (Bắc / Trung / Nam)
   */
  static async setVietnameseRegionalVoice(region: RegionAccent): Promise<void> {
    this.currentRegion = region;
    const voices = await this.getSupportedVoices();
    const viVoices = voices.filter((v) => v.language.startsWith('vi'));

    if (viVoices.length === 0) {
      this.selectedVoiceIdentifier = undefined;
      return;
    }

    // Thử tìm giọng đọc theo tên hệ thống
    const targetVoice = viVoices.find((v) => {
      const nameLower = v.name.toLowerCase();
      if (region === 'north') return nameLower.includes('bac') || nameLower.includes('hanoi') || nameLower.includes('northern');
      if (region === 'south') return nameLower.includes('nam') || nameLower.includes('saigon') || nameLower.includes('southern');
      if (region === 'central') return nameLower.includes('trung') || nameLower.includes('hue') || nameLower.includes('central');
      return false;
    });

    this.selectedVoiceIdentifier = targetVoice ? targetVoice.identifier : viVoices[0].identifier;
  }

  /**
   * Phát Text-to-Speech (TTS) với âm điệu biến đổi theo vùng miền hoặc ngôn ngữ
   */
  static async playTTS(
    text: string,
    languageCode: string = 'vi-VN',
    onFinish?: () => void
  ): Promise<void> {
    await this.stopAll();

    // Mặc định thông số giọng
    let pitch = 1.0;
    let rate = 0.9;

    // Nếu là Tiếng Việt, tinh chỉnh Pitch & Rate để tạo sự khác biệt âm điệu 3 miền rõ rệt
    if (languageCode.startsWith('vi')) {
      if (this.currentRegion === 'north') {
        pitch = 1.1; // Giọng Bắc: Cao độ thanh, chuẩn xác
        rate = 0.95;
      } else if (this.currentRegion === 'central') {
        pitch = 0.85; // Giọng Trung: Trầm ấm, nhịp đọc thong thả hơn
        rate = 0.82;
      } else if (this.currentRegion === 'south') {
        pitch = 0.98; // Giọng Nam: Mềm mại, nhịp đọc nhanh tự nhiên
        rate = 1.02;
      }
    }

    const options: Speech.SpeechOptions = {
      language: languageCode,
      pitch,
      rate,
      onDone: onFinish,
      onError: () => onFinish?.(),
    };

    if (this.selectedVoiceIdentifier) {
      options.voice = this.selectedVoiceIdentifier;
    }

    Speech.speak(text, options);
  }

  /**
   * Giả lập phát thuyết minh từ URL/File thu âm bằng TTS Fallback
   */
  static async playAudio(url: string, onFinish?: () => void): Promise<void> {
    console.log('Đang phát audio từ URL (chế độ TTS Fallback):', url);
    await this.playTTS('Đang phát thuyết minh từ file thu âm.', 'vi-VN', onFinish);
  }

  /**
   * Dừng toàn bộ âm thanh đang đọc
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
   * Alias phương thức stop() tương thích với AudioQueueService
   */
  static async stop(): Promise<void> {
    await this.stopAll();
  }
}