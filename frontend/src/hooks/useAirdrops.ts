import { useState, useCallback } from 'react';
import { Airdrop } from '../types';

const API_BASE = '/api';

export const useAirdrops = () => {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAirdrops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/airdrops`);
      const data = await res.json();
      if (data.success) {
        setAirdrops(data.data);
      } else {
        setError('Failed to load airdrops');
      }
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleTask = useCallback(async (
    airdropId: number,
    taskId: number,
    isCompleted: boolean
  ): Promise<boolean> => {
    try {
      const method = isCompleted ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE}/airdrops/${airdropId}/tasks/${taskId}/complete`, {
        method,
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }, []);

  const triggerAgent = useCallback(async (): Promise<string> => {
    try {
      const res = await fetch(`${API_BASE}/agent/trigger`, { method: 'POST' });
      const data = await res.json();
      return data.message || 'Agent triggered';
    } catch {
      return 'Failed to trigger agent';
    }
  }, []);

  return { airdrops, loading, error, fetchAirdrops, toggleTask, triggerAgent, setAirdrops };
};