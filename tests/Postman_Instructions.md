# Testing LogicLingo API with Postman

## Installation and Setup

1. **Download and Install Postman**

    - Visit [postman.com/downloads](https://www.postman.com/downloads/) and download the appropriate version for your operating system
    - Install and launch Postman

2. **Import the Collection**

    - In Postman, click on "Import" in the top-left corner
    - Select "File" and browse to `V:/project/LogiсLingo/tests/postman/LogicLingo_API_Tests.postman_collection.json`
    - Click "Import" to add the collection to your workspace

3. **Create an Environment**
    - Click on "Environments" in the sidebar (or the gear icon)
    - Click "Create" or "Add" to create a new environment
    - Name it "LogicLingo Local"
    - Add these variables:
        - `baseUrl`: Value = `http://127.0.0.1:8000`
        - `auth_token`: Leave empty initially
    - Save the environment
    - Make sure to select this environment from the dropdown in the top-right corner

## Testing Authentication

### Step 1: Register a User

1. In the collections sidebar, expand "LogicLingo API Tests" and then "Авторизація"
2. Click on "Реєстрація користувача"
3. Review the request body in the "Body" tab and modify the email if needed:
    ```json
    {
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
        "password_confirmation": "password123"
    }
    ```
4. Click "Send"
5. You should receive a response with status 201 Created and the user data

### Step 2: Login

1. In the same folder, click on "Авторизація користувача"
2. Ensure the email and password in the request body match what you used during registration
3. Click "Send"
4. You should receive a response with status 200 OK and an access token
5. The test script in this request should automatically save the token to your environment variables
6. Verify this by clicking on the environment dropdown in the top-right and checking that `auth_token` now has a value

### Step 3: Test Protected Endpoints

1. Expand the "Курси" folder and click on "Отримання списку курсів"
2. Check the "Authorization" tab - it should show Type: "Bearer Token" with Token: "{{auth_token}}"
3. Click "Send"
4. You should receive a response with status 200 OK and a list of courses

## Troubleshooting Authentication Issues

If you receive a 401 Unauthorized error:

### Check Token Value

1. Click on the environment dropdown in the top-right
2. Verify that `auth_token` has a value
3. If it's empty, the login test didn't properly save the token:
    - Go back to the login request
    - After sending, manually copy the token from the response
    - Click on the environment dropdown, edit the current environment
    - Paste the token as the value for `auth_token`
    - Save the environment

### Verify Authorization Header

1. Open the request that's failing
2. Go to the "Headers" tab
3. Ensure there's a header:
    - Key: `Authorization`
    - Value: `Bearer {{auth_token}}`
4. If it's missing, add it manually

### Test with Direct Token

1. If you're still having issues, try using the token directly:
    - Go to the failing request
    - In the "Authorization" tab, select Type: "Bearer Token"
    - Copy and paste the actual token value (not the variable) in the Token field
    - Click "Send"

## Testing the Full API

Once authentication is working, systematically test all endpoints:

1. **Courses Endpoints**

    - "Отримання списку курсів" - GET /api/v1/courses
    - "Отримання деталей курсу" - GET /api/v1/courses/{id}
    - "Встановлення активного курсу" - POST /api/v1/courses/{id}/active

2. **Progress Endpoints**
    - "Отримання прогресу користувача" - GET /api/v1/progress
    - "Отримання прогресу по курсу" - GET /api/v1/progress/courses/{courseId}

## Advanced Testing Features

### Running Collections

To run the entire collection at once:

1. Click on the three dots next to the collection name
2. Select "Run collection"
3. Configure which requests to run and in what order
4. Click "Run"

### Setting Up Test Scripts

You can add test scripts to verify the response:

1. Open a request
2. Go to the "Tests" tab
3. Add JavaScript code to validate the response, for example:

    ```javascript
    pm.test("Status code is 200", function () {
        pm.response.to.have.status(200);
    });

    pm.test("Response contains data", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.data).to.exist;
    });
    ```

## Documenting Results

After testing each endpoint, document:

1. The endpoint URL
2. HTTP method (GET, POST, etc.)
3. Response status code
4. Any error messages
5. The response structure

This documentation will help identify patterns in any issues and assist in troubleshooting.
