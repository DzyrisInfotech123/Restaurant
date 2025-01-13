import axios from 'axios';

// Set base URL globally
const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Your backend's base URL (without repeating /api)
  // If you're using JWT authentication, you can set it globally for all requests
  // headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

export default api;
