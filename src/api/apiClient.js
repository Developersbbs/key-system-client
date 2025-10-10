// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL:'http://72.60.201.170:5001/api',
  withCredentials: true,
});

export default apiClient;