import apiClient, { setAuthToken, setupCsrf } from './ApiService';

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
