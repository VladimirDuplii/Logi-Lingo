import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true, // Important for cookies/session
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
    (config) => {
        // You can add logic here to include auth token if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors here (401, 403, 500, etc.)
        if (error.response && error.response.status === 401) {
            // Redirect to login or show auth error
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
