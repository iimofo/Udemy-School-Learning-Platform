import { useState, useEffect } from 'react';
import { lessonService } from '../services/lessonService';

export const useLessons = (courseId) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLessons = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await lessonService.getLessonsByCourse(courseId);
      setLessons(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const createLesson = async (lessonData) => {
    if (!courseId) return;
    
    try {
      setError(null);
      const lessonId = await lessonService.createLesson(courseId, lessonData);
      await fetchLessons(); // Refresh the list
      return lessonId;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateLesson = async (lessonId, updateData) => {
    if (!courseId) return;
    
    try {
      setError(null);
      await lessonService.updateLesson(courseId, lessonId, updateData);
      await fetchLessons(); // Refresh the list
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!courseId) return;
    
    try {
      setError(null);
      await lessonService.deleteLesson(courseId, lessonId);
      await fetchLessons(); // Refresh the list
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  return {
    lessons,
    loading,
    error,
    fetchLessons,
    createLesson,
    updateLesson,
    deleteLesson
  };
};

export const useLesson = (courseId, lessonId) => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLesson = async () => {
    if (!courseId || !lessonId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await lessonService.getLessonById(courseId, lessonId);
      setLesson(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [courseId, lessonId]);

  return {
    lesson,
    loading,
    error,
    fetchLesson
  };
};

export const useLessonProgress = (courseId, userId) => {
  const [progress, setProgress] = useState({
    completedLessons: [],
    progress: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = async () => {
    if (!courseId || !userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await lessonService.getUserProgress(courseId, userId);
      setProgress(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId) => {
    if (!courseId || !userId) return;
    
    try {
      setError(null);
      await lessonService.markLessonComplete(courseId, lessonId, userId);
      await fetchProgress(); // Refresh progress
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const isLessonCompleted = (lessonId) => {
    return progress.completedLessons.includes(lessonId);
  };

  useEffect(() => {
    fetchProgress();
  }, [courseId, userId]);

  return {
    progress,
    loading,
    error,
    fetchProgress,
    markLessonComplete,
    isLessonCompleted
  };
};
