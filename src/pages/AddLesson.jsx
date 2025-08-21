import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Video, 
  FileText, 
  Save, 
  X,
  Plus,
  Clock
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { useLessons } from '../hooks/useLessons';

const AddLesson = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { createLesson } = useLessons(courseId);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    materials: []
  });
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, videoFile: file }));
      
      // Create video preview
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      
      // Get video duration
      const video = document.createElement('video');
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        const duration = video.duration;
        console.log('Video duration:', duration);
        // We'll use this duration when creating the lesson
      });
    }
  };

  const handleMaterialUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, ...files]
    }));
  };

  const removeMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let videoUrl = '';
      let materials = [];
      let videoDuration = 0;

      // Upload video if provided
      if (formData.videoFile) {
        const videoRef = ref(storage, `courses/${courseId}/videos/${Date.now()}_${formData.videoFile.name}`);
        await uploadBytes(videoRef, formData.videoFile);
        videoUrl = await getDownloadURL(videoRef);
        
        // Get video duration
        const video = document.createElement('video');
        video.src = videoPreview;
        await new Promise((resolve) => {
          video.addEventListener('loadedmetadata', () => {
            videoDuration = video.duration;
            resolve();
          });
        });
      }

      // Upload materials if provided
      if (formData.materials.length > 0) {
        const materialPromises = formData.materials.map(async (file, index) => {
          const materialRef = ref(storage, `courses/${courseId}/materials/${Date.now()}_${index}_${file.name}`);
          await uploadBytes(materialRef, file);
          const url = await getDownloadURL(materialRef);
          return {
            name: file.name,
            url: url,
            type: file.type
          };
        });
        materials = await Promise.all(materialPromises);
      }

      // Create lesson in Firebase
      const lessonData = {
        title: formData.title,
        description: formData.description,
        duration: videoDuration > 0 ? Math.round(videoDuration) : null, // Store duration in seconds
        videoUrl: videoUrl,
        materials: materials,
        order: Date.now() // Simple ordering
      };

      await createLesson(lessonData);
      
      alert('Lesson created successfully!');
      navigate(`/courses/${courseId}`);
      
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert('Error creating lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-xl font-semibold text-gray-900">Add New Lesson</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Lesson Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="Enter lesson title"
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
                placeholder="Enter lesson description"
              />
            </div>
          </div>

          {/* Video Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Video Content</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Video
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600">
                      Click to upload video or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      MP4, WebM, or OGG up to 500MB
                    </p>
                  </label>
                </div>
              </div>
              
              {videoPreview && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Video Preview</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, videoFile: null }));
                        setVideoPreview(null);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <video
                    src={videoPreview}
                    controls
                    className="w-full rounded-lg"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Materials Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Lesson Materials</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Materials
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleMaterialUpload}
                    className="hidden"
                    id="materials-upload"
                  />
                  <label htmlFor="materials-upload" className="cursor-pointer">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600">
                      Click to upload materials or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, ZIP, or other files up to 50MB each
                    </p>
                  </label>
                </div>
              </div>
              
              {formData.materials.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Uploaded Materials:</h4>
                  {formData.materials.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-900">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/courses/${courseId}`)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Lesson...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Lesson
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddLesson;
