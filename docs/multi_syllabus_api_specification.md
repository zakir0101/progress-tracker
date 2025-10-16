# Multi-Syllabus API Specification

## Overview
This document describes the complete API specification for the IGCSE Multi-Syllabus Progress Tracker system. The system supports tracking student progress across multiple IGCSE syllabuses with per-syllabus progress tracking and flexible syllabus assignment.

## Base URL
```
https://zakir.mamounelkheir.com/tracker
```

## Authentication
- All endpoints use Google OAuth for user identification
- Student email is used as the primary identifier
- Rate limiting: 60 requests per minute per user

## Response Format
All responses follow this format:
```json
{
  "success": true/false,
  "data": {},
  "error": "error message"
}
```

## Student API Endpoints

### 1. Update Topic Progress
**Endpoint:** `POST /update-topic`

Updates individual topic progress for a specific syllabus.

**Request Body (JSON):**
```json
{
  "student_email": "student@example.com",
  "student_name": "Student Name",
  "syllabus_id": "0580",
  "topic_id": "0580_core_1_1",
  "is_completed": true
}
```

**Query Parameters (GET alternative):**
- `student_email` (required)
- `student_name` (required)
- `syllabus_id` (optional, defaults to "0580")
- `topic_id` (required)
- `is_completed` (required)

**Response:**
```json
{
  "success": true,
  "message": "Topic progress updated successfully",
  "syllabus_id": "0580",
  "topics": [
    {"id": "0580_core_1_1", "completed": true}
  ],
  "overall_progress": {
    "percentage": 25.0,
    "completed": 5,
    "total": 20
  }
}
```

### 2. Get Student Progress
**Endpoint:** `GET /student-progress`

Gets individual student progress for a specific syllabus.

**Query Parameters:**
- `student_email` (required)
- `syllabus_id` (optional, defaults to "0580")

**Response:**
```json
{
  "success": true,
  "syllabus_id": "0580",
  "progress": {
    "overall_progress": {
      "percentage": 25.0,
      "completed": 5,
      "total": 20
    },
    "topics": [
      {
        "id": "0580_core_1_1",
        "chapter": "Number",
        "subchapter": "Types of number",
        "weight": 1,
        "completed": true
      }
    ]
  }
}
```

### 3. Get Student Syllabuses
**Endpoint:** `GET /student-syllabuses`

Gets all syllabuses assigned to a student.

**Query Parameters:**
- `student_email` (required)

**Response:**
```json
{
  "success": true,
  "syllabuses": [
    {
      "id": "contact",
      "name": "Contact Syllabus",
      "description": "Initial syllabus for new students"
    },
    {
      "id": "0580",
      "name": "Mathematics 0580",
      "description": "IGCSE Mathematics"
    }
  ]
}
```

## Teacher API Endpoints

### 1. Get All Progress
**Endpoint:** `GET /all-progress`

Gets progress data for all students across all syllabuses.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "email": "student1@example.com",
      "name": "Student One",
      "syllabus_name": "Mathematics 0580",
      "progress_percentage": 25.0,
      "completed_count": 5,
      "total_topics": 20,
      "last_updated": "2024-01-15 10:30:00"
    }
  ]
}
```

### 2. Get Student List
**Endpoint:** `GET /student-list`

Gets list of all registered students.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "email": "student1@example.com",
      "name": "Student One",
      "created_at": "2024-01-15 10:30:00"
    }
  ]
}
```

### 3. Get All Syllabuses
**Endpoint:** `GET /all-syllabuses`

Gets all available syllabuses.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "0580",
      "name": "Mathematics 0580",
      "description": "IGCSE Mathematics"
    },
    {
      "id": "contact",
      "name": "Contact Syllabus",
      "description": "Initial syllabus for new students"
    }
  ]
}
```

### 4. Get Syllabus Structure
**Endpoint:** `GET /syllabus/<syllabus_id>`

Gets syllabus structure with variants and topics.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "0580",
    "name": "Mathematics 0580",
    "description": "IGCSE Mathematics",
    "variants": [
      {
        "id": "0580_core",
        "name": "Core",
        "description": "Core curriculum",
        "topics": [
          {
            "id": "0580_core_1_1",
            "chapter_name": "Number",
            "topic_name": "Types of number",
            "topic_number": 1,
            "weight": 1
          }
        ]
      }
    ]
  }
}
```

### 5. Assign Syllabus
**Endpoint:** `POST /assign-syllabus`

Assigns a syllabus to a student.

**Request Body:**
```json
{
  "student_email": "student@example.com",
  "syllabus_id": "0580"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student student@example.com assigned to syllabus 0580"
}
```

## System Endpoints

### 1. Initialize Database
**Endpoint:** `GET /initialize`

Initializes database tables and populates syllabus data.

**Response:**
```json
{
  "status": "success",
  "message": "Database initialized successfully"
}
```

### 2. Backward Compatibility Syllabus
**Endpoint:** `GET /syllabus`

Gets syllabus data in old format (defaults to 0580).

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "number": 1,
      "name": "Number",
      "topics": [
        {
          "id": "0580_core_1_1",
          "number": 1,
          "name": "Types of number",
          "weight": 1
        }
      ]
    }
  ]
}
```

### 3. Health Check
**Endpoint:** `GET /test`

Health check endpoint.

**Response:**
```json
{
  "status": "success",
  "message": "IGCSE Multi-Syllabus Progress Tracker API",
  "version": "2.0"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required parameters: studentEmail, studentName, topicId"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Student not found or no progress data"
}
```

### 429 Rate Limit Exceeded
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error: Error description"
}
```

## Syllabus IDs

| Syllabus ID | Name | Description |
|-------------|------|-------------|
| `0580` | Mathematics 0580 | IGCSE Mathematics |
| `0606` | Additional Mathematics 0606 | IGCSE Additional Mathematics |
| `9231` | Further Mathematics 9231 | AS/A Level Further Mathematics |
| `9709` | Mathematics 9709 | AS/A Level Mathematics |
| `0625` | Physics 0625 | IGCSE Physics |
| `9702` | Physics 9702 | AS/A Level Physics |
| `contact` | Contact Syllabus | Initial syllabus for new students |

## Rate Limiting

- **Students**: 60 requests per minute per email
- **Teacher Dashboard**: 60 requests per minute
- **Syllabus List**: 60 requests per minute

## Data Models

### Student Progress
```json
{
  "student_email": "string",
  "syllabus_id": "string",
  "completed_topics": "string[]",
  "progress_percentage": "float",
  "completed_count": "integer",
  "total_topics": "integer",
  "last_updated": "timestamp"
}
```

### Syllabus Structure
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "variants": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "topics": [
        {
          "id": "string",
          "chapter_name": "string",
          "topic_name": "string",
          "topic_number": "integer",
          "weight": "integer"
        }
      ]
    }
  ]
}
```

## Example Usage

### Student Tracking Progress
```javascript
// Update topic progress
fetch('/tracker/update-topic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    student_email: 'student@example.com',
    student_name: 'Student Name',
    syllabus_id: '0580',
    topic_id: '0580_core_1_1',
    is_completed: true
  })
});

// Get assigned syllabuses
fetch('/tracker/student-syllabuses?student_email=student@example.com');
```

### Teacher Assigning Syllabus
```javascript
// Assign syllabus to student
fetch('/tracker/assign-syllabus', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    student_email: 'student@example.com',
    syllabus_id: '0580'
  })
});

// Get all student progress
fetch('/tracker/all-progress');
```