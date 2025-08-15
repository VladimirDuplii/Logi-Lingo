# Fixing 401 (Unauthorized) Errors in LogicLingo

If you're experiencing 401 (Unauthorized) errors when trying to access protected API endpoints like `/api/v1/courses`, follow this systematic approach to diagnose and fix the issues.

## 1. Verify the Authentication Flow

### 1.1 Test the Complete Authentication Flow in Postman
1. **Register** a new user (if needed)
2. **Login** and confirm you receive a token
3. **Use that token** to access a protected endpoint

### 1.2 Confirm Token Generation
After login, check the response structure. You should see something like:
```json
{
  "success": true,
  "data": {
    "access_token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "user": {
      "id": 1,
      "name": "Test User",
      "email": "test@example.com"
    }
  },
  "message": "Успішна авторизація"
}
```

Make sure the `access_token` is being generated correctly.

## 2. Check Frontend Implementation

### 2.1 Verify Token Storage
Check that your frontend code properly stores the token after login:

```javascript
// In AuthService.js or similar
login(email, password) {
  return this.apiService.post('/api/v1/auth/login', { email, password })
    .then(response => {
      if (response.data && response.data.data && response.data.data.access_token) {
        localStorage.setItem('auth_token', response.data.data.access_token);
      }
      return response;
    });
}
```

### 2.2 Verify Token Inclusion in Requests
Check that your API service includes the token in request headers:

```javascript
// In ApiService.js or similar
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);
```

## 3. Backend Configuration Checks

### 3.1 Sanctum Configuration
Check your `config/sanctum.php` file:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,localhost:8000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

Ensure that your frontend domain is included in the stateful domains list.

### 3.2 CORS Configuration
Check your `config/cors.php` file:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // Consider restricting this in production
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // This must be true
];
```

The `supports_credentials` option must be set to `true`.

### 3.3 API Routes
Check that your protected routes are correctly using the `auth:sanctum` middleware:

```php
// In routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/courses', [CourseController::class, 'index']);
    // Other protected routes
});
```

## 4. Common Issues and Solutions

### 4.1 Token Format Issues
The token must be sent in the format:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

There must be a space between "Bearer" and the token.

### 4.2 CORS Issues
If you're seeing CORS errors in the browser console, check:
1. That your frontend and backend domains are correctly configured
2. That `supports_credentials` is set to `true` in CORS configuration
3. That your frontend is making requests with `withCredentials: true` if using cookies

### 4.3 Token Storage
Check browser storage to verify token persistence:
1. Open browser DevTools
2. Go to Application > Storage > Local Storage
3. Look for an `auth_token` entry
4. If it's missing or incorrect, your login flow might not be storing the token properly

## 5. Debugging Techniques

### 5.1 Add Logging to Controllers
Add debug logging to your API controllers:

```php
public function index(Request $request)
{
    \Log::info('User attempting to access courses', [
        'user' => $request->user() ? $request->user()->toArray() : null,
        'headers' => $request->headers->all()
    ]);
    
    // Rest of your controller code
}
```

### 5.2 Inspect Network Requests
In browser DevTools:
1. Go to the Network tab
2. Find your API request
3. Check the "Headers" tab to confirm the Authorization header is being sent
4. Check the "Response" tab to see the detailed error message

## 6. Testing with Tinker

Test token generation directly in Tinker:

```bash
php artisan tinker
>>> $user = \App\Models\User::find(1); // Or use your test user ID
>>> $token = $user->createToken('test-token')->plainTextToken;
>>> echo $token;
```

Then use this token in Postman to see if it works.

## 7. Final Checklist

✅ Server is running  
✅ User can register  
✅ User can login and receive a token  
✅ Token is stored correctly  
✅ Token is included in API requests  
✅ Protected routes are using the auth:sanctum middleware  
✅ CORS is configured correctly  
✅ Sanctum stateful domains include your frontend domain
