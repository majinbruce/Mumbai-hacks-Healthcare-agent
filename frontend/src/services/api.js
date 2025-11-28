import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Knowledge Management APIs
export const knowledgeAPI = {
  // Get all knowledge entries
  getAllEntries: async (limit = 100, offset = 0) => {
    const response = await api.get(`/knowledge?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  // Add a single knowledge entry
  addEntry: async (entry) => {
    const response = await api.post('/knowledge/add', entry);
    return response.data;
  },

  // Upload file (PDF, CSV, Excel)
  uploadFile: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/knowledge/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  // Delete a knowledge entry
  deleteEntry: async (id) => {
    const response = await api.delete(`/knowledge/${id}`);
    return response.data;
  },
};

// Prediction API
export const predictionAPI = {
  // Make a prediction
  predict: async (predictionData) => {
    const response = await api.post('/predict', predictionData);
    return response.data;
  },

  // Get all predictions
  getAllPredictions: async (limit = 50, offset = 0) => {
    const response = await api.get(`/predictions?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  // Get single prediction by ID
  getPrediction: async (id) => {
    const response = await api.get(`/predictions/${id}`);
    return response.data;
  },
};

export default api;
