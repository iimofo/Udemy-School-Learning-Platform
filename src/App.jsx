import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseBrowser from './pages/CourseBrowser';
import CreateCourse from './pages/CreateCourse';
import CourseDetail from './pages/CourseDetail';
import LessonPlayer from './pages/LessonPlayer';
import AddLesson from './pages/AddLesson';
import EditCourse from './pages/EditCourse';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login key="login" />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard key="dashboard" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses" 
            element={
              <ProtectedRoute>
                <CourseBrowser key="courses" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-course" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <CreateCourse />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses/:courseId" 
            element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses/:courseId/add-lesson" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <AddLesson />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses/:courseId/edit" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <EditCourse />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses/:courseId/lessons/:lessonId" 
            element={
              <ProtectedRoute>
                <LessonPlayer />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
