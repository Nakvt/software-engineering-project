// File: mobile-gps/src/domain/services/sessionService.ts

import { AppState, AppStateStatus } from 'react-native';
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
  private static heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private static appStateSubscription: any = null;

  static getSessionId(): string | null {
    return this.currentSessionId;
  }

  static setSessionId(id: string | null): void {
    this.currentSessionId = id;
  }

  /**
   * 1. Tạo phiên mới: Nếu đã có phiên cũ thì báo Offline cho phiên cũ trước
   */
  static async createSession(): Promise<string | null> {
    // 💡 Nếu đang tồn tại sessionId cũ, chuyển trạng thái cũ về Offline trước khi tạo phiên mới
    if (this.currentSessionId) {
      await this.setSessionOffline(this.currentSessionId);
    }

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
        console.log('🟢 [SessionService] Đã khởi tạo phiên online mới:', extractedId);

        this.startHeartbeatLoop();
        this.listenAppStateChanges();

        return extractedId;
      }

      return null;
    } catch (error) {
      console.warn('⚠️ [SessionService] Lỗi kết nối khi tạo phiên:', error);
      return null;
    }
  }

  /**
   * 2. Gửi tín hiệu Offline tới Backend dựa trên exact Session ID
   */
  static async setSessionOffline(targetSessionId?: string | null): Promise<boolean> {
    const idToOffline = targetSessionId || this.currentSessionId;
    if (!idToOffline) return false;

    try {
      console.log(`🔴 [SessionService] Gửi yêu cầu chuyển Offline cho Session: ${idToOffline}`);
      const response = await fetch(`${API_BASE_URL}/sessions/${idToOffline}/offline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        if (idToOffline === this.currentSessionId) {
          this.stopHeartbeatLoop();
          this.currentSessionId = null;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.warn('⚠️ [SessionService] Không thể gửi tín hiệu Offline:', error);
      return false;
    }
  }

  /**
   * 3. Gửi Heartbeat duy trì trạng thái Online
   */
  static async sendHeartbeat(): Promise<boolean> {
    if (!this.currentSessionId) return false;

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
        this.stopHeartbeatLoop();
        this.currentSessionId = null;
        return false;
      }

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  static startHeartbeatLoop(intervalMs: number = 20000): void {
    this.stopHeartbeatLoop();
    void this.sendHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      void this.sendHeartbeat();
    }, intervalMs);
  }

  static stopHeartbeatLoop(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 4. Bắt sự kiện thoát/ẩn App để cập nhật is_online = FALSE
   */
  private static listenAppStateChanges(): void {
    if (this.appStateSubscription) return;

    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('📱 [SessionService] App bị ẩn/đóng: Chuyển session về Offline');
        void this.setSessionOffline();
      } else if (nextAppState === 'active') {
        if (!this.currentSessionId) {
          void this.createSession();
        } else {
          this.startHeartbeatLoop();
        }
      }
    });
  }
}