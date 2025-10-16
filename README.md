# IGCSE Multi-Syllabus Progress Tracker

A modern web application for tracking student progress across multiple IGCSE syllabuses. Built with Flask backend and responsive HTML/CSS/JavaScript frontend.

## 🎯 Target Audience

- **Students**: Track your progress through IGCSE syllabus topics with real-time updates
- **Teachers**: Manage student assignments and monitor progress across multiple syllabuses
- **Educational Institutions**: Provide structured progress tracking for IGCSE mathematics courses

## ✨ Key Features

### For Students
- **Multi-Syllabus Support**: Track progress across different syllabus variants (Core, Extended)
- **Real-time Progress Updates**: Checkbox-based tracking with automatic saving
- **Visual Progress Indicators**: Progress bars and completion statistics
- **Google OAuth Integration**: Secure authentication with Google accounts

### For Teachers
- **Student Management**: Assign syllabuses to individual students
- **Progress Monitoring**: View overall progress across all students
- **Dashboard Interface**: Clean, intuitive teacher dashboard

## 🚀 Quick Start

### Prerequisites
- **Registered Domain**: Required for Google OAuth integration
- **VPS/Server**: To host the application
- **Google OAuth Credentials**: Configured for your domain

### Testing Setup
For testing purposes, you'll need:
- **Two different Gmail accounts**: One for student role, one for teacher role
- **Google OAuth configuration**: Set up with your domain

Once deployed, access the application at your configured domain path (typically `/tracker`)

## 🛠️ Technical Overview

### Architecture
- **Backend**: Flask with SQLite database
- **Frontend**: Vanilla JavaScript with responsive CSS
- **Authentication**: Google OAuth 2.0
- **Deployment**: VPS with Traefik reverse proxy

### Core Components
- `app.py` - Main Flask application with API endpoints
- `database.py` - Database management with multi-syllabus schema
- `student_tracker.html` - Student-facing progress interface
- `teacher_dashboard.html` - Teacher management dashboard

## 📚 Available Syllabuses

The system currently supports:
- **Mathematics 0580** - Core and Extended variants
- **Contact Syllabus** - Default syllabus for new students

Each syllabus contains structured topics organized by chapters, with automatic progress calculation.

## 🔧 Development & Deployment

### Prerequisites
- Python 3.10+
- SQLite database
- Google OAuth credentials

### Local Development
```bash
# Start the Flask server
python app.py

# Access the application
http://localhost:5000
```

### Production Deployment
```bash
# Deploy to VPS
./deploy.sh

# Initialize database
curl http://your-domain.com/initialize
```

### Application Access

**Student Interface**: `https://your-domain.com/tracker`

**Teacher Dashboard**: `https://your-domain.com/tracker/dashboard`

Once deployed, users can access these URLs directly in their browser to start using the application.

## 📖 Documentation

For detailed technical documentation, see:
- [API Specification](docs/multi_syllabus_api_specification.md)
- [Quick Reference](docs/multi_syllabus_quick_reference.md)
- [Setup Guide](docs/unified_setup_guide.md)
- [Database Schema](database_schema_design.md)

## 🔒 Security Features

- **Rate Limiting**: 60 requests per minute per user
- **Google OAuth**: Secure authentication
- **Session Management**: Automatic session expiration
- **Input Validation**: Server-side validation for all API endpoints

## 📱 User Experience

- **Responsive Design**: Works on desktop and mobile devices
- **Sticky Progress Bar**: Progress indicator stays visible while scrolling
- **Real-time Updates**: No manual saving required
- **Intuitive Interface**: Clean, modern UI with clear navigation

## 🎓 Educational Value

This tool helps:
- **Students**: Visualize learning progress and identify areas needing attention
- **Teachers**: Track class-wide progress and identify struggling students
- **Institutions**: Standardize progress tracking across multiple syllabuses

## 🤝 Contributing

This project is designed for educational institutions tracking IGCSE mathematics progress. For feature requests or contributions, please refer to the technical documentation.

---

*Built for effective IGCSE mathematics education tracking*
