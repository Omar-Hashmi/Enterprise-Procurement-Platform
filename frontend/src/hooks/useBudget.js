import { useCallback, useEffect, useState } from 'react';
import apiClient from '../lib/api';
import { demoBudgets } from '../data/demoData';

const getMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

export function useBudget({ autoLoad = true } = {}) {
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [error, setError] = useState('');

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/budgets');
      const records = response.data?.data || [];
      setBudgets(records.length ? records : demoBudgets);
    } catch (requestError) {
      setBudgets(demoBudgets);
      setError('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBudget = useCallback(async (payload) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/budgets', {
        ...payload,
        fiscalYear: Number(payload.fiscalYear),
        allocatedAmount: Number(payload.allocatedAmount),
        purchaseLimit: Number(payload.purchaseLimit),
        warningThresholdPercent: payload.warningThresholdPercent ? Number(payload.warningThresholdPercent) : undefined,
      });
      return response.data?.data;
    } catch (requestError) {
      setError(getMessage(requestError, 'Unable to create budget.'));
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) fetchBudgets();
  }, [autoLoad, fetchBudgets]);

  return { budgets, fetchBudgets, createBudget, isLoading, error };
}

export default useBudget;
