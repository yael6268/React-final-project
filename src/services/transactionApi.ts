import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const getToken = () => localStorage.getItem('token');

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface TransactionPayload {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description?: string;
}

export interface TransactionItem {
  _id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description?: string;
}

export interface TransactionQueryFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
}

export const getTransactions = async (page = 1, limit = 10, filters: TransactionQueryFilters = {}) => {
  const response = await api.get('/api/transactions', {
    params: { page, limit, ...filters },
  });
  return response.data;
};

export const createTransaction = async (data: TransactionPayload) => {
  const response = await api.post('/api/transactions', data);
  return response.data;
};

export default api;
