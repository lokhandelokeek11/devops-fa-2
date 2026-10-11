import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      const message = error.response?.data?.message ?? 'Unable to reach the campus service';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error instanceof Error ? error : new Error('Unexpected error'));
  },
);
