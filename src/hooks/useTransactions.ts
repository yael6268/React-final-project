import { useCallback, useEffect, useState } from 'react';
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

  const fetchTransactions = useCallback(async () => {
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
      setPagination({
        total: response.data.total ?? response.data.pagination?.total ?? 0,
        page: response.data.page ?? response.data.pagination?.page ?? filters.page ?? 1,
        pages: response.data.pages ?? response.data.pagination?.pages ?? 1,
      });
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'שגיאה בטעינת התנועות');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading: loading,
    errorMessage,
    pagination,
    filters,
    setFilters,
    refetch: fetchTransactions,
  };
};
