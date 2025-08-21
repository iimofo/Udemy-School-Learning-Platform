import { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';

export const useTeacherProgress = (teacherId) => {
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeacherProgress = async () => {
    if (!teacherId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getTeacherStudentProgress(teacherId);
      setTeacherCourses(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching teacher progress:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherProgress();
  }, [teacherId]);

  // Get all students across all courses
  const getAllStudents = () => {
    const allStudents = [];
    teacherCourses.forEach(course => {
      course.students.forEach(student => {
        allStudents.push({
          ...student,
          courseId: course.id,
          courseTitle: course.title
        });
      });
    });
    return allStudents;
  };

  // Get recent student activity (last 7 days)
  const getRecentActivity = () => {
    const allStudents = getAllStudents();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return allStudents.filter(student => {
      const enrolledDate = student.enrolledAt?.toDate?.() || new Date(student.enrolledAt);
      return enrolledDate > oneWeekAgo;
    });
  };

  // Get top performing students
  const getTopStudents = (limit = 5) => {
    const allStudents = getAllStudents();
    return allStudents
      .sort((a, b) => b.progressPercentage - a.progressPercentage)
      .slice(0, limit);
  };

  return {
    teacherCourses,
    loading,
    error,
    fetchTeacherProgress,
    getAllStudents,
    getRecentActivity,
    getTopStudents
  };
};
