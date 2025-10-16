# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an IGCSE Multi-Syllabus Progress Tracker - a Flask web application for tracking student progress across multiple IGCSE syllabuses. The system supports student progress tracking, teacher dashboard for assignment management, and multi-syllabus support with automatic enrollment workflows.

## Core Architecture

### Backend Structure
- **app.py**: Main Flask application with API endpoints and route handling
- **database.py**: SQLite database management with multi-syllabus schema
- **template_converter.py**: Syllabus data parser that converts JSON syllabus files to database structure

### Frontend Structure
- **student_tracker.html**: Student-facing interface for tracking progress
- **teacher_dashboard.html**: Teacher dashboard for student management and syllabus assignment

### Key Components
- **Multi-syllabus support**: Each syllabus variant is treated as an independent syllabus
- **Contact syllabus**: Automatic enrollment syllabus for new students
- **Real-time progress tracking**: Checkbox-based progress updates with automatic saving
- **Teacher assignment system**: Dropdown-based syllabus assignment to students

## Development Commands

### Deployment
```bash
# Deploy to VPS (primary deployment method)
./deploy.sh

# Start server manually on VPS
./start_server.sh
```
- to deploy and start/restart the server you only need to run ./deploy.sh (run it in background it will not exit and that's normal .. just  wait 6 seconds).
- never run the server locally

### Database Management
```bash
# Initialize database (triggers syllabus parsing and setup)
curl http://localhost:5000/initialize
```

### Testing
```bash
# Test API endpoints 
curl http://mamounelkheir/tracker/test
curl http://mamounelkheir/tracker/all-syllabuses
curl http://mamounelkheir/syllabus/0580_core
..etc ( file app.py)
```

## Database Schema

The system uses a multi-syllabus SQLite database with the following key tables:

- **syllabuses**: Master syllabus definitions
- **syllabus_variants**: Syllabus variants (treated as independent syllabuses)
- **syllabus_topics**: Individual topics within variants
- **student_syllabus_assignments**: Student-syllabus relationships
- **student_progress**: Per-syllabus progress tracking
- **students**: Student information

## Key API Endpoints

### Student Endpoints
- `GET/POST /update-topic` - Update topic completion status
- `GET/POST /student-progress` - Get student progress for a syllabus
- `GET/POST /student-syllabuses` - Get syllabuses assigned to student

### Teacher Endpoints
- `GET /all-progress` - Get progress data for all students
- `GET /all-syllabuses` - Get all available syllabuses
- `POST /assign-syllabus` - Assign syllabus to student
- `GET /syllabus/<syllabus_id>` - Get syllabus structure

### System Endpoints
- `GET /initialize` - Initialize/rebuild database
- `GET /test` - Health check

## Syllabus Data Structure

Syllabus data is parsed from JSON files in the `syllabuses/` directory:
- Each course has variants (e.g., 0580_core, 0580_extended)
- Each variant has chapters and topics
- Variants are treated as independent syllabuses in the system
- Unique variant IDs are generated as `{course_id}_{variant_name}_main`

## Important Implementation Details

### Unique Variant IDs
- Critical for database integrity - variant IDs must be unique across all syllabuses
- Generated as `{course_id}_{variant_name}_main` (e.g., `0580_core_main`)
- Prevents primary key collisions in syllabus_variants table

### Contact Syllabus
- Special syllabus with ID "contact" for new students
- Contains topics: "Contact Administrator" and "Enroll in Course"
- Automatically assigned to all new students
- Hidden after teacher assigns actual syllabuses

### Rate Limiting
- Simple in-memory rate limiting (60 requests/minute per user)
- Applied to all student and teacher endpoints
- Prevents abuse while maintaining performance

### Deployment Configuration
- Uses Traefik reverse proxy - BASE_URL is empty in app.py
- Server runs on port 5000
- Access via `https://mamounelkheir.com/tracker/`
- Google OAuth required for frontend access

## Common Development Tasks

### Adding New Syllabus
1. Add JSON file to `syllabuses/` directory
2. Run `/initialize` endpoint to rebuild database
3. Verify syllabus appears in `/all-syllabuses` endpoint

### Debugging Database Issues
1. Check if syllabus variants have unique IDs
2. Verify syllabus data is properly parsed in template_converter.py
3. Use `/initialize` to rebuild database if needed

### Frontend Testing
- Use Playwright with authenticated browser session (Google OAuth required)
- the entry point of the server is mapped to https://mamounelkheir.com/tracker
- when testing the student page ... login with this account zakirelkheir@gmail.com 
- when testing the teacher page .. login with this account saleemahmedomer@gmail.com
- both accounts are preconfigered you just need to select them
- Test both student and teacher dashboards
- Verify real-time checkbox updates work
- Verify syllabus assignment work


## File Exclusions in Deployment

The deployment script (`deploy.sh`) excludes:
- `.old/`, `.tmp/`, `github-deployment/`, `venv/` directories
- `.git/`, `.claude/` directories
- Database files (`igcse_progress.db`)
- Documentation files and logs

## Error Handling Patterns

- API endpoints return consistent JSON error responses
- Database operations use INSERT OR REPLACE for upsert behavior
- Frontend handles API errors with user-friendly messages
- Rate limiting prevents abuse while maintaining usability
