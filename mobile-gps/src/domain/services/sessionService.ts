import axios from 'axios';
import { Platform } from 'react-native';

/**
 * API phiên online nằm dưới /api/v1 (backend cổng 3001), khác với BASE_API_URL dùng chung
 * của apiClient (/api) nên dùng client riêng để không ảnh hưởng poiService.
 * Cấu hình bằng EXPO_PUBLIC_SESSION_API_URL, ví dụ http://192.168.1.X:3001/api/v1
 */
export const SESSION_API_URL =
  process.env.EXPO_PUBLIC_SESSION_API_URL || 'http://192.168.1.100:3001/api/v1';

const sessionClient = axios.create({
  baseURL: SESSION_API_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

let sessionId: string | null = null;
let inFlight = false;

async function createSession(): Promise<string> {
  const response = await sessionClient.post<ApiEnvelope<{ sessionId: string }>>('/sessions', {
    deviceType: Platform.OS,
  });
  const id = response.data?.data?.sessionId;
  if (!response.data?.success || typeof id !== 'string') {
    throw new Error('Invalid create session response');
  }
  return id;
}

async function sendHeartbeat(id: string): Promise<void> {
  await sessionClient.post(`/sessions/${id}/heartbeat`);
}

export const sessionService = {
  /**
   * Tạo session nếu chưa có rồi gửi heartbeat. Bỏ qua nếu một lượt đang chạy.
   * Không ném lỗi: lỗi mạng sẽ được thử lại ở chu kỳ sau.
   */
  async beat(): Promise<void> {
    if (inFlight) return;
    inFlight = true;
    try {
      if (!sessionId) {
        sessionId = await createSession();
      }
      try {
        await sendHeartbeat(sessionId);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          sessionId = await createSession();
          await sendHeartbeat(sessionId);
        } else {
          throw error;
        }
      }
    } catch {
      // Backend không truy cập được hoặc phản hồi lỗi: thử lại ở lần sau.
    } finally {
      inFlight = false;
    }
  },

  reset(): void {
    sessionId = null;
  },
};
