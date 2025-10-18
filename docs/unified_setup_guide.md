# Unified IGCSE Multi-Syllabus Progress Tracker - Complete Setup Guide

## Overview
This system provides a complete solution for tracking IGCSE student progress across multiple syllabuses with:
- **Multi-Syllabus Support**: Track progress across 7+ IGCSE subjects (Mathematics, Physics, etc.)
- **Student Interface**: Individual progress tracking with syllabus selection and Google OAuth authentication
- **Teacher Dashboard**: Comprehensive monitoring of all student progress with syllabus assignment capabilities
- **Unified Backend**: Flask Python API with SQLite database
- **Data Storage**: Local SQLite database with automatic backups
- **User Identification**: Secure Google OAuth for student and teacher identification

## File Structure
```
/home/zakir/tmp/
├── student-tracker-react/        # React application for student progress tracking
│   ├── src/                      # React components and logic
│   ├── package.json              # Dependencies and build scripts
│   └── dist/                     # Built application (production)
├── teacher-dashboard-react/      # React application for teacher management
│   ├── src/                      # React components and state management
│   ├── package.json              # Dependencies and build scripts
│   └── dist/                     # Built application (production)
├── app.py                        # Flask backend API with React app serving
├── database.py                   # SQLite database with multi-syllabus schema
├── template_converter.py         # Syllabus parser for multiple subjects
├── syllabuses/                   # Directory containing syllabus JSON files
│   ├── 0580.json                 # Mathematics 0580 syllabus
│   ├── 0606.json                 # Additional Mathematics 0606 syllabus
│   ├── 0625.json                 # Physics 0625 syllabus
│   └── ...                       # Other syllabuses
├── requirements.txt              # Python dependencies
├── docs/
│   ├── unified_setup_guide.md    # This setup guide
│   └── google_oauth_setup_guide.md # OAuth configuration
└── database_schema_design.md     # Multi-syllabus database schema
```

## Step 1: Set Up Flask Backend

### 1.1 Install Python Dependencies
1. Install Python 3.8+ if not already installed
2. Install required packages:
```bash
pip install -r requirements.txt
```

### 1.2 Configure Environment
1. The system uses environment variables for configuration
2. Set Flask environment:
```bash
export FLASK_ENV="production"
```

### 1.3 Run the Flask Application
1. Start the Flask server:
```bash
python app.py
```
2. The server will run on `http://localhost:5000` by default
3. For production, use a WSGI server like Gunicorn:
```bash
gunicorn app:app --bind 0.0.0.0:5000
```
## Step 2: Set Up React Frontend Applications

### 2.1 Install Node.js Dependencies
1. Navigate to each React application directory:
```bash
cd student-tracker-react
npm install

cd teacher-dashboard-react
npm install
```

### 2.2 Configure API Endpoints
Each React application has environment configuration:

**Student Tracker** (`student-tracker-react/.env`):
```
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**Teacher Dashboard** (`teacher-dashboard-react/.env`):
```
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2.3 Development Mode
Run React applications in development mode:
```bash
# Student tracker (port 5173)
cd student-tracker-react
npm run dev

# Teacher dashboard (port 5174)
cd teacher-dashboard-react
npm run dev
```

### 2.4 Production Build
Build React applications for production:
```bash
cd student-tracker-react
npm run build  # Outputs to student_tracker/

cd teacher-dashboard-react
npm run build  # Outputs to teacher_dashboard/
```

The Flask backend automatically serves the built React applications.

### 2.5 Configure Google OAuth (REQUIRED)
For user identification and security, configure Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Identity Services API
4. Create OAuth 2.0 credentials
5. Update `VITE_GOOGLE_CLIENT_ID` in React app environment files
6. Configure authorized domains for your VPS/server

## Step 3: Host the Applications

### Option A: Self-Hosted VPS (Recommended)
1. Build React applications: `npm run build` in each React app directory
2. Upload all files to your VPS
3. Install Python and dependencies
4. Configure your web server (Nginx/Apache) to serve the Flask app
5. Flask serves the built React applications automatically
6. Configure SSL certificates for HTTPS

### Option B: Shared Hosting with Python Support
1. Upload all files to your hosting provider
2. Ensure Python and Flask are supported
3. Configure your hosting control panel
4. Set up the application as per provider instructions

### Option C: Local Network Deployment
1. Run Flask app on your local machine
2. Configure your router for port forwarding
3. Access via your public IP address
4. Share URLs with students and teachers

## Step 4: Initialize the System

### 4.1 Initialize Database
1. Start the Flask application
2. The system will automatically initialize the database on first run
3. Database file `igcse_progress.db` will be created
4. Alternatively, manually initialize:
   ```bash
   python -c "from database import init_db; init_db()"
   ```

### 4.2 Register Students (Optional)
Students can self-register by:
1. Opening the student interface
2. Signing in with Google
3. Their account will be automatically created

Teachers can manually register students via the dashboard.

## Step 5: Testing the System

### 5.1 Test Student Interface
1. Open student interface URL: `http://your-domain.com/tracker`
2. Sign in with Google
3. Check some topics as completed
4. Verify progress calculation
5. Submit progress
6. Verify real-time updates work

