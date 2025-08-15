import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

export const setupCsrf = async () => {
    try {
        await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
    } catch (error) {
        console.error('CSRF error:', error);
    }
};

export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('auth_token', token);
    } else {
        localStorage.removeItem('auth_token');
    }
};

export default apiClient;
