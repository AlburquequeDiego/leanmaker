import { useState } from 'react';
import { authService } from '../services/auth.service';

export function usePasswordReset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const requestCode = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await authService.requestPasswordReset(email);
      setSuccess(res.message);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al solicitar código');
    } finally {
      setLoading(false);
    }
  };

  const validateCode = async (email: string, code: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await authService.validatePasswordResetCode(email, code);
      setSuccess(res.message);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  const confirmReset = async (email: string, code: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await authService.confirmPasswordReset(email, code, newPassword);
      setSuccess(res.message);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    requestCode,
    validateCode,
    confirmReset,
    setError,
    setSuccess,
  };
} 