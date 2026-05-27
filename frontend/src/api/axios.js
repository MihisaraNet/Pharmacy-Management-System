import axios from 'axios';

// Create a new Axios instance with the correct base URL
const api = axios.create({
    baseURL: 'http://localhost:8082'
});

// Use an interceptor to add the JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
