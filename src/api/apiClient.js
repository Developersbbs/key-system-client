import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api', // Your backend's base URL
  withCredentials: true, // This automatically sends the session cookie
});

export default apiClient;