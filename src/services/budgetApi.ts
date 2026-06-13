import axios from 'axios';

// Vite exposes env variables via import.meta.env
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

const getUserIdFromToken = (token: string | null) => {
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return decoded.userId || decoded.id || null;
  } catch {
    return null;
  }
};

// Get userId from localStorage or from the JWT payload
const getUserId = () => localStorage.getItem('userId') || getUserIdFromToken(getToken());

const ensureUserId = () => {
  const userId = getUserId();
  if (!userId) {
    throw new Error('Missing user id. Please log in again.');
  }
 
  return userId;
};

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
  const userId = ensureUserId();
  const response = await api.get(`/api/budgets/user/${userId}`);
  return response.data;
};

// Get budgets by month/year
export const getBudgetsByMonth = async (month: number, year: number) => {
  const userId = ensureUserId();
  const response = await api.get(`/api/budgets/user/${userId}/month/${month}/year/${year}`);
  return response.data;
};

// Get budget status with spent amounts
export const getBudgetStatus = async (month: number, year: number) => {
  const userId = ensureUserId();
  const response = await api.get(`/api/budgets/status/user/${userId}/month/${month}/year/${year}`);
  return response.data;
};

// Create new budget
export const createBudget = async (data: {
  category: string;
  limit: number;
  month: number;
  year: number;
}) => {
  const userId = ensureUserId();
  const response = await api.post('/api/budgets', { ...data, userId });
  return response.data;
};

// Update budget
export const updateBudget = async (
  id: string,
  data: { category?: string; limit?: number; month?: number; year?: number }
) => {
  const userId = ensureUserId();
  const response = await api.put(`/api/budgets/${id}`, { ...data, userId });
  return response.data;
};

// Delete budget
export const deleteBudget = async (id: string) => {
  const response = await api.delete(`/api/budgets/${id}`);
  return response.data;
};

export default api;
