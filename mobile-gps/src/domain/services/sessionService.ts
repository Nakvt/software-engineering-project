import { API_BASE_URL } from '../../config/Api';

export interface CreateSessionResponse {
  sessionId?: string;
  id?: string;
  data?: {
    sessionId?: string;
    id?: string;
  };
  message?: string;
}

export class SessionService {
  private static currentSessionId: string | null = null;

  static getSessionId(): string | null {
    return this.currentSessionId;
  }

  static setSessionId(id: string | null): void {
    this.currentSessionId = id;
  }

  /**
   * Gọi API tạo phiên online mới: POST /api/v1/sessions
   */
  static async createSession(): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceType: 'mobile',
        }),
      });

      if (!response.ok) {
        console.warn(`⚠️ [SessionService] Lỗi tạo phiên (${response.status})`);
        return null;
      }

      const resData: CreateSessionResponse = await response.json();

      const extractedId =
        resData?.sessionId ||
        resData?.id ||
        resData?.data?.sessionId ||
        resData?.data?.id ||
        null;

      if (extractedId) {
        this.currentSessionId = extractedId;
        console.log('🟢 [SessionService] Đã khởi tạo phiên online:', extractedId);
        return extractedId;
      }

      console.warn('⚠️ [SessionService] Không tìm thấy sessionId trong response Backend');
      return null;
    } catch (error) {
      console.warn('⚠️ [SessionService] Lỗi kết nối khi tạo phiên:', error);
      return null;
    }
  }

  /**
   * Gọi API gửi heartbeat: POST /api/v1/sessions/:sessionId/heartbeat
   */
  static async sendHeartbeat(): Promise<boolean> {
    if (!this.currentSessionId) {
      return false;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/sessions/${this.currentSessionId}/heartbeat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 404) {
        console.warn('⚠️ [SessionService] Session không còn tồn tại trên Server (404). Reset sessionId.');
        this.currentSessionId = null;
        return false;
      }

      if (response.ok) {
        console.log(`💓 [SessionService] Heartbeat thành công cho Session: ${this.currentSessionId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.warn('⚠️ [SessionService] Lỗi kết nối khi gửi heartbeat:', error);
      return false;
    }
  }
}