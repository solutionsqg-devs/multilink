import axios from 'axios';

/**
 * Cliente Axios configurado para la API de MultiEnlace
 * - Cookies httpOnly automáticas
 * - Refresh token automático en 401
 * - Base URL configurable
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ⚠️ CRÍTICO: envía cookies httpOnly
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag para evitar loops infinitos de refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Suscribirse al refresh token
 */
function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

/**
 * Notificar a todos los suscriptores
 */
function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

/**
 * Interceptor de respuesta: maneja 401 con refresh token automático
 */
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Si es 401 y no es la ruta de refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Ya hay un refresh en proceso, esperar
        return new Promise(resolve => {
          subscribeTokenRefresh(() => {
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Intentar refresh
        await apiClient.post('/auth/refresh');

        isRefreshing = false;
        onRefreshed('token'); // No necesitamos el token, está en cookies

        // Reintentar request original
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh falló, redirigir a login
        isRefreshing = false;
        refreshSubscribers = [];

        // Solo redirigir en cliente
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session=expired';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Tipos de respuesta de la API
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: 'FREE' | 'PRO';
  features: {
    domains: boolean;
    advancedAnalytics: boolean;
    ogImage: boolean;
    removeBranding: boolean;
    extraThemes: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}
