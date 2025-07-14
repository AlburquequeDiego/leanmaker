import { apiService } from './api.service';

export interface Notification {
  id: string;
  user: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  related_url?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unread_count: number;
  };
}

class NotificationService {
  /**
   * Obtiene las notificaciones del usuario
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    read?: boolean;
    search?: string;
  }): Promise<NotificationResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.read !== undefined) queryParams.append('read', params.read.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const endpoint = `/api/notifications/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<NotificationResponse>(endpoint);
  }

  /**
   * Obtiene el conteo de notificaciones no leídas
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return apiService.get<UnreadCountResponse>('/api/notifications/unread-count/');
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(notificationId: string): Promise<any> {
    return apiService.post(`/api/notifications/${notificationId}/mark-read/`);
  }

  /**
   * Marca múltiples notificaciones como leídas
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<any> {
    return apiService.post('/api/notifications/mark-read/', {
      notification_ids: notificationIds
    });
  }

  /**
   * Crea una nueva notificación
   */
  async createNotification(data: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    related_url?: string;
  }): Promise<any> {
    return apiService.post('/api/notifications/create/', data);
  }

  /**
   * Elimina una notificación
   */
  async deleteNotification(notificationId: string): Promise<any> {
    return apiService.delete(`/api/notifications/${notificationId}/delete/`);
  }

  /**
   * Obtiene los detalles de una notificación específica
   */
  async getNotificationDetails(notificationId: string): Promise<any> {
    return apiService.get(`/api/notifications/${notificationId}/`);
  }
}

export const notificationService = new NotificationService(); 