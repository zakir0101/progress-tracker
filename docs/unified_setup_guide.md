# Unified IGCSE Math Progress Tracker - Complete Setup Guide

## Overview
This system provides a complete solution for tracking IGCSE Mathematics student progress with:
- **Student Interface**: Individual progress tracking with Google OAuth authentication
- **Teacher Dashboard**: Comprehensive monitoring of all student progress with Google OAuth
- **Unified Backend**: Flask Python API with SQLite database
- **Data Storage**: Local SQLite database with automatic backups
- **User Identification**: Secure Google OAuth for student and teacher identification

## File Structure
```
/home/zakir/tmp/
├── student_tracker.html          # Student interface with authentication
├── teacher_dashboard.html        # Teacher dashboard with analytics
├── app.py                        # Flask backend API
├── database.py                   # SQLite database management
├── requirements.txt              # Python dependencies
├── unified_api_specification.md  # API documentation
└── unified_setup_guide.md        # This setup guide
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
## Step 2: Configure Frontend Applications

### 2.1 Configure Student Interface
1. Open `student_tracker.html`
2. Find the API configuration section (around line 429):
```javascript
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  SESSION_TIMEOUT: 60 * 60 * 1000
};
```
3. Replace `BASE_URL` with your server URL (e.g., `http://your-vps-ip:5000`)

### 2.2 Configure Teacher Dashboard
1. Open `teacher_dashboard.html`
2. Find the API configuration section (around line 420):
```javascript
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  SESSION_TIMEOUT: 60 * 60 * 1000
};
```
3. Replace `BASE_URL` with your server URL (e.g., `http://your-vps-ip:5000`)

### 2.3 Configure Google OAuth (REQUIRED)
For user identification and security, configure Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Identity Services API
4. Create OAuth 2.0 credentials
5. Update `data-client_id` in both HTML files
6. Configure authorized domains for your VPS/server

## Step 3: Host the Applications

### Option A: Self-Hosted VPS (Recommended)
1. Upload all files to your VPS
2. Install Python and dependencies
3. Configure your web server (Nginx/Apache) to serve the Flask app
4. Serve static HTML files from the same domain
5. Configure SSL certificates for HTTPS

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
1. Open student interface URL
2. Sign in with Google
3. Check some topics as completed
4. Verify progress calculation
5. Submit progress
6. Check Google Sheets for data

### 5.2 Test Teacher Dashboard
1. Open teacher dashboard URL
2. Sign in with Google
3. Verify student list appears
4. Check statistics and charts
5. Test search and filter functionality
6. Export data to CSV

### 5.3 Verify Data Flow
1. Check the SQLite database file `igcse_progress.db`
2. Verify data appears in both `students` and `submissions` tables
3. Confirm data integrity and formatting
4. Check for automatic backups in `backups/` directory

## API Endpoints Reference

### Student Endpoints
- `POST /submit-progress` - Submit student progress
- `GET /student-progress` - Get individual student progress

### Teacher Endpoints
- `GET /all-progress` - Get all student progress data
- `GET /student-list` - Get list of all students
- `POST /register-student` - Register new student

### System Endpoints
- `GET /initialize` - Initialize database

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

#### Form Not Submitting
- Check API configuration in HTML files
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

✅ **Complete Solution** - Student and teacher interfaces
✅ **Secure Authentication** - Google OAuth integration
✅ **Real-time Analytics** - Teacher dashboard with charts
✅ **Data Export** - CSV export functionality
✅ **Mobile Responsive** - Works on all devices
✅ **Free Solution** - Uses Google's free services
✅ **No Email Spam** - Unlike FormSubmit
✅ **Incremental Submissions** - Students can update progress anytime

## Next Steps

1. Deploy the backend following Step 1
2. Configure frontend applications following Step 2
3. Host the applications following Step 3
4. Test the complete system following Step 5
5. Share URLs with students and teachers

The system is now ready for production use with proper authentication, security, and data management.
