import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  Download,
  CheckCircle,
  Circle,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCourse } from '../hooks/useCourses';
import { useLesson, useLessons, useLessonProgress } from '../hooks/useLessons';

const LessonPlayer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();
  const videoRef = useRef(null);
  
  // Fetch real data from Firebase
  const { course, loading: courseLoading, error: courseError } = useCourse(courseId);
  const { lesson, loading: lessonLoading, error: lessonError } = useLesson(courseId, lessonId);
  const { lessons } = useLessons(courseId);
  const { progress: userProgress, markLessonComplete, isLessonCompleted } = useLessonProgress(courseId, user?.uid);
  
  const loading = courseLoading || lessonLoading;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update completion status when lesson data loads
  useEffect(() => {
    if (lesson && user) {
      const lessonCompleted = isLessonCompleted(lesson.id);
      setCompleted(lessonCompleted);
    }
  }, [lesson, user, isLessonCompleted]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setVideoProgress(newProgress);
    
    if (videoRef.current) {
      const time = (newProgress / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen:', err);
        });
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleMarkComplete = async () => {
    try {
      await markLessonComplete(lessonId);
      setCompleted(true);
      console.log('Lesson marked as completed');
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const handleDownload = (material) => {
    try {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = material.url || material;
      link.download = material.name || material;
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading material:', error);
      alert('Error downloading material. Please try again.');
    }
  };

  const getCurrentLessonIndex = () => {
    return lessons.findIndex(l => l.id === lessonId) || 0;
  };

  const getNextLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    return lessons[currentIndex + 1];
  };

  const getPreviousLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    return lessons[currentIndex - 1];
  };

  const navigateToLesson = (lessonId) => {
    navigate(`/courses/${courseId}/lessons/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (lessonError || courseError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading lesson</h3>
          <p className="text-gray-600">{lessonError || courseError}</p>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lesson not found</h3>
          <p className="text-gray-600">The lesson you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(`/courses/${courseId}`)}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{lesson.title}</h1>
                <p className="text-sm text-gray-600">{course?.title}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleMarkComplete}
                disabled={completed}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                  completed
                    ? 'bg-green-100 text-green-800 cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {completed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-2xl overflow-hidden">
              {/* Video Container */}
              <div className="relative aspect-video bg-gray-900">
                {lesson.videoUrl ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    poster={lesson.thumbnailUrl || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop"}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source src={lesson.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No video available</p>
                      <p className="text-sm opacity-75">Video content will appear here once uploaded</p>
                    </div>
                  </div>
                )}
                
                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    {/* Progress Bar */}
                    <div className="mb-4">
                                          <input
                      type="range"
                      min="0"
                      max="100"
                      value={videoProgress}
                      onChange={handleProgressChange}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                    </div>
                    
                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handlePlayPause}
                          className="text-white hover:text-gray-300 transition-colors"
                        >
                          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </button>
                        
                        <button
                          onClick={handleMuteToggle}
                          className="text-white hover:text-gray-300 transition-colors"
                        >
                          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </button>
                        
                        <span className="text-white text-sm">
                          {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(videoDuration)}
                        </span>
                      </div>
                      
                      <button 
                        onClick={handleFullscreen}
                        className="text-white hover:text-gray-300 transition-colors"
                      >
                        {isFullscreen ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <Maximize className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{lesson.title}</h2>
              <p className="text-gray-600 mb-4">{lesson.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {videoDuration > 0 ? formatTime(videoDuration) : (lesson.duration || 'Loading duration...')}
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {lesson.materials?.length || 0} materials
                </div>
              </div>
            </div>

            {/* Materials */}
            {lesson.materials && lesson.materials.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesson Materials</h3>
                
                <div className="space-y-3">
                  {lesson.materials.map((material, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{material.name || material}</span>
                      </div>
                      
                      <button
                        onClick={() => handleDownload(material)}
                        className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Course Navigation */}
          <div className="space-y-6">
            {/* Course Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h3>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Overall Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    {lessons.length > 0 ? Math.round((userProgress.completedLessons.length / lessons.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${lessons.length > 0 ? (userProgress.completedLessons.length / lessons.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Lesson Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
              
              {lessons.length > 0 ? (
                <div className="space-y-2">
                  {lessons.map((courseLesson, index) => (
                    <div
                      key={courseLesson.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        courseLesson.id === lessonId
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => navigateToLesson(courseLesson.id)}
                    >
                      <div className="flex items-center space-x-3">
                        {isLessonCompleted(courseLesson.id) ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            courseLesson.id === lessonId ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            Lesson {index + 1}: {courseLesson.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No lessons available yet</p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-3">
              {getPreviousLesson() && (
                <button
                  onClick={() => navigateToLesson(getPreviousLesson().id)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>
              )}
              
              {getNextLesson() && (
                <button
                  onClick={() => navigateToLesson(getNextLesson().id)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonPlayer;
