// services/api.js
// This creates a central Axios instance so every API call in our app uses the same base settings.

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach the saved token (if any) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;