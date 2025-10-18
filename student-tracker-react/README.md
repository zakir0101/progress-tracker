# Student Progress Tracker - React Application

A modern React application for tracking student progress across multiple IGCSE syllabuses. This application replaces the original monolithic `student_tracker.html` file with a modular, component-based React architecture using Tailwind CSS.

## Features

- **Google OAuth Authentication** - Secure user authentication
- **Multi-Syllabus Support** - Track progress across different syllabus variants
- **Real-time Progress Tracking** - Checkbox-based progress updates with automatic saving
- **Responsive Design** - Mobile-friendly interface
- **Modern React Architecture** - Component-based, hooks-driven development

## Project Structure

```
student-tracker-react/
├── src/
│   ├── components/
│   │   ├── layout/           # Layout components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── StatusMessage.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── SyllabusSelector.jsx
│   │   └── features/         # Feature-specific components
│   │       ├── AuthenticationSection.jsx
│   │       ├── UserInfo.jsx
│   │       ├── SyllabusContent.jsx
│   │       └── TopicItem.jsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useSyllabus.js
│   │   └── useProgress.js
│   ├── pages/                # Page components
│   │   └── StudentTracker.jsx
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Technology Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Google Identity Services** - OAuth authentication

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## API Integration

The React app communicates with the Flask backend using the following endpoints:

- `GET /tracker/student-syllabuses` - Get assigned syllabuses for student
- `GET /tracker/syllabus/{syllabus_id}` - Get syllabus content
- `GET /tracker/student-progress` - Get student progress
- `POST /tracker/update-topic` - Update topic completion status

## Deployment

### Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Deployment Options

1. **Static Hosting** (Netlify, Vercel, GitHub Pages)
   - Upload the `dist/` folder contents
   - Configure redirects for client-side routing

2. **Traditional Web Server** (Apache, Nginx)
   - Serve the `dist/` folder contents
   - Configure fallback to `index.html` for client-side routing

3. **Integration with Flask Backend**
   - Serve the React build from the Flask app
   - Update Flask routes to serve the React app

## Configuration

### Environment Variables

Create a `.env` file for configuration:

```env
VITE_API_BASE_URL=/tracker
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### API Configuration

The API base URL is configured in the hooks:
- `src/hooks/useAuth.js`
- `src/hooks/useSyllabus.js`
- `src/hooks/useProgress.js`

## Component Architecture

### Key Components

- **StudentTracker** - Main page component orchestrating all features
- **AuthenticationSection** - Google OAuth sign-in interface
- **UserInfo** - Display authenticated user information
- **SyllabusSelector** - Dropdown for syllabus selection
- **ProgressBar** - Visual progress indicator
- **SyllabusContent** - Syllabus structure with topics
- **TopicItem** - Individual topic with checkbox

### State Management

- **useAuth** - Authentication state and user session
- **useSyllabus** - Syllabus data and selection
- **useProgress** - Progress tracking and updates

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome 88+, Firefox 78+, Safari 14+, Edge 88+

## Security Considerations

- Google OAuth for secure authentication
- Session management with localStorage
- API rate limiting handled by backend
- No sensitive data stored in frontend

## Performance

- Code splitting with Vite
- Optimized bundle size
- Efficient re-rendering with React hooks
- Tailwind CSS for minimal CSS bundle

## Migration from Original HTML

This React application replaces the original `student_tracker.html` file with:

- ✅ Component-based architecture
- ✅ Modern React state management
- ✅ Tailwind CSS styling
- ✅ Better code organization
- ✅ Improved maintainability
- ✅ Enhanced developer experience

## License

This project is part of the IGCSE Multi-Syllabus Progress Tracker system.