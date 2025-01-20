import axios from 'axios';

// Set base URL globally
const api = axios.create({
  baseURL: 'https://dev.digitalexamregistration.com/api', // Your backend's base URL (without repeating /api)
  // If you're using JWT authentication, you can set it globally for all requests
  // headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

export default api;
