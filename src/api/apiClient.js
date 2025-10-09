// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL:'http://localhost:5001/api',
  withCredentials: true,
});

export default apiClient;