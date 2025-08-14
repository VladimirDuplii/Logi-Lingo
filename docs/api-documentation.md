# LogicLingo API Documentation

This document outlines the API endpoints for the LogicLingo language learning platform.

## Authentication

### Register

- **URL**: `/api/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password",
    "password_confirmation": "password"
  }
  ```
- **Response**: User object with token

### Login

- **URL**: `/api/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password"
  }
  ```
- **Response**: User object with token

### Logout

- **URL**: `/api/logout`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Success message

## Courses

### Get All Courses

- **URL**: `/api/courses`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: List of courses

### Get Course Details

- **URL**: `/api/courses/{id}`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Course details with units

## Units

### Get Units for Course

- **URL**: `/api/courses/{courseId}/units`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: List of units for specified course

### Get Unit Details

- **URL**: `/api/units/{id}`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Unit details with lessons

## Lessons

### Get Lessons for Unit

- **URL**: `/api/units/{unitId}/lessons`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: List of lessons for specified unit

### Get Lesson Details

- **URL**: `/api/lessons/{id}`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Lesson details with challenges

## Challenges

### Get Challenges for Lesson

- **URL**: `/api/lessons/{lessonId}/challenges`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: List of challenges for specified lesson

### Get Challenge Details

- **URL**: `/api/challenges/{id}`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Challenge details with options

### Submit Challenge Answer

- **URL**: `/api/challenges/{id}/submit`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "option_id": 123
  }
  ```
- **Response**: Result with correct/incorrect status and updated user progress

## User Progress

### Get User Progress

- **URL**: `/api/user/progress`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: User progress details

### Set Active Course

- **URL**: `/api/user/progress/course`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "course_id": 1
  }
  ```
- **Response**: Updated user progress

## Subscription

### Get Subscription Status

- **URL**: `/api/user/subscription`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Subscription details

### Create Subscription

- **URL**: `/api/user/subscription`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "payment_method_id": "pm_card_visa"
  }
  ```
- **Response**: Subscription details and client secret for payment confirmation

### Cancel Subscription

- **URL**: `/api/user/subscription`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Success message
