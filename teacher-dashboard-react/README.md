# Teacher Dashboard - React Application

A modern React application for the IGCSE Multi-Syllabus Progress Tracker teacher dashboard, converted from the original monolithic HTML file.

## Features

- **Google OAuth Authentication**: Secure login with Google accounts
- **Student Progress Monitoring**: Real-time tracking of student progress across multiple syllabuses
- **Syllabus Assignment**: Assign syllabuses to students
- **Progress Analytics**: Visual charts and statistics
- **Data Export**: Export student progress data to CSV
- **Responsive Design**: Mobile-friendly interface

## Technology Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **Chart.js**: Interactive charts for progress visualization
- **Google Identity Services**: OAuth authentication

## Project Structure

```
src/
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── StatCard.jsx
│   │   ├── StudentCard.jsx
│   │   ├── ProgressBar.jsx
│   │   └── StatusMessage.jsx
│   ├── layout/           # Layout components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── MainLayout.jsx
│   └── features/         # Feature-specific components
│       ├── AuthSection.jsx
│       ├── UserInfo.jsx
│       ├── DashboardContent.jsx
│       ├── StatisticsOverview.jsx
│       ├── SyllabusAssignment.jsx
│       ├── StudentGrid.jsx
│       └── ProgressChart.jsx
├── stores/               # State management
│   ├── authStore.js
│   └── dashboardStore.js
├── App.jsx
├── main.jsx
└── index.css
```

## Setup and Installation

1. **Install Dependencies**:
   ```bash
   cd teacher-dashboard-react
   npm install
   ```

2. **Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Configuration

### Google OAuth
Update the Google OAuth client ID in `AuthSection.jsx`:
```javascript
data-client_id="YOUR_ACTUAL_GOOGLE_OAUTH_CLIENT_ID"
```

### API Configuration
The app expects the Flask backend to be running and accessible at `/tracker` endpoint. Update the `API_CONFIG.BASE_URL` in the stores if needed.

## Key Components

### State Management
- **authStore**: Handles user authentication and session management
- **dashboardStore**: Manages dashboard data, filtering, and API calls

### Authentication Flow
1. User signs in with Google OAuth
2. JWT token is decoded to get user information
3. Session is stored in localStorage with expiration
4. Dashboard data is loaded automatically

### Data Flow
1. Dashboard data is fetched from Flask backend APIs
2. Students are filtered based on search, syllabus, and progress criteria
3. Statistics are calculated from filtered data
4. Charts are updated with current progress distribution

## API Integration

The React app communicates with the Flask backend through the following endpoints:

- `GET /tracker/all-syllabuses` - Fetch all available syllabuses
- `GET /tracker/all-progress` - Fetch all student progress data
- `POST /tracker/assign-syllabus` - Assign syllabus to student

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. The `dist/` folder contains the static files ready for deployment

3. Configure your web server to serve the static files and handle client-side routing

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)

## Development Notes

- The app uses functional components with React hooks
- State is managed with Zustand for simplicity
- Tailwind CSS provides responsive design
- Chart.js with react-chartjs-2 for data visualization
- Auto-refresh every 5 minutes for live data updates