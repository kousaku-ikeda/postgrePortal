import { useState, useCallback } from 'react';
import type { HealthResponse } from '../types/api';
import { API_BASE_URL } from '../config';

interface UseHealthCheckReturn {
  status: string | null;
  error: string | null;
  checkHealth: () => Promise<void>;
}

export const useHealthCheck = (): UseHealthCheckReturn => {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data: HealthResponse = await response.json();
      setStatus(data.status);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStatus(null);
    }
  }, []);

  return { status, error, checkHealth };
};
