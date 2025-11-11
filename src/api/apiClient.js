// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  // baseURL:'https://keysystem.in/api',
  baseURL:'http://localhost:5001/api',
  withCredentials: true,
  timeout: 10000,
});

export default apiClient;