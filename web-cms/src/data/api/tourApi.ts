import apiClient from './apiClient';

export interface TourItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  poiCount: number;
}

export const tourApi = {
  // Lấy danh sách toàn bộ Tour
  getTours: async (): Promise<TourItem[]> => {
    const response = await apiClient.get('/admin/tours');
    return response.data.success ? response.data.data : response.data;
  },

  // 💡 CẬP NHẬT: Nhận đúng 3 tham số (name, description, poiIds)
  createTour: async (
    name: string,
    description?: string,
    poiIds?: string[]
  ): Promise<TourItem> => {
    const response = await apiClient.post('/admin/tours', {
      name,
      description,
      poiIds,
    });
    return response.data.success ? response.data.data : response.data;
  },

  // 💡 Cập nhật danh sách POI cho Tour có sẵn
  updateTourPois: async (tourId: string, poiIds: string[]): Promise<void> => {
    await apiClient.put(`/admin/tours/${tourId}/pois`, { poiIds });
  },

  deleteTour: async (tourId: string): Promise<boolean> => {
    try {
      const response = await apiClient.delete(`/admin/tours/${tourId}`);
      return response.data?.success ?? true;
    } catch (error) {
      console.error('Lỗi xóa Tour:', error);
      throw error;
    }
  },

  updateTour: async (id: string, data: { name: string; description: string; poiIds?: string[] }): Promise<boolean> => {
    try {
      const response = await apiClient.put(`/admin/tours/${id}`, data);
      return response.data?.success ?? true;
    } catch (error) {
      console.error('Lỗi cập nhật Tour:', error);
      throw error;
    }
  },
};