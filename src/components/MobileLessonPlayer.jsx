import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Download, 
  ChevronLeft, ChevronRight, RotateCcw, RotateCw, 
  Wifi, WifiOff, CheckCircle
} from 'lucide-react';
import pwaService from '../services/pwaService';

const MobileLessonPlayer = ({ 
  lesson, 
  course, 
  onProgressUpdate, 
  onLessonComplete,
  onNavigateLesson 
}) => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCached, setIsCached] = useState(false);
  const [orientation, setOrientation] = useState('portrait');
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    // Network status
    const handleNetworkChange = (event) => {
      setIsOnline(event.detail.isOnline);
    };
    window.addEventListener('networkChange', handleNetworkChange);
    setIsOnline(navigator.onLine);

    // Check if lesson is cached
    const checkCacheStatus = async () => {
      if (lesson?.id) {
        const cached = await pwaService.isLessonCached(lesson.id);
        setIsCached(cached);
      }
    };
    checkCacheStatus();

    // Orientation change
    const handleOrientationChange = () => {
      setOrientation(window.orientation === 0 ? 'portrait' : 'landscape');
    };
    window.addEventListener('orientationchange', handleOrientationChange);

    // Auto-hide controls
    const handleTouchStart = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    document.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('networkChange', handleNetworkChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('touchstart', handleTouchStart);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [lesson?.id, isPlaying]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
    setProgress(e.target.value);
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
      
      // Update progress callback
      if (onProgressUpdate) {
        onProgressUpdate(current, total);
      }
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (onLessonComplete) {
      onLessonComplete();
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        } else if (videoRef.current.webkitRequestFullscreen) {
          videoRef.current.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }
  };

  const handleSkipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const handleSkipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  const handleDownloadLesson = async () => {
    if (lesson && !isCached) {
      try {
        await pwaService.cacheLesson(lesson.id, lesson);
        setIsCached(true);
      } catch (error) {
        console.error('Failed to cache lesson:', error);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDoubleTap = (side) => {
    if (side === 'left') {
      handleSkipBackward();
    } else {
      handleSkipForward();
    }
  };

  return (
    <div className="relative bg-black w-full h-full">
      {/* Video Container */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          poster={lesson?.thumbnailUrl}
          onTimeUpdate={handleVideoTimeUpdate}
          onLoadedMetadata={handleVideoLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleVideoEnded}
          onDoubleClick={handleFullscreen}
        >
          <source src={lesson?.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Double-tap areas for seeking */}
        <div className="absolute inset-0 flex">
          <div 
            className="flex-1"
            onDoubleClick={() => handleDoubleTap('left')}
          />
          <div 
            className="flex-1"
            onDoubleClick={() => handleDoubleTap('right')}
          />
        </div>

        {/* Status Indicators */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          {!isOnline && (
            <div className="flex items-center space-x-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              <WifiOff className="h-4 w-4" />
              <span className="text-xs">Offline</span>
            </div>
          )}
          {isCached && (
            <div className="flex items-center space-x-1 bg-green-500 bg-opacity-50 text-white px-2 py-1 rounded">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">Cached</span>
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Top Controls */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <button
              onClick={handleDownloadLesson}
              className={`p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors ${
                isCached ? 'text-green-400' : ''
              }`}
              title={isCached ? 'Lesson cached' : 'Download for offline'}
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={handleFullscreen}
              className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
            >
              <Maximize className="h-5 w-5" />
            </button>
          </div>

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              className="p-4 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8" />
              )}
            </button>
          </div>

          {/* Side Skip Buttons */}
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <button
              onClick={handleSkipBackward}
              className="p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
            >
              <RotateCcw className="h-6 w-6" />
            </button>
            <button
              onClick={handleSkipForward}
              className="p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
            >
              <RotateCw className="h-6 w-6" />
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
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
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {orientation === 'portrait' && (
                  <button
                    onClick={() => setOrientation('landscape')}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    <Maximize className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Info (when controls are hidden) */}
      {!showControls && isPlaying && (
        <div className="absolute top-4 left-4 right-4">
          <h3 className="text-white text-sm font-medium truncate">
            {lesson?.title}
          </h3>
          <p className="text-white text-xs opacity-75">
            {course?.title}
          </p>
        </div>
      )}
    </div>
  );
};

export default MobileLessonPlayer;
