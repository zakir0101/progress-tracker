# Unified API Specification - IGCSE Math Progress Tracker

## Overview
This document defines the unified API specification that all components (Student Interface, Teacher Dashboard, Backend) must follow to ensure consistency and interoperability.

## Base Configuration
```javascript
// All frontend components must use these constants
const API_CONFIG = {
  BASE_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
  API_KEY: 'YOUR_API_KEY_HERE',
  SESSION_TIMEOUT: 60 * 60 * 1000 // 1 hour
};
```

## Authentication Headers
All API requests must include:
```javascript
const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_CONFIG.API_KEY,
  'x-session-id': sessionId, // For authenticated requests
  'x-user-email': userEmail  // For authenticated requests
};
```

## API Endpoints

### Student Endpoints

#### 1. Submit Progress
- **Endpoint**: `POST /submit-progress`
- **Authentication**: Required (Student)
- **Request Body**:
```json
{
  "studentId": "google_user_id",
  "studentName": "Student Name",
  "studentEmail": "student@example.com",
  "progressPercentage": 75,
  "completedTopics": ["1.1 Types of number", "1.2 Sets"],
  "totalTopics": 50,
  "completedCount": 38,
  "submissionDate": "2025-01-15T10:30:00Z"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Progress submitted successfully",
  "submission_id": "uuid"
}
```

#### 2. Get Student Progress
- **Endpoint**: `GET /student-progress`
- **Authentication**: Required (Student)
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "submission_id",
      "timestamp": "2025-01-15T10:30:00Z",
      "progress_data": {
        "progressPercentage": 75,
        "completedTopics": ["1.1 Types of number", "1.2 Sets"],
        "totalTopics": 50,
        "completedCount": 38
      }
    }
  ]
}
```

### Teacher Endpoints

#### 1. Get All Student Progress
- **Endpoint**: `GET /all-progress`
- **Authentication**: Required (Teacher)
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "student_email": "student1@example.com",
      "student_name": "Student One",
      "registration_date": "2025-01-01T00:00:00Z",
      "submissions": [
        {
          "id": "submission_id",
          "timestamp": "2025-01-15T10:30:00Z",
          "progress_data": {
            "progressPercentage": 75,
            "completedTopics": ["1.1 Types of number", "1.2 Sets"],
            "totalTopics": 50,
            "completedCount": 38
          }
        }
      ],
      "total_submissions": 1,
      "average_score": 75
    }
  ]
}
```

#### 2. Get Student List
- **Endpoint**: `GET /student-list`
- **Authentication**: Required (Teacher)
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "email": "student1@example.com",
      "name": "Student One",
      "registration_date": "2025-01-01T00:00:00Z",
      "role": "student",
      "status": "active",
      "total_submissions": 5,
      "last_submission": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### 3. Register Student
- **Endpoint**: `POST /register-student`
- **Authentication**: Required (Teacher)
- **Request Body**:
```json
{
  "email": "student@example.com",
  "name": "Student Name",
  "role": "student"
}
```

## Error Responses
All endpoints return consistent error format:
```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

## Common Error Codes
- `400`: Bad Request (Invalid data)
- `401`: Unauthorized (Invalid API key or session)
- `403`: Forbidden (Insufficient permissions)
- `429`: Rate Limit Exceeded
- `500`: Internal Server Error

## Data Validation Rules

### Student Data
- `studentId`: Required, string
- `studentName`: Required, min 2 characters
- `studentEmail`: Required, valid email format
- `progressPercentage`: Required, number between 0-100
- `completedTopics`: Required, array of strings
- `totalTopics`: Required, positive integer
- `completedCount`: Required, number <= totalTopics

### Authentication
- API key must be provided in all requests
- Session ID required for authenticated endpoints
- User email must match authenticated user
- Rate limiting: 60 requests per minute per user

## Implementation Notes

1. **Frontend Components** must:
   - Use the unified API configuration
   - Include proper authentication headers
   - Handle error responses consistently
   - Validate data before submission

2. **Backend** must:
   - Validate all incoming requests
   - Enforce authentication and authorization
   - Return consistent response formats
   - Log all activities for monitoring

3. **Session Management**:
   - Sessions expire after 1 hour
   - Automatic session cleanup
   - Session validation on every request

This specification ensures all components work together seamlessly with proper security and data consistency.