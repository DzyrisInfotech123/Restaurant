import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dev.digitalexamregistration.com/api', // Base URL for the backend
});

// Export for use in components
export default api;
