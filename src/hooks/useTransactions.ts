import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { Transaction, TransactionFilters, TransactionPagination } from '../types/transaction';

export const useTransactions = (initialFilters: TransactionFilters = {}) => {
  const [filters, setFilters] = useState<TransactionFilters>({
    page: initialFilters.page ?? 1,
    limit: initialFilters.limit ?? 10,
    category: initialFilters.category,
    type: initialFilters.type,
    fromDate: initialFilters.fromDate,
    toDate: initialFilters.toDate,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pagination, setPagination] = useState<TransactionPagination>({
    total: 0,
    page: filters.page ?? 1,
    pages: 1,
  });

  const getTransactions = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.get('/transactions', {
        params: {
          page: filters.page,
          limit: filters.limit,
          category: filters.category || undefined,
          type: filters.type || undefined,
          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,
        },
      });

      setTransactions(response.data.transactions ?? []);
      setPagination(response.data.pagination ?? {
        total: 0,
        page: filters.page ?? 1,
        pages: 1,
      });
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  return {
    transactions,
    isLoading: loading,
    errorMessage,
    pagination,
    filters,
    setFilters,
    refetch: getTransactions,
  };
};
