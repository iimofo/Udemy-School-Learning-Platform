import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  BookOpen, 
  Users, 
  Settings, 
  Play, 
  Clock, 
  TrendingUp, 
  Plus,
  Search,
  Bell,
  Menu,
  Edit,
  Shield
} from 'lucide-react';
import { useCourses, useUserEnrollments } from '../hooks/useCourses';
import { useLessonProgress } from '../hooks/useLessons';
import { useTeacherProgress } from '../hooks/useTeacherProgress';
import { useNotifications } from '../hooks/useNotifications';
import NotificationCenter from '../components/NotificationCenter';

const Dashboard = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }
  
  // Fetch real data for dashboard
  const { courses: allCourses } = useCourses();
  const { enrollments, loading: enrollmentsLoading } = useUserEnrollments(user?.uid);
  const { progress: userProgress } = useLessonProgress(null, user?.uid);
  const { teacherCourses, getAllStudents, getTopStudents, loading: teacherProgressLoading } = useTeacherProgress(user?.uid);
  
  // Filter courses based on user role
  const userCourses = user?.role === 'teacher' 
    ? allCourses.filter(course => course.instructorId === user.uid)
    : enrollments.map(enrollment => enrollment.course).filter(Boolean);
  
  // Default to student view if no role is set
  const userRole = user?.role || 'student';
  
  // Calculate stats
  const enrolledCoursesCount = userRole === 'student' ? enrollments.length : 0;
  const completedLessonsCount = userProgress.completedLessons.length;
  const allStudents = userRole === 'teacher' ? getAllStudents() : [];
  const totalStudents = userRole === 'teacher' ? allStudents.length : 0;
  const totalLessons = userRole === 'teacher'
    ? userCourses.reduce((total, course) => total + (course.lessons || 0), 0)
    : 0;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Enrolled Courses</p>
              <p className="text-3xl font-bold">{enrolledCoursesCount}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Lessons Completed</p>
              <p className="text-3xl font-bold">{completedLessonsCount}</p>
            </div>
            <Play className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Study Time</p>
              <p className="text-3xl font-bold">0h</p>
            </div>
            <Clock className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">My Enrolled Courses</h3>
            <button 
              onClick={() => navigate('/courses')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          {enrollmentsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your courses...</p>
            </div>
          ) : userCourses.length > 0 ? (
            <div className="space-y-4">
              {userCourses.slice(0, 3).map((course) => (
                <div 
                  key={course.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <div className="flex-shrink-0">
                    {course.coverImage ? (
                      <img 
                        src={course.coverImage} 
                        alt={course.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{course.title}</h4>
                    <p className="text-sm text-gray-500">by {course.instructor}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Play className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
              {userCourses.length > 3 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500">+{userCourses.length - 3} more courses</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No courses enrolled yet</p>
              <p className="text-sm text-gray-400">Browse available courses to get started!</p>
              <button 
                onClick={() => navigate('/courses')}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Courses
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No recent activity</p>
            <p className="text-sm text-gray-400">Your learning activity will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeacherDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">My Courses</p>
              <p className="text-3xl font-bold">{userCourses.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-indigo-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold">{totalStudents}</p>
            </div>
            <Users className="h-8 w-8 text-orange-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">Total Lessons</p>
              <p className="text-3xl font-bold">{totalLessons}</p>
            </div>
            <Play className="h-8 w-8 text-teal-200" />
          </div>
        </div>
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
            <button 
              onClick={() => navigate('/create-course')}
              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Course
            </button>
          </div>
          {userCourses.length > 0 ? (
            <div className="space-y-4">
              {userCourses.slice(0, 3).map((course) => (
                <div 
                  key={course.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <div className="flex-shrink-0">
                    {course.coverImage ? (
                      <img 
                        src={course.coverImage} 
                        alt={course.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{course.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{course.students || 0} students</span>
                      <span>{course.lessons || 0} lessons</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Edit className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
              {userCourses.length > 3 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500">+{userCourses.length - 3} more courses</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No courses created yet</p>
              <p className="text-sm text-gray-400">Create your first course to get started!</p>
              <button 
                onClick={() => navigate('/create-course')}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Student Progress</h3>
            {allStudents.length > 0 && (
              <button 
                onClick={() => navigate('/courses')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </button>
            )}
          </div>
          
          {teacherProgressLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading student progress...</p>
            </div>
          ) : allStudents.length > 0 ? (
            <div className="space-y-4">
              {getTopStudents(3).map((student, index) => (
                <div key={student.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {student.photoURL ? (
                      <img 
                        src={student.photoURL} 
                        alt={student.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                      <span className="text-sm text-gray-500">{student.progressPercentage}%</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{student.courseTitle}</p>
                    
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${student.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {allStudents.length > 3 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500">
                    +{allStudents.length - 3} more students
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No students enrolled yet</p>
              <p className="text-sm text-gray-400">Student progress will appear here once they enroll</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <Users className="h-8 w-8 text-red-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Total Courses</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <BookOpen className="h-8 w-8 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Active Teachers</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <Users className="h-8 w-8 text-pink-200" />
          </div>
        </div>
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <Settings className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">Manage user roles and permissions across the platform.</p>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Manage Users
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Course Moderation</h3>
            <BookOpen className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">Review and moderate course content for quality assurance.</p>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Review Courses
          </button>
        </div>
      </div>
    </div>
  );

  const getDashboardContent = () => {
    switch (userRole) {
      case 'student':
        return renderStudentDashboard();
      case 'teacher':
        return renderTeacherDashboard();
      case 'admin':
        return renderAdminDashboard();
      default:
        return renderStudentDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  School Learning Platform
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </button>
              )}
              <button 
                onClick={() => setShowNotifications(true)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {/* Notification badge will be added here */}
              </button>
              
              <div className="flex items-center space-x-3">
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName}
                    className="h-8 w-8 rounded-full border-2 border-gray-200"
                  />
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">
                    {user.displayName}
                  </p>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {userRole}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.displayName?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your {userRole} account today.
          </p>
        </div>
        
        {getDashboardContent()}
      </main>

      {/* Notification Center */}
      <NotificationCenter 
        user={user}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default Dashboard;
