import apiClient from './apiClient';

export interface TourItem {
  id: string;
  name: string;
  description?: string;
  estimatedDurationMinutes?: number | null;
  distanceKm?: number | null;
  thumbnailUrl?: string;
  isActive?: boolean;
  poiCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TourPayload {
  name: string;
  description?: string;
  estimatedDurationMinutes?: number | null;
  distanceKm?: number | null;
  thumbnailUrl?: string;
  poiIds?: string[];
}

export interface TourDetailResponse extends TourItem {
  pois: {
    id: string;
    code?: string;
    name: string;
    sequenceOrder: number;
  }[];
}

export const tourApi = {
  // 1. Lấy danh sách toàn bộ Tour (đầy đủ tất cả cột)
  getTours: async (): Promise<TourItem[]> => {
    const response = await apiClient.get('/admin/tours');
    return response.data?.success ? response.data.data : response.data;
  },

  // 2. Lấy chi tiết 1 Tour kèm danh sách POI theo thứ tự (dùng khi mở Modal Sửa)
  getTourDetail: async (tourId: string): Promise<TourDetailResponse> => {
    const response = await apiClient.get(`/admin/tours/${tourId}`);
    return response.data?.success ? response.data.data : response.data;
  },

  // 3. Tạo Tour mới (nhận object payload đầy đủ các trường)
  createTour: async (payload: TourPayload): Promise<TourItem> => {
    const response = await apiClient.post('/admin/tours', payload);
    return response.data?.success ? response.data.data : response.data;
  },

  // 4. Cập nhật toàn bộ thông tin Tour & danh sách thứ tự POI
  updateTour: async (id: string, data: TourPayload): Promise<boolean> => {
    try {
      const response = await apiClient.put(`/admin/tours/${id}`, data);
      return response.data?.success ?? true;
    } catch (error) {
      console.error('Lỗi cập nhật Tour:', error);
      throw error;
    }
  },

  // 5. Cập nhật riêng danh sách POI cho Tour có sẵn (giữ lại để tương thích ngược)
  updateTourPois: async (tourId: string, poiIds: string[]): Promise<void> => {
    await apiClient.put(`/admin/tours/${tourId}/pois`, { poiIds });
  },

  // 6. Xóa Tour
  deleteTour: async (tourId: string): Promise<boolean> => {
    try {
      const response = await apiClient.delete(`/admin/tours/${tourId}`);
      return response.data?.success ?? true;
    } catch (error) {
      console.error('Lỗi xóa Tour:', error);
      throw error;
    }
  },
};