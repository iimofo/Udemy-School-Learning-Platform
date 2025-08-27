# School Learning Platform

A private Udemy-like platform for schools built with React, Firebase, and Tailwind CSS.

## 🚀 Features

### Authentication
- Google Sign-in authentication
- User role management (Student, Teacher, Admin)
- Protected routes based on user roles

### Student Features
- Browse available courses
- Enroll in courses
- Watch video lessons
- Track learning progress
- Download course materials

### Teacher Features
- Create and manage courses
- Upload video lessons and materials
- Monitor student progress
- Manage course content

### Admin Features
- User role management
- Course moderation
- Platform administration

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Authentication**: Firebase Auth (Google Sign-in)
- **Database**: Firestore (courses, lessons, users, progress)
- **Storage**: Firebase Storage (videos, PDFs, images)
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd folder
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Google Sign-in
4. Create a Firestore database
5. Enable Storage
6. Get your Firebase configuration

### 3. Configure Firebase

1. Open `src/config/firebase.js`
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 4. Firestore Security Rules

Set up your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Students can read courses and lessons
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['teacher', 'admin'];
    }
    
    match /courses/{courseId}/lessons/{lessonId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['teacher', 'admin'];
    }
    
    // Enrollments
    match /enrollments/{enrollmentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Storage Rules

Set up your Firebase Storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role in ['teacher', 'admin'];
    }
  }
}
```

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── config/             # Firebase configuration
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── utils/              # Utility functions
└── assets/             # Static assets
```

## 🎯 Current Status

### Project Setup & Authentication
- [x] React + Vite + Tailwind CSS setup
- [x] Firebase configuration and initialization
- [x] Google Sign-in authentication
- [x] User role management (student/teacher/admin)
- [x] Protected routes and navigation

### UI/UX Design
- [x] Modern, responsive design with Tailwind CSS
- [x] Beautiful login page with gradient design
- [x] Dashboard with role-based content
- [x] Course browser with search and filtering
- [x] Course creation form with image upload

### Course Management
- [x] Course creation with Firebase Storage for images
- [x] Course browsing with real-time data
- [x] Course enrollment system
- [x] Course detail pages with real data
- [x] Dashboard integration with real enrollment data

### Real-time Data Integration
- [x] All pages now use real Firebase data
- [x] Course browser shows actual courses from Firestore
- [x] Dashboard displays real enrollment counts and course lists
- [x] Course detail pages show real course information
- [x] Progress tracking integration

### Lesson Player & Video Upload
- [x] Lesson player with real video controls and progress tracking
- [x] Video upload system for teachers with preview
- [x] File upload for lesson materials (PDFs, docs, etc.)
- [x] Real-time progress tracking and lesson completion
- [x] Lesson management system with Firebase integration
- [x] Course navigation between lessons
- [x] Material download functionality

### Admin Features
- [x] Admin dashboard with comprehensive overview
- [x] User management system (view, edit roles, delete users)
- [x] Course moderation tools (approve, reject, delete courses)
- [x] Platform analytics and statistics
- [x] Recent activity tracking
- [x] Real-time data integration with Firebase
- [x] Role-based access control (admin-only routes)
- [x] Search and filter functionality for users and courses

### Advanced Search & Filtering
- [x] Enhanced search bar with real-time suggestions
- [x] Advanced filtering system (price, duration, rating, difficulty)
- [x] Multiple sorting options (newest, popular, rating, price, title)
- [x] Search suggestions with course, category, and instructor matching
- [x] Popular searches and trending topics component
- [x] Filter count display and clear all filters functionality
- [x] Collapsible advanced filters panel
- [x] Click-outside to close search suggestions
- [x] Improved empty state with search recommendations

### Real-time Notifications
- [x] Real-time notification system with Firebase integration
- [x] Notification center with comprehensive UI
- [x] Multiple notification types (course announcements, enrollments, lessons, completions)
- [x] Teacher-student messaging system
- [x] Course announcement functionality for teachers
- [x] Real-time unread count and notification badges
- [x] Mark as read/unread functionality
- [x] Notification filtering and management
- [x] Browser notification support
- [x] Automatic notifications for course events

### Course Ratings & Reviews
- [x] Star rating system with interactive components
- [x] Review submission and display system
- [x] Rating analytics and statistics
- [x] Review moderation tools for users
- [x] Rating distribution visualization
- [x] Real-time rating updates
- [x] User rating management (edit/delete)
- [x] Course quality indicators
- [x] Rating display on course cards and detail pages
- [x] Teacher rating analytics

### Mobile App Optimization
- [x] Progressive Web App (PWA) setup with manifest and service worker
- [x] Mobile-first responsive design with touch-optimized UI
- [x] Touch gesture support (swipe navigation, double-tap seeking)
- [x] Offline support with lesson caching and background sync
- [x] Mobile-optimized lesson player with auto-hiding controls
- [x] PWA installation prompts and app shortcuts
- [x] Push notifications and browser notifications
- [x] Mobile navigation with slide-out menu
- [x] Settings page with PWA management
- [x] Performance optimizations and caching strategies

### **All Phases Completed by Mofo!**

**fully-featured, mobile-optimized Progressive Web App** with:
- ✅ **Complete Course Management System**
- ✅ **Real-time Notifications & Messaging**
- ✅ **Advanced Search & Filtering**
- ✅ **Comprehensive Rating & Review System**
- ✅ **Mobile-First PWA Experience**
- ✅ **Offline Learning Capabilities**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue in the repository.

## 🔒 Security

This project uses environment variables to keep sensitive information secure. Never commit your `.env` file to version control. The `.env.example` file serves as a template for required environment variables.

### Environment Variables Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
   ```

3. Update `src/config/firebase.js` to use environment variables:
   ```javascript
   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID,
     measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
   };
   ```
