import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Base URL for the backend
});

// Export for use in components
export default api;
