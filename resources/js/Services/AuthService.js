import apiClient from './ApiService';

const AuthService = {
    // Register a new user
    register: async (userData) => {
        try {
            const response = await apiClient.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Login user
    login: async (credentials) => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Logout user
    logout: async () => {
        try {
            const response = await apiClient.post('/auth/logout');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get current user profile
    getCurrentUser: async () => {
        try {
            const response = await apiClient.get('/auth/me');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default AuthService;
