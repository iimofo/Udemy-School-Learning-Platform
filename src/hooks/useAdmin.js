import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

export const useAdmin = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalTeachers: 0,
    totalStudents: 0,
    pendingCourses: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [usersData, coursesData, statsData, activityData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllCourses(),
        adminService.getPlatformStats(),
        adminService.getRecentActivity()
      ]);

      setUsers(usersData);
      setCourses(coursesData);
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      return { success: true, message: 'User role updated successfully' };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await adminService.deleteUser(userId);
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      return { success: true, message: 'User deleted successfully' };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCourseStatus = async (courseId, status) => {
    try {
      await adminService.updateCourseStatus(courseId, status);
      
      // Update local state
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId ? { ...course, status } : course
        )
      );

      return { success: true, message: 'Course status updated successfully' };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await adminService.deleteCourse(courseId);
      
      // Update local state
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
      
      return { success: true, message: 'Course deleted successfully' };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Filter users by role
  const getUsersByRole = (role) => {
    if (role === 'all') return users;
    return users.filter(user => user.role === role);
  };

  // Filter courses by status
  const getCoursesByStatus = (status) => {
    if (status === 'all') return courses;
    return courses.filter(course => course.status === status);
  };

  // Search users
  const searchUsers = (searchTerm) => {
    if (!searchTerm) return users;
    return users.filter(user => 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Search courses
  const searchCourses = (searchTerm) => {
    if (!searchTerm) return courses;
    return courses.filter(course => 
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    users,
    courses,
    stats,
    recentActivity,
    loading,
    error,
    fetchAllData,
    updateUserRole,
    deleteUser,
    updateCourseStatus,
    deleteCourse,
    getUsersByRole,
    getCoursesByStatus,
    searchUsers,
    searchCourses
  };
};
