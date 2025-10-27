// ===== src/services/api.js =====
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (email, password, role, instansi_id) => {
    const response = await api.post('/auth/register', { email, password, role, instansi_id});
    return response.data;
  },
};

// Pegawai API
export const pegawaiAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/pegawai', { params });
    return response.data; 
  },
  // FUNGSI BARU UNTUK HALAMAN TALENT
    getAllTalents: async () => {
        const response = await api.get('/pegawai/talents'); // <-- HARUS plural '/talents'
        return response.data;
    },
    getByNip: async (nip) => {
        const response = await api.get(`/pegawai/${nip}`);
        return response.data;
  },
// ⭐ FUNGSI BARU UNTUK REKOMENDASI JABATAN ⭐
    getRecommendations: (nip) => {
        return axios.get(`${API_BASE_URL}/pegawai/${nip}/rekomendasi`);
    },
};

// Instansi API
export const instansiAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/instansi', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/instansi/${id}`);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};
export const aiAPI = {
    sendMessage: async (message) => {
        try {
            const response = await api.post('/ai/chat', { message });
            return response.data; // Diharapkan mengembalikan { success: true, reply: "Jawaban AI" }
        } catch (error) {
            console.error("AI Chat Error:", error);
            throw new Error(error.response?.data?.error || "Gagal menghubungi AI Assistant.");
        }
    }
};

export default api;