import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

// API Service Functions
export const apiService = {
  // Health & System
  getHealth: async () => {
    try {
      const response = await apiClient.get('/api/health');
      return response.data;
    } catch (error) {
      console.warn('Backend health check error:', error.message);
      return {
        status: 'disconnected',
        error: error.message,
        app_name: 'PhishShield',
        services: { database: 'offline' }
      };
    }
  },

  // Indian Banking Registry
  getRegisteredBanks: async () => {
    try {
      const response = await apiClient.get('/api/v1/banks');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch registered banks:', error.message);
      return { total_banks: 0, banks: [] };
    }
  },

  // Scan History & Metrics
  getHistory: async (limit = 20, params = {}) => {
    try {
      const queryParams = new URLSearchParams({ limit, ...params });
      const response = await apiClient.get(`/api/v1/history?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch history:', error.message);
      return [];
    }
  },

  getHistoryRecord: async (recordId) => {
    const response = await apiClient.get(`/api/v1/history/${recordId}`);
    return response.data;
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/api/v1/history/stats');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch stats:', error.message);
      return {
        total_scans: 0,
        phishing_detected: 0,
        brand_impersonations: 0,
        safe_scans: 0,
        protection_status: 'Standby'
      };
    }
  },

  // Security Scanners
  scanUrl: async (url) => {
    const response = await apiClient.post('/api/v1/urls/scan', { url });
    return response.data;
  },

  scanSms: async (message) => {
    const response = await apiClient.post('/api/v1/sms/scan', { message });
    return response.data;
  },

  // Screenshot Upload & Processing (Phase 5A)
  uploadScreenshot: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/v1/screenshot/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });
    return response.data;
  },

  // Screenshot OCR Text Extraction (Phase 5B)
  extractScreenshotText: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/v1/screenshot/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
      // OCR inference may take a few seconds on CPU
      timeout: 60000,
    });
    return response.data;
  },

  // Screenshot Full Threat Intelligence Analysis (Phase 5C)
  analyzeScreenshotThreats: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/v1/screenshot/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
      // Pipeline executes OCR + URL extraction + RF + SHAP + Brand + Indicators
      timeout: 90000,
    });
    return response.data;
  },

  // Asynchronous Screenshot Threat Analysis (Phase 6B)
  analyzeScreenshotThreatsAsync: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/v1/screenshot/analyze/async', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getScreenshotJobStatus: async (jobId) => {
    const response = await apiClient.get(`/api/v1/screenshot/jobs/${jobId}`);
    return response.data;
  },

  getOcrQueueStatus: async () => {
    const response = await apiClient.get('/api/v1/screenshot/queue/status');
    return response.data;
  },

  // Phase 6C: Threat Dossier Export
  getDossierJson: async (scanId) => {
    const response = await apiClient.get(`/api/v1/dossier/${scanId}/json`);
    return response.data;
  },

  downloadDossierPdf: async (scanId) => {
    const response = await apiClient.get(`/api/v1/dossier/${scanId}/pdf`, {
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `phishshield-threat-dossier-${scanId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Phase 6C: Authentication & RBAC
  login: async (username, password) => {
    const response = await apiClient.post('/api/v1/auth/login', { username, password });
    if (response.data && response.data.access_token) {
      localStorage.setItem('phishshield_token', response.data.access_token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    }
    return response.data;
  },

  getMe: async () => {
    const token = localStorage.getItem('phishshield_token');
    if (!token) return null;
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await apiClient.get('/api/v1/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('phishshield_token');
    delete apiClient.defaults.headers.common['Authorization'];
  },

  // Phase 6C: Admin Governance
  listAdminUsers: async () => {
    const response = await apiClient.get('/api/v1/admin/users');
    return response.data;
  },

  createAdminUser: async (userData) => {
    const response = await apiClient.post('/api/v1/admin/users', userData);
    return response.data;
  },

  updateAdminUser: async (userId, data) => {
    const response = await apiClient.patch(`/api/v1/admin/users/${userId}`, data);
    return response.data;
  },

  deleteAdminUser: async (userId) => {
    const response = await apiClient.delete(`/api/v1/admin/users/${userId}`);
    return response.data;
  },

  listManagedBanks: async () => {
    const response = await apiClient.get('/api/v1/admin/banks');
    return response.data;
  },

  addManagedBank: async (bankData) => {
    const response = await apiClient.post('/api/v1/admin/banks', bankData);
    return response.data;
  },

  deleteManagedBank: async (bankId) => {
    const response = await apiClient.delete(`/api/v1/admin/banks/${bankId}`);
    return response.data;
  },

  listWebhooks: async () => {
    const response = await apiClient.get('/api/v1/admin/webhooks');
    return response.data;
  },

  createWebhook: async (webhookData) => {
    const response = await apiClient.post('/api/v1/admin/webhooks', webhookData);
    return response.data;
  },

  testWebhook: async (webhookId) => {
    const response = await apiClient.post(`/api/v1/admin/webhooks/${webhookId}/test`);
    return response.data;
  },

  deleteWebhook: async (webhookId) => {
    const response = await apiClient.delete(`/api/v1/admin/webhooks/${webhookId}`);
    return response.data;
  },

  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/api/v1/admin/audit-logs${query ? '?' + query : ''}`);
    return response.data;
  },
};

export default apiClient;

