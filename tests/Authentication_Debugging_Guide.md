# Diagnosing and Fixing API Authentication Issues

If you're encountering 401 (Unauthorized) errors when trying to access API endpoints like `/api/v1/courses`, follow this systematic debugging approach.

## Step 1: Verify Sanctum Configuration

1. Check your `config/sanctum.php` configuration:

    ```php
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,localhost:8000,127.0.0.1,127.0.0.1:8000,::1',
        env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
    ))),
    ```

2. Ensure your frontend domain is included in the `SANCTUM_STATEFUL_DOMAINS` list.

3. Check CORS configuration in `config/cors.php`:
    ```php
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // Consider restricting this in production
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // This should be true
    ```

## Step 2: Test Authentication Flow with Postman

1. **Get CSRF Cookie (if using web-based SPA auth):**

    - Make a GET request to `/sanctum/csrf-cookie`
    - Ensure cookies are saved

2. **Login with Valid Credentials:**

    - Make a POST request to `/api/v1/auth/login`
    - Request body:
        ```json
        {
            "email": "test@example.com",
            "password": "password123"
        }
        ```
    - Verify you receive a token in the response
    - Save this token for subsequent requests

3. **Test Protected Endpoint with Token:**
    - Make a GET request to `/api/v1/courses`
    - Set Authorization header: `Bearer YOUR_TOKEN`
    - If successful, the authentication system is working correctly

## Step 3: Debug Frontend Authentication

If Postman tests work but your frontend still has issues:

1. **Check Token Storage:**

    - Ensure token is being saved correctly in localStorage or cookies
    - Open browser DevTools -> Application -> Storage to verify

2. **Verify Token Transmission:**

    - Check that the token is being included in API requests
    - Inspect network requests in browser DevTools
    - The Authorization header should be: `Bearer YOUR_TOKEN`

3. **Verify CSRF Protection (for cookies):**
    - If using cookie-based auth, make sure to request the CSRF cookie first
    - Include the XSRF-TOKEN header in subsequent requests

## Step 4: Common Issues and Solutions

### Token Not Being Stored

Check your frontend code that handles the login response. It should extract and store the token:

```javascript
// In your AuthService.js or similar file
login(email, password) {
    return axios.post('/api/v1/auth/login', { email, password })
        .then(response => {
            if (response.data.data.access_token) {
                localStorage.setItem('auth_token', response.data.data.access_token);
            }
            return response;
        });
}
```

### Token Not Being Included in Requests

Ensure your API client is configured to include the token in all requests:

```javascript
// In your ApiService.js or similar file
const apiClient = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Add an interceptor to include the token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
```

### Token Expiration

If your tokens are short-lived, implement a token refresh mechanism:

```javascript
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and not already retrying
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh token
                const response = await apiClient.post("/api/v1/auth/refresh");
                const newToken = response.data.access_token;

                // Save new token
                localStorage.setItem("auth_token", newToken);

                // Update header and retry
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails, logout
                localStorage.removeItem("auth_token");
                // Redirect to login page
                window.location = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
```

## Step 5: Backend Troubleshooting

If the issue persists:

1. **Check Server Logs:**

    ```bash
    php artisan tail
    ```

2. **Verify Route Protection:**
   Check that your routes are correctly protected with the `auth:sanctum` middleware:

    ```php
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/courses', [CourseController::class, 'index']);
        // Other protected routes
    });
    ```

3. **Inspect Request in Controller:**
   Add debugging code to your controller:

    ```php
    public function index(Request $request)
    {
        \Log::info('User attempting to access courses', [
            'user_id' => $request->user() ? $request->user()->id : 'unauthenticated',
            'headers' => $request->headers->all()
        ]);

        // Rest of your controller code
    }
    ```

4. **Test with Tinker:**
    ```bash
    php artisan tinker
    >>> $token = \App\Models\User::find(1)->createToken('test-token')->plainTextToken;
    >>> echo $token;
    ```
    Use this token in Postman to verify if it works.
