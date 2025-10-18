# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an IGCSE Multi-Syllabus Progress Tracker - a Flask web application with React frontends for tracking student progress across multiple IGCSE syllabuses. The system supports student progress tracking, teacher dashboard for assignment management, and multi-syllabus support with automatic enrollment workflows.

### Architecture Overview
- **Backend**: Flask REST API with SQLite database
- **Frontend**: Two separate React applications (Student Tracker & Teacher Dashboard)
- **Build System**: Vite for React development and production builds
- **Deployment**: Automated deployment with React build integration

## Core Architecture

### Backend Structure
- **app.py**: Main Flask application with API endpoints and React app serving
- **database.py**: SQLite database management with multi-syllabus schema
- **template_converter.py**: Syllabus data parser that converts JSON syllabus files to database structure

### Frontend Structure
- **student-tracker-react/**: React application for student progress tracking
- **teacher-dashboard-react/**: React application for teacher dashboard and management
- **public/student/**: Built React app output (served by Flask at `/`)
- **public/teacher/**: Built React app output (served by Flask at `/dashboard`)

### React Application Architecture

#### Student Tracker React App
- **Framework**: React 18 with Vite build tool
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks (useState, useEffect, custom hooks)
- **Key Components**:
  - `StudentTracker.jsx`: Main student interface
  - `SyllabusContent.jsx`: Syllabus structure display
  - `TopicItem.jsx`: Individual topic with progress tracking
  - `SyllabusSelector.jsx`: Syllabus selection dropdown
  - `AuthenticationSection.jsx`: Google OAuth integration
  - Custom hooks: `useAuth`, `useSyllabus`, `useProgress`

#### Teacher Dashboard React App
- **Framework**: React 18 with Vite build tool
- **Styling**: Tailwind CSS for responsive design
- **State Management**: Zustand stores for global state
- **Key Components**:
  - `DashboardContent.jsx`: Main dashboard interface
  - `StudentGrid.jsx**: Student list and management
  - `SyllabusAssignment.jsx`: Syllabus assignment system
  - `StatisticsOverview.jsx**: Progress statistics and charts
  - `ProgressChart.jsx`: Chart.js integration for visualizations
  - Stores: `authStore`, `dashboardStore`

### Key Components
- **Multi-syllabus support**: Each syllabus variant is treated as an independent syllabus
- **Contact syllabus**: Automatic enrollment syllabus for new students
- **Real-time progress tracking**: Checkbox-based progress updates with automatic saving
- **Teacher assignment system**: Dropdown-based syllabus assignment to students
- **React component architecture**: Modular, reusable components with proper separation of concerns
- **State management**: React hooks for student app, Zustand stores for teacher app

## Development Commands

### React Development
```bash
# Student Tracker Development
cd student-tracker-react
npm run dev  # Starts development server on http://localhost:3000

# Teacher Dashboard Development
cd teacher-dashboard-react
npm run dev  # Starts development server on http://localhost:3000

# Build React applications
npm run build  # Outputs to ../public/student/ and ../public/teacher/
```

### Deployment
```bash
# Deploy to VPS (primary deployment method)
./deploy.sh

# Start server manually on VPS
./start_server.sh
```
- to deploy and start/restart the server you only need to run ./deploy.sh (run it in background it will not exit and that's normal .. just  wait 6 seconds).
- never run the server locally
- React apps are automatically built during deployment (no manual build required)
- Deployment script excludes old build directories (`student_tracker/`, `teacher_dashboard/`)

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

### API Integration
- **React-Flask Communication**: React apps communicate with Flask backend via REST API
- **Authentication**: Google OAuth handled by Flask, user info passed to React components
- **State Synchronization**: Real-time updates between React state and database
- **Error Handling**: Consistent error responses from Flask, handled gracefully in React

### Deployment Configuration
- Uses Traefik reverse proxy - BASE_URL is empty in app.py
- Server runs on port 5000
- Access URLs:
  - Student Tracker: `https://mamounelkheir.com/tracker/`
  - Teacher Dashboard: `https://mamounelkheir.com/tracker/dashboard`
- Google OAuth required for frontend access
- React apps served as static files from Flask

## Common Development Tasks

### React Development Workflow
1. **Development**: Run `npm run dev` in React app directories
2. **Testing**: Test components with development server on localhost:3000
3. **Building**: Run `npm run build` to generate production builds
4. **Deployment**: Run `./deploy.sh` to deploy built React apps and Flask backend

### Adding New Syllabus
1. Add JSON file to `syllabuses/` directory
2. Run `/initialize` endpoint to rebuild database
3. Verify syllabus appears in `/all-syllabuses` endpoint
4. Test syllabus assignment and progress tracking in React apps

### Debugging Database Issues
1. Check if syllabus variants have unique IDs
2. Verify syllabus data is properly parsed in template_converter.py
3. Use `/initialize` to rebuild database if needed
4. Check React app API calls in browser developer tools

### Frontend Testing
**CRITICAL: Testing should NEVER EVER be done in development environment (npm run dev)**

**Testing must ONLY be performed on the VPS deployment environment:**
- Deploy code using `./deploy.sh` to send to VPS
- Test on production URL: https://mamounelkheir.com/tracker
- Use Playwright MCP (if available) for automated browser testing
- Test both student and teacher React applications in production environment

**Testing Workflow:**
1. Make code changes locally
2. Run `./deploy.sh` to deploy to VPS
3. Wait for deployment to complete (6 seconds)
4. Test on production URL: https://mamounelkheir.com/tracker
5. Use Playwright for automated testing if available

**Test Accounts:**
- Student page: login with `zakirelkheir@gmail.com`
- Teacher page: login with `saleemahmedomer@gmail.com`
- Both accounts are preconfigured - just select them

**Test Coverage:**
- Verify real-time checkbox updates work
- Verify syllabus assignment works
- Test responsive design across different screen sizes
- Test Google OAuth authentication flow
- Verify API integration between React and Flask backend

### React-Specific Debugging
1. **API Integration**: Check browser network tab for API call failures
2. **State Management**: Use React DevTools to inspect component state
3. **Authentication**: Verify Google OAuth flow works correctly
4. **Build Issues**: Check Vite build output for errors


## File Exclusions in Deployment

The deployment script (`deploy.sh`) excludes:
- `.old/`, `.tmp/`, `github-deployment/`, `venv/` directories
- `.git/`, `.claude/` directories
- Database files (`igcse_progress.db`)
- Documentation files and logs
- Old React build directories (`student_tracker/`, `teacher_dashboard/`)
- React apps are built fresh during deployment to `public/student/` and `public/teacher/`

## Error Handling Patterns

- API endpoints return consistent JSON error responses
- Database operations use INSERT OR REPLACE for upsert behavior
- Frontend handles API errors with user-friendly messages
- Rate limiting prevents abuse while maintaining usability



[ NOTE: do not use any tool which insert images (png/jpeg..etc) into this context .. you cannot handle images .. inserting an image will cause you to freeze ]
