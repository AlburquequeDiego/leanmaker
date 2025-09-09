/**
 * 🎓 HOOK PARA DATOS DEL DOCENTE
 * 
 * Este hook proporciona acceso a los datos específicos del docente
 * desde la base de datos real.
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api.service';

export interface TeacherStudent {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    career?: string;
    semester?: number;
  };
  supervision_type: 'thesis' | 'internship' | 'project' | 'course' | 'mentoring';
  status: 'active' | 'completed' | 'suspended' | 'transferred';
  start_date: string;
  end_date?: string;
  expected_completion_date?: string;
  total_hours_supervised: number;
  meetings_count: number;
  evaluations_count: number;
  progress_percentage: number;
  notes?: string;
  objectives?: string;
}

export interface TeacherProject {
  id: string;
  project: {
    id: string;
    title: string;
    description: string;
    company: string;
    area?: string;
    status?: string;
  };
  role: 'supervisor' | 'co_supervisor' | 'evaluator' | 'advisor';
  current_phase: 'planning' | 'development' | 'testing' | 'deployment' | 'maintenance' | 'completed';
  assigned_date: string;
  last_review_date?: string;
  next_review_date?: string;
  review_count: number;
  feedback_count: number;
  hours_supervised: number;
  supervision_notes?: string;
  evaluation_criteria: string[];
}

export interface TeacherEvaluation {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  project: {
    id: string;
    title: string;
  };
  evaluation_type: 'progress' | 'midterm' | 'final' | 'peer_review' | 'self_assessment';
  status: 'draft' | 'in_progress' | 'completed' | 'published';
  scores: {
    technical_skills?: number;
    communication?: number;
    problem_solving?: number;
    teamwork?: number;
    punctuality?: number;
    overall_score?: number;
  };
  comments: {
    strengths?: string;
    areas_for_improvement?: string;
    general_comments?: string;
    recommendations?: string;
  };
  evaluation_date: string;
  due_date?: string;
  completed_date?: string;
}

export interface TeacherReport {
  id: string;
  title: string;
  report_type: 'student_progress' | 'project_status' | 'academic_performance' | 'supervision_summary' | 'evaluation_summary' | 'custom';
  status: 'draft' | 'generated' | 'published' | 'archived';
  summary?: string;
  date_from?: string;
  date_to?: string;
  generated_date: string;
  published_date?: string;
  file_path?: string;
  parameters: Record<string, any>;
}

export interface TeacherSchedule {
  id: string;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_time: string;
  end_time: string;
  activity_type: 'office_hours' | 'meeting' | 'class' | 'supervision' | 'research' | 'unavailable';
  title?: string;
  description?: string;
  location?: string;
  is_recurring: boolean;
  specific_date?: string;
  duration_hours: number;
}

export const useTeacherData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeacherStudents = useCallback(async (params?: any): Promise<TeacherStudent[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTeacherStudents(params);
      return response.students || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching teacher students:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeacherProjects = useCallback(async (params?: any): Promise<TeacherProject[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTeacherProjects(params);
      return response.projects || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching teacher projects:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeacherEvaluations = useCallback(async (params?: any): Promise<TeacherEvaluation[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTeacherEvaluations(params);
      return response.evaluations || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching teacher evaluations:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeacherReports = useCallback(async (params?: any): Promise<TeacherReport[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTeacherReports(params);
      return response.reports || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching teacher reports:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeacherSchedule = useCallback(async (): Promise<TeacherSchedule[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTeacherSchedule();
      return response.schedules || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching teacher schedule:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchTeacherStudents,
    fetchTeacherProjects,
    fetchTeacherEvaluations,
    fetchTeacherReports,
    fetchTeacherSchedule,
  };
};
