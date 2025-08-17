import apiClient, { setAuthToken, setupCsrf } from './ApiService';
import axios from 'axios';

const AuthService = {
    // Register a new user
    register: async (userData) => {
        try {
            // Ініціалізуємо CSRF захист
            await setupCsrf();
            
            const response = await apiClient.post('/auth/register', userData);
            
            // Зберігаємо токен
            if (response.data.success && response.data.data.access_token) {
                setAuthToken(response.data.data.access_token);
            }
            
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // Login user
    login: async (credentials) => {
        try {
            // Ініціалізуємо CSRF захист
            await setupCsrf();
            
            const response = await apiClient.post('/auth/login', credentials);
            
            // Зберігаємо токен
            if (response.data.success && response.data.data.access_token) {
                setAuthToken(response.data.data.access_token);
            }
            
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Establish Laravel web session (for Inertia protected routes)
    webLogin: async (credentials) => {
        try {
            // Ensure CSRF cookie is set and send cookies with the request
            await setupCsrf();
            await axios.post('/login', {
                email: credentials.email,
                password: credentials.password,
                remember: !!credentials.remember,
            }, { withCredentials: true });
            return { success: true };
        } catch (error) {
            console.error('Web session login error:', error);
            throw error;
        }
    },

    // Logout user
    logout: async () => {
        try {
            const response = await apiClient.post('/auth/logout');
            
            // Видаляємо токен
            setAuthToken(null);
            
            return response.data;
        } catch (error) {
            console.error('Logout error:', error);
            
            // Видаляємо токен навіть при помилці
            setAuthToken(null);
            
            throw error;
        }
    },

    // Get current user profile
    getCurrentUser: async () => {
        try {
            const response = await apiClient.get('/auth/me');
            return response.data;
        } catch (error) {
            console.error('Get current user error:', error);
            throw error;
        }
    },
    
    // Перевірка чи користувач авторизований
    isAuthenticated: () => {
        return localStorage.getItem('auth_token') !== null;
    }
};

export default AuthService;
