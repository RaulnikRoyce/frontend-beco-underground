import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000'
});

// Este "Interceptor" coloca o token no cabeçalho de TODAS as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token_beco');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;