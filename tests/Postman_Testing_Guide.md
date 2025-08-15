# Using Postman for API Testing in LogicLingo

This guide will walk you through the process of testing the LogicLingo API using Postman.

## Prerequisites

1. Ensure the Laravel development server is running:
   ```bash
   php artisan serve
   ```

2. Postman desktop client or web version installed

## Setting Up Postman

1. **Import the Collection**
   - Open Postman
   - Click on "Import" button
   - Select the file: `tests/postman/LogicLingo_API_Tests.postman_collection.json`
   - The collection "LogicLingo API Tests" should now appear in your collections list

2. **Create an Environment**
   - Click on "Environments" in the sidebar
   - Click "Create Environment" and name it "LogicLingo Local"
   - Add the following variables:
     - `baseUrl`: Value = `http://127.0.0.1:8000`
     - `auth_token`: Leave value empty (will be set during testing)
   - Save the environment
   - Select the "LogicLingo Local" environment from the environment dropdown in the top right

## Testing Authentication Flow

### Step 1: Register a New User
1. In the "LogicLingo API Tests" collection, expand "Авторизація" folder
2. Select "Реєстрація користувача"
3. Review the request body which should contain:
   ```json
   {
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123",
       "password_confirmation": "password123"
   }
   ```
4. Modify the email if needed to create a new user
5. Click "Send"
6. Verify you receive a successful response (status 201)

### Step 2: Login
1. Select "Авторизація користувача" in the same folder
2. Review the request body to ensure it matches the user you just created:
   ```json
   {
       "email": "test@example.com",
       "password": "password123"
   }
   ```
3. Click "Send"
4. Verify you receive a successful response (status 200) with an access token
5. Confirm that the `auth_token` environment variable has been automatically set (you can check in the "Environment" panel)

### Step 3: Get User Profile
1. Select "Отримання профілю"
2. Verify that the Authorization tab shows "Bearer Token" with "{{auth_token}}" as the token
3. Click "Send"
4. Verify you receive a successful response (status 200) with user information

## Testing Course Endpoints

### Step 1: Get All Courses
1. Expand the "Курси" folder
2. Select "Отримання списку курсів"
3. Click "Send"
4. Verify you receive a successful response (status 200) with a list of courses

### Step 2: Get Course Details
1. Select "Отримання деталей курсу"
2. The URL should be `/api/v1/courses/1` (or change the ID if needed)
3. Click "Send"
4. Verify you receive a successful response (status 200) with course details

### Step 3: Set Active Course
1. Select "Встановлення активного курсу"
2. The URL should be `/api/v1/courses/1/active` (or change the ID if needed)
3. Click "Send"
4. Verify you receive a successful response (status 200)

## Testing Progress Endpoints

### Step 1: Get User Progress
1. Expand the "Прогрес" folder
2. Select "Отримання прогресу користувача"
3. Click "Send"
4. Verify you receive a successful response (status 200) with user progress data

### Step 2: Get Course Progress
1. Select "Отримання прогресу по курсу"
2. The URL should be `/api/v1/progress/courses/1` (or change the ID if needed)
3. Click "Send"
4. Verify you receive a successful response (status 200) with course progress data

## Troubleshooting Common Issues

### 401 Unauthorized Errors
If you encounter 401 errors:
1. Verify that you're logged in and have a valid token
2. Try logging in again to refresh the token
3. Check that the token is being correctly included in the request headers
4. Ensure the token hasn't expired

### 404 Not Found Errors
If you encounter 404 errors:
1. Verify the URL is correct
2. Check that the resource ID exists (for endpoints that require an ID)
3. Ensure the API server is running

### 500 Server Errors
If you encounter 500 errors:
1. Check the Laravel server logs for detailed error information
2. Verify database connections and migrations
3. Check for validation errors in your request payload

## Advanced Testing

### Using Test Scripts
Postman allows you to write JavaScript test scripts to automate verification:

1. Select a request
2. Go to the "Tests" tab
3. Add test scripts like:
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });
   
   pm.test("Response contains access_token", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData.data.access_token).to.exist;
   });
   ```

### Creating Test Runs
To run multiple tests in sequence:
1. Click on the "..." next to the collection name
2. Select "Run collection"
3. Configure which requests to run
4. Click "Run"
5. Review the test results report

## Exporting Test Results
After running tests:
1. In the Collection Runner, click "Export Results"
2. Choose your preferred format (JSON, CSV, HTML)
3. Save the file for documentation or issue reporting
