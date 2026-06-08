import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Get userId from localStorage
const getUserId = () => localStorage.getItem('userId');

// Create axios instance with default headers
const api = axios.create({
  baseURL: API_URL,
});

// Add Authorization header to all requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== BUDGET API CALLS =====

// Get all budgets for current user
export const getAllBudgets = async () => {
  const userId = getUserId();
  const response = await api.get(`/budgets/user/${userId}`);
  return response.data;
};

// Get budgets by month/year
export const getBudgetsByMonth = async (month: number, year: number) => {
  const userId = getUserId();
  const response = await api.get(`/budgets/user/${userId}/month/${month}/year/${year}`);
  return response.data;
};

// Get budget status with spent amounts
export const getBudgetStatus = async (month: number, year: number) => {
  const userId = getUserId();
  const response = await api.get(`/budgets/status/user/${userId}/month/${month}/year/${year}`);
  return response.data;
};

// Create new budget
export const createBudget = async (data: {
  category: string;
  limit: number;
  month: number;
  year: number;
}) => {
  const response = await api.post('/budgets', data);
  return response.data;
};

// Update budget
export const updateBudget = async (
  id: string,
  data: { category?: string; limit?: number; month?: number; year?: number }
) => {
  const response = await api.put(`/budgets/${id}`, data);
  return response.data;
};

// Delete budget
export const deleteBudget = async (id: string) => {
  const response = await api.delete(`/budgets/${id}`);
  return response.data;
};

export default api;
