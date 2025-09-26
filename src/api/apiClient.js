// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://server.sbbs.co.in:5002/api',
  withCredentials: true,
});

export default apiClient;