// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL:'https://keysystem.in/api',
  withCredentials: true,
});

export default apiClient;