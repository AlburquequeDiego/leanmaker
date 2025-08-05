import { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';
import { authService } from '../services/auth.service';

export interface HubAnalyticsData {
  stats: {
    totalUsers: number;
    totalProjects: number;
    totalCompanies: number;
    totalStudents: number;
    activeProjects: number;
    completedProjects: number;
    pendingProjects: number;
    cancelledProjects: number;
  };
  activityData: Array<{
    name: string;
    usuarios: number;
    proyectos: number;
    aplicaciones: number;
    horas?: number;
  }>;
  projectStatusData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  monthlyStats: Array<{
    name: string;
    proyectos: number;
    estudiantes: number;
    empresas: number;
    horas?: number;
  }>;
  topStudents: Array<{
    id: number;
    name: string;
    email: string;
    avatar: string;
    totalHours: number;
    completedProjects: number;
    averageRating: number;
    level: number;
    status: string;
  }>;
  topCompanies: Array<{
    id: number;
    name: string;
    industry: string;
    avatar: string;
    totalProjects: number;
    activeProjects: number;
    averageRating: number;
    totalStudents: number;
    realHoursOffered: number;
    status: string;
  }>;
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    project: string;
    time: string;
    status: string;
  }>;
  pendingRequests: Array<{
    id: string;
    student: string;
    type: string;
    level: number;
    submitted: string;
    status: string;
  }>;
  // Nuevas métricas
  applicationsMetrics: {
    totalApplications: number;
    acceptedApplications: number;
    acceptanceRate: number;
    byStatus: Array<{
      estado: string;
      count: number;
    }>;
    topRequestedProjects: Array<{
      id: string;
      title: string;
      company: string;
      applications: number;
    }>;
  };
  strikesMetrics: {
    activeStrikes: number;
    studentsWithStrikes: number;
    studentsByStrikes: Array<{
      strikes: number;
      count: number;
    }>;
    topReportingCompanies: Array<{
      id: string;
      name: string;
      reports: number;
    }>;
    monthlyTrend: Array<{
      month: string;
      strikes: number;
    }>;
  };
  notificationsMetrics: {
    totalNotifications: number;
    readNotifications: number;
    readRate: number;
    byType: Array<{
      type: string;
      count: number;
      read_count: number;
      read_rate: number;
    }>;
    massNotifications: number;
    massNotificationsSent: number;
  };
  apiTrlMetrics: {
    studentsByApiLevel: Array<{
      api_level: number;
      count: number;
    }>;
    projectsByTrl: Array<{
      trl_level: number;
      count: number;
    }>;
    totalApiRequests: number;
    pendingApiRequests: number;
    approvedApiRequests: number;
  };
}

export const useHubAnalytics = () => {
  const [data, setData] = useState<HubAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
                   // Debug: Verificar si hay token
             const token = authService.getAccessToken();
             console.log('🔍 [HUB ANALYTICS] Token disponible:', !!token);
      
      const response = await apiService.get('/api/hub/analytics/');
      console.log('📊 [HUB ANALYTICS] Datos recibidos:', response);
      
      setData(response);
    } catch (err) {
      console.error('❌ [HUB ANALYTICS] Error obteniendo datos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refreshData,
  };
}; 