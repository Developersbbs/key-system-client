// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL:'https://server.sbbs.co.in/key-systems/api',
  withCredentials: true,
});

export default apiClient;