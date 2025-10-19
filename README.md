# AI Interview Coach - React Frontend

A modern React application for AI-powered interview practice. This frontend provides a complete user interface for the AI Interview Coach MVP.

## Features

- **Landing Page**: Demo selection with different interview types
- **Resume Upload**: Image upload with validation and processing
- **Interview Practice**: Interactive question answering with progress tracking
- **Analysis Report**: AI-powered feedback with scores and recommendations

## Tech Stack

- React 19 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Modern UI/UX design

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── LandingPage.jsx      # Demo selection page
│   ├── ResumeUpload.jsx     # Resume upload interface
│   ├── InterviewPage.jsx    # Question answering interface
│   └── ReportPage.jsx       # Analysis results display
├── App.jsx                  # Main app with routing
├── main.jsx                 # Application entry point
└── index.css                # Global styles with Tailwind
```

## API Integration

This frontend is designed to work with a Django REST backend. The following endpoints are expected:

- `GET /api/demos/` - Fetch available demo sessions
- `POST /api/upload-resume/` - Upload resume and generate questions
- `POST /api/submit-answers/` - Submit interview answers
- `POST /api/analyze/` - Get AI analysis report

Currently using mock data for development and testing.

## Development

The application uses modern React patterns including:
- Functional components with hooks
- React Router for client-side routing
- Local storage for state persistence
- Responsive design with Tailwind CSS
