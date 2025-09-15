import { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';

interface AdvancedKPIsData {
  collective_challenges_by_company: Array<{
    company_name: string;
    total_projects: number;
    collective_projects: number;
    completion_rate: number;
  }>;
  completion_by_section: Array<{
    section: string;
    total_projects: number;
    completed_projects: number;
    completion_rate: number;
  }>;
  teacher_satisfaction: Array<{
    teacher_name: string;
    supervised_projects: number;
    avg_satisfaction: number;
  }>;
  avg_resolution_time_days: number;
  active_companies_ranking: Array<{
    company_name: string;
    collective_projects: number;
    total_projects: number;
    activity_score: number;
  }>;
  top_students_collective: Array<{
    student_name: string;
    rut: string;
    section: string;
    collective_applications: number;
    completed_collective: number;
    success_rate: number;
  }>;
  generated_at: string;
}

export const useAdvancedKPIs = () => {
  const [data, setData] = useState<AdvancedKPIsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get('/api/admin/advanced-kpis/');
      setData(response);
      
    } catch (err: any) {
      console.error('Error fetching advanced KPIs:', err);
      setError(err.message || 'Error al cargar KPIs avanzados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refreshData: fetchData
  };
};
