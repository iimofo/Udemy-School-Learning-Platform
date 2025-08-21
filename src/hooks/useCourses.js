import { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorCourses = async (instructorId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getCoursesByInstructor(instructorId);
      setCourses(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching instructor courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData) => {
    try {
      setError(null);
      const courseId = await courseService.createCourse(courseData);
      // Don't auto-refresh here to avoid conflicting with navigation
      return courseId;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const enrollInCourse = async (courseId, userId) => {
    try {
      setError(null);
      await courseService.enrollInCourse(courseId, userId);
      // Update the course in the list to reflect new student count
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId 
            ? { ...course, students: (course.students || 0) + 1 }
            : course
        )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const checkEnrollment = async (courseId, userId) => {
    try {
      return await courseService.isEnrolled(courseId, userId);
    } catch (err) {
      console.error('Error checking enrollment:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    fetchInstructorCourses,
    createCourse,
    enrollInCourse,
    checkEnrollment
  };
};

export const useCourse = (courseId) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourse = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getCourseById(courseId);
      setCourse(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  return {
    course,
    loading,
    error,
    fetchCourse
  };
};

export const useUserEnrollments = (userId) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrollments = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getUserEnrollments(userId);
      setEnrollments(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [userId]);

  return {
    enrollments,
    loading,
    error,
    fetchEnrollments
  };
};
