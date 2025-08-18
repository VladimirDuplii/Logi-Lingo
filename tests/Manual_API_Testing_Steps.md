# Manual Testing Steps for LogicLingo API

Since we're having some issues with the curl commands, let's use Postman directly to test our API. Follow these steps:

## Prerequisites

1. Make sure your Laravel server is running with `php artisan serve`
2. Open Postman and import the collection from `tests/postman/LogicLingo_API_Tests.postman_collection.json`

## Testing Steps

### 1. Authentication Flow

#### 1.1 Register a New User

1. In Postman, go to the "LogicLingo API Tests" collection → "Авторизація" folder → "Реєстрація користувача"
2. Verify the following settings:
    - Method: POST
    - URL: http://127.0.0.1:8000/api/v1/auth/register
    - Headers:
        - Accept: application/json
        - Content-Type: application/json
    - Body (raw JSON):
    ```json
    {
        "name": "Test User",
        "email": "test3@example.com",
        "password": "password123",
        "password_confirmation": "password123"
    }
    ```
    Note: Change the email address if needed to create a new user
3. Click "Send" and check the response
    - Expected: 201 Created with user information in the response

#### 1.2 Login with the New User

1. Go to "Авторизація користувача" in the same folder
2. Verify settings:
    - Method: POST
    - URL: http://127.0.0.1:8000/api/v1/auth/login
    - Headers: Same as above
    - Body:
    ```json
    {
        "email": "test3@example.com",
        "password": "password123"
    }
    ```
3. Click "Send" and check the response
    - Expected: 200 OK with access token in the response
4. **Important**: Copy the access token from the response (it will look like `1|XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

#### 1.3 Test Protected Endpoint

1. Go to "Курси" folder → "Отримання списку курсів"
2. Verify settings:
    - Method: GET
    - URL: http://127.0.0.1:8000/api/v1/courses
    - Headers:
        - Accept: application/json
        - Authorization: Bearer YOUR_TOKEN_HERE (paste the token you copied)
3. Click "Send" and check the response
    - Expected: 200 OK with a list of courses

### 2. Debugging Authentication Issues

If you receive a 401 Unauthorized error, check the following:

#### 2.1 Verify Token Format

Make sure the Authorization header is in the format: `Bearer YOUR_TOKEN_HERE` with a space after "Bearer"

#### 2.2 Check Token Validity

Try to get your user profile to verify the token is valid:

1. Go to "Авторизація" folder → "Отримання профілю"
2. Use the same Authorization header as above
3. Send the request
    - If this works but other endpoints don't, the issue might be with permissions or route configuration

#### 2.3 Check Sanctum Configuration

1. Check `config/sanctum.php` to ensure stateful domains are correctly configured
2. Check `config/cors.php` to ensure CORS is properly configured with `'supports_credentials' => true`

### 3. Testing Progress Endpoints

If the courses endpoint works, try the progress endpoints:

1. Go to "Прогрес" folder → "Отримання прогресу користувача"
2. Use the same Authorization header
3. Send the request
    - Expected: 200 OK with user progress data

## Conclusion

After completing these tests, document your findings:

1. Which endpoints worked correctly?
2. Which endpoints returned errors?
3. What was the exact error message and status code?
4. Did you identify any patterns in the errors?

This information will be valuable for diagnosing and fixing any authentication issues in the application.