### 5.2 Test Teacher Dashboard
1. Open teacher dashboard URL: `http://your-domain.com/tracker/dashboard`
2. Sign in with Google
3. Verify student list appears
4. Check statistics and charts
5. Test search and filter functionality
6. Export data to CSV

### 5.3 Test React Development Mode
1. Start React development servers:
```bash
cd student-tracker-react && npm run dev
cd teacher-dashboard-react && npm run dev
```
2. Access development URLs:
   - Student: `http://localhost:5173`
   - Teacher: `http://localhost:5174`
3. Test all functionality in development mode
4. Verify hot reload works

### 5.3 Verify Data Flow
1. Check the SQLite database file `igcse_progress.db`
2. Verify data appears in both `students` and `submissions` tables
3. Confirm data integrity and formatting
4. Check for automatic backups in `backups/` directory

## Multi-Syllabus Features

### Available Syllabuses
- **Mathematics 0580** - IGCSE Mathematics
- **Additional Mathematics 0606** - IGCSE Additional Mathematics
- **Further Mathematics 9231** - AS/A Level Further Mathematics
- **Mathematics 9709** - AS/A Level Mathematics
- **Physics 0625** - IGCSE Physics
- **Physics 9702** - AS/A Level Physics
- **Contact Syllabus** - Special syllabus for new students

### Student Onboarding Flow
1. **Initial Sign-up**: Student automatically assigned to "Contact Syllabus"
2. **Contact Syllabus**: Contains "Contact Administrator" and "Enroll in Course" topics
3. **Syllabus Assignment**: Teacher assigns actual syllabuses to student
4. **Progress Tracking**: Student tracks progress across assigned syllabuses

## API Endpoints Reference

### Student Endpoints
- `POST /update-topic` - Update individual topic progress for a specific syllabus
- `GET /student-progress` - Get individual student progress for a specific syllabus
- `GET /student-syllabuses` - Get all syllabuses assigned to a student

### Teacher Endpoints
- `GET /all-progress` - Get progress data for all students across all syllabuses
- `GET /student-list` - Get list of all students
- `GET /all-syllabuses` - Get all available syllabuses
- `GET /syllabus/<syllabus_id>` - Get syllabus structure with variants and topics
- `POST /assign-syllabus` - Assign a syllabus to a student

### System Endpoints
- `GET /initialize` - Initialize database
- `GET /syllabus` - Backward compatibility endpoint (defaults to 0580)

## Security Features

### Authentication
- Google OAuth for user authentication (required for user identification)
- Session timeout after 1 hour
- Secure same-origin requests (no CORS issues)

### Data Protection
- Individual student data isolation
- Teacher-only access to aggregated data
- Input validation and sanitization
- SQLite database with automatic backups

### Rate Limiting
- 60 requests per minute per user
- Automatic abuse prevention

## Troubleshooting

### Common Issues

#### React Apps Not Loading
- Verify React applications were built: `npm run build`
- Check if built files exist in `student_tracker/` and `teacher_dashboard/` directories
- Ensure Flask server is running and serving the React apps
- Check browser console for React errors

#### Form Not Submitting
- Check API configuration in React environment files
- Verify Flask server is running
- Check browser console for errors
- Ensure CORS is properly configured

#### Authentication Issues
- Verify Google OAuth client ID configuration
- Check session storage in browser
- Ensure cookies are enabled
- Verify HTTPS is used for OAuth

#### Data Not Appearing
- Check if SQLite database file exists
- Verify database permissions
- Check Flask application logs
- Ensure database schema is initialized

#### Students Can't Access
- Ensure Flask server is accessible from network
- Check firewall settings
- Verify port forwarding (if applicable)
- Test URLs in incognito mode

### Debug Mode
Enable browser developer tools to:
- Monitor network requests
- Check console for errors
- Verify API responses

## Maintenance

### Regular Tasks
- Monitor database size and performance
- Check Flask application logs
- Update API keys periodically
- Backup student data (automatic backups enabled)

### Data Management
- System automatically manages data storage
- Automatic daily backups to `backups/` directory
- No manual cleanup required
- Data persists across sessions

## Support

For technical support:
1. Check browser console for errors
2. Verify API configuration
3. Test with different browsers
4. Check Google Apps Script execution logs

## Benefits

✅ **Multi-Syllabus Support** - Track progress across 7+ IGCSE subjects
✅ **Flexible Syllabus Management** - Teachers can assign different syllabuses to different students
✅ **Student Onboarding** - Contact syllabus for new students with automatic assignment
✅ **Complete Solution** - Student and teacher interfaces
✅ **Secure Authentication** - Google OAuth integration
✅ **Real-time Analytics** - Teacher dashboard with charts and syllabus filtering
✅ **Data Export** - CSV export functionality with syllabus information
✅ **Mobile Responsive** - Works on all devices
✅ **Free Solution** - Uses Google's free services
✅ **No Email Spam** - Unlike FormSubmit
✅ **Incremental Submissions** - Students can update progress anytime
✅ **Weight-based Progress** - Accurate progress calculation with topic weighting

## Next Steps

1. Deploy the backend following Step 1
2. Configure frontend applications following Step 2
3. Host the applications following Step 3
4. Test the complete system following Step 5
5. Share URLs with students and teachers

The system is now ready for production use with proper authentication, security, and data management.
