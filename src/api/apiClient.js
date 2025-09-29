// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL:'https://key-system-server-xqnd.onrender.com/api',
  withCredentials: true,
});

export default apiClient;