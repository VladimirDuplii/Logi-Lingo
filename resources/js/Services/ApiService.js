import axios from 'axios';

const isBrowser = typeof window !== 'undefined' && !!window.location;
const isDevClient = isBrowser && window.location.port && window.location.port !== '8000';
const apiBaseURL = isDevClient ? 'http://127.0.0.1:8000/api/v1' : '/api/v1';

const apiClient = axios.create({
    baseURL: apiBaseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    // Allow Laravel Sanctum cookie-based auth to work in addition to Bearer token
    withCredentials: true,
});

export const setupCsrf = async () => {
    try {
    const base = isDevClient ? 'http://127.0.0.1:8000' : '';
    await axios.get(`${base}/sanctum/csrf-cookie`, { withCredentials: true });
    } catch (error) {
        console.error('CSRF error:', error);
    }
};

export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('auth_token', token);
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
        localStorage.removeItem('auth_token');
        delete apiClient.defaults.headers.Authorization;
    }
};

// Rehydrate token on app load
const existingToken = (typeof window !== 'undefined') ? localStorage.getItem('auth_token') : null;
if (existingToken) {
    apiClient.defaults.headers.Authorization = `Bearer ${existingToken}`;
}

// Attach token on each request (in case it changes during session)
apiClient.interceptors.request.use(
    (config) => {
        const token = (typeof window !== 'undefined') ? localStorage.getItem('auth_token') : null;
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401s globally: drop token; optional redirect can be added
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            try {
                localStorage.removeItem('auth_token');
                delete apiClient.defaults.headers.Authorization;
            } catch (e) {
                // noop
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
