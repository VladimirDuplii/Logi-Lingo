# API Testing Plan for LogicLingo

## Authentication Endpoints

### 1. Register a New User

-   **Endpoint**: POST `/api/v1/auth/register`
-   **Test Cases**:
    -   Successful registration with valid data
    -   Failed registration with missing fields
    -   Failed registration with invalid email format
    -   Failed registration with password mismatch
    -   Failed registration with existing email

### 2. Login

-   **Endpoint**: POST `/api/v1/auth/login`
-   **Test Cases**:
    -   Successful login with valid credentials
    -   Failed login with invalid email
    -   Failed login with incorrect password
    -   Failed login with missing fields

### 3. Get User Profile

-   **Endpoint**: GET `/api/v1/auth/me`
-   **Test Cases**:
    -   Successful profile retrieval with valid token
    -   Failed profile retrieval with invalid token
    -   Failed profile retrieval with expired token

### 4. Logout

-   **Endpoint**: POST `/api/v1/auth/logout`
-   **Test Cases**:
    -   Successful logout with valid token
    -   Failed logout with invalid token

## Courses Endpoints

### 1. Get All Courses

-   **Endpoint**: GET `/api/v1/courses`
-   **Test Cases**:
    -   Successful retrieval of courses with valid token
    -   Failed retrieval with invalid token

### 2. Get Course Details

-   **Endpoint**: GET `/api/v1/courses/{id}`
-   **Test Cases**:
    -   Successful retrieval of course details with valid ID and token
    -   Failed retrieval with non-existent course ID
    -   Failed retrieval with invalid token

### 3. Set Active Course

-   **Endpoint**: POST `/api/v1/courses/{id}/active`
-   **Test Cases**:
    -   Successful setting of active course with valid ID and token
    -   Failed setting with non-existent course ID
    -   Failed setting with invalid token

## Progress Endpoints

### 1. Get User Progress

-   **Endpoint**: GET `/api/v1/progress`
-   **Test Cases**:
    -   Successful retrieval of user progress with valid token
    -   Failed retrieval with invalid token

### 2. Get Course Progress

-   **Endpoint**: GET `/api/v1/progress/courses/{courseId}`
-   **Test Cases**:
    -   Successful retrieval of course progress with valid course ID and token
    -   Failed retrieval with non-existent course ID
    -   Failed retrieval with invalid token

### 3. Update Challenge Progress

-   **Endpoint**: POST `/api/v1/progress/challenges/{challengeId}`
-   **Test Cases**:
    -   Successful update of challenge progress with valid challenge ID and token
    -   Failed update with non-existent challenge ID
    -   Failed update with invalid token

### 4. Reduce Hearts

-   **Endpoint**: POST `/api/v1/progress/hearts/reduce/{challengeId}`
-   **Test Cases**:
    -   Successful reduction of hearts with valid challenge ID and token
    -   Failed reduction with non-existent challenge ID
    -   Failed reduction with invalid token

### 5. Refill Hearts

-   **Endpoint**: POST `/api/v1/progress/hearts/refill`
-   **Test Cases**:
    -   Successful heart refill with valid token
    -   Failed refill with invalid token

## Test Execution Instructions

1. Start the Laravel development server:

    ```bash
    php artisan serve
    ```

2. Import the Postman collection from `tests/postman/LogicLingo_API_Tests.postman_collection.json`

3. Set up environment variables in Postman:

    - `baseUrl`: http://127.0.0.1:8000
    - `auth_token`: Will be automatically set after successful login

4. Execute tests in the order specified above:

    - Register a new user (or use existing credentials)
    - Login to get authentication token
    - Test the remaining endpoints

5. Document any issues encountered during testing
