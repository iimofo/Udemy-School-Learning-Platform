import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play,
  ArrowLeft,
  Plus,
  RefreshCw,
  X,
  ChevronDown,
  TrendingUp,
  Calendar,
  DollarSign,
  Award
} from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import PopularSearches from '../components/PopularSearches';
import StarRating from '../components/StarRating';

const CourseBrowser = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courses, loading, error, enrollInCourse, checkEnrollment, fetchCourses } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Generate categories dynamically from courses and add default ones
  const generateCategories = () => {
    const defaultCategories = [
      { id: 'Programming', name: 'Programming' },
      { id: 'Design', name: 'Design' },
      { id: 'Business', name: 'Business' },
      { id: 'Marketing', name: 'Marketing' },
      { id: 'Music', name: 'Music' },
      { id: 'Photography', name: 'Photography' },
      { id: 'Health & Fitness', name: 'Health & Fitness' },
      { id: 'Language', name: 'Language' },
      { id: 'Science', name: 'Science' },
      { id: 'Technology', name: 'Technology' },
      { id: 'Other', name: 'Other' }
    ];

    // Get unique categories from existing courses
    const courseCategories = [...new Set(courses.map(course => course.category).filter(Boolean))];
    
    // Combine default categories with course categories
    const allCategories = [...defaultCategories];
    
    courseCategories.forEach(category => {
      if (!allCategories.find(cat => cat.id === category)) {
        allCategories.push({ id: category, name: category });
      }
    });

    return [{ id: 'all', name: 'All Courses' }, ...allCategories];
  };

  const categories = generateCategories();
  
  // Debug: Log categories and courses for troubleshooting
  useEffect(() => {
    if (courses.length > 0) {
      console.log('Available categories:', categories.map(c => c.id));
      console.log('Course categories:', courses.map(c => ({ id: c.id, title: c.title, category: c.category })));
    }
  }, [courses, categories]);

  // Check enrollment status for all courses
  useEffect(() => {
    const checkEnrollments = async () => {
      if (courses.length > 0 && user) {
        const enrolled = new Set();
        for (const course of courses) {
          const isEnrolled = await checkEnrollment(course.id, user.uid);
          if (isEnrolled) {
            enrolled.add(course.id);
          }
        }
        setEnrolledCourses(enrolled);
      }
    };
    
    checkEnrollments();
  }, [courses, user, checkEnrollment]);

  // Generate search suggestions
  useEffect(() => {
    if (searchTerm.length > 2) {
      const suggestions = [];
      
      // Add course titles
      courses.forEach(course => {
        if (course.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          suggestions.push({ type: 'course', text: course.title, id: course.id });
        }
      });
      
      // Add categories
      categories.forEach(category => {
        if (category.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          suggestions.push({ type: 'category', text: category.name, id: category.id });
        }
      });
      
      // Add instructor names
      courses.forEach(course => {
        if (course.instructor?.toLowerCase().includes(searchTerm.toLowerCase())) {
          suggestions.push({ type: 'instructor', text: course.instructor, id: course.id });
        }
      });
      
      setSearchSuggestions(suggestions.slice(0, 5));
      setShowSuggestions(true);
    } else if (searchTerm.length === 0 && showSuggestions) {
      // Show popular searches when input is empty but focused
      const popularSuggestions = [
        { type: 'popular', text: 'React', id: 'react' },
        { type: 'popular', text: 'JavaScript', id: 'javascript' },
        { type: 'popular', text: 'Python', id: 'python' },
        { type: 'popular', text: 'Design', id: 'design' },
        { type: 'popular', text: 'Business', id: 'business' }
      ];
      setSearchSuggestions(popularSuggestions);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, courses, categories, showSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.text);
    setShowSuggestions(false);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange('all');
    setDurationFilter('all');
    setDifficultyFilter('all');
    setRatingFilter('all');
    setSortBy('newest');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory !== 'all') count++;
    if (priceRange !== 'all') count++;
    if (durationFilter !== 'all') count++;
    if (difficultyFilter !== 'all') count++;
    if (ratingFilter !== 'all') count++;
    return count;
  };

  const filteredCourses = courses.filter(course => {
    // Search filter
    const matchesSearch = !searchTerm || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || 
      (course.category && course.category.toLowerCase() === selectedCategory.toLowerCase());
    
    // Price filter
    const matchesPrice = priceRange === 'all' || 
      (priceRange === 'free' && course.price === 0) ||
      (priceRange === 'paid' && course.price > 0) ||
      (priceRange === 'premium' && course.price > 50);
    
    // Duration filter
    const matchesDuration = durationFilter === 'all' || 
      (durationFilter === 'short' && course.duration && course.duration.includes('1-2')) ||
      (durationFilter === 'medium' && course.duration && (course.duration.includes('2-4') || course.duration.includes('4-6'))) ||
      (durationFilter === 'long' && course.duration && course.duration.includes('week'));
    
    // Difficulty filter (assuming we'll add difficulty field)
    const matchesDifficulty = difficultyFilter === 'all' || 
      course.difficulty === difficultyFilter;
    
    // Rating filter
    const matchesRating = ratingFilter === 'all' || 
      (ratingFilter === '4plus' && course.rating >= 4) ||
      (ratingFilter === '3plus' && course.rating >= 3);
    
    return matchesSearch && matchesCategory && matchesPrice && matchesDuration && matchesDifficulty && matchesRating;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt?.toDate?.() || 0) - new Date(a.createdAt?.toDate?.() || 0);
      case 'oldest':
        return new Date(a.createdAt?.toDate?.() || 0) - new Date(b.createdAt?.toDate?.() || 0);
      case 'popular':
        return (b.students || 0) - (a.students || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const handleEnroll = async (courseId) => {
    try {
      await enrollInCourse(courseId, user.uid);
      setEnrolledCourses(prev => new Set([...prev, courseId]));
    } catch (error) {
      console.error('Error enrolling in course:', error);
      // You could show a toast notification here
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleBackToDashboard = () => {
    // Use replace to ensure proper navigation
    navigate('/dashboard', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
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
                onClick={handleBackToDashboard}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Browse Courses</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={fetchCourses}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {user.role === 'teacher' && (
                <button 
                  onClick={() => navigate('/create-course')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Search and Filter */}
        <div className="mb-8">
          {/* Enhanced Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto search-container">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for courses, topics, or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="block w-full pl-16 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className={`p-1 rounded ${
                        suggestion.type === 'course' ? 'bg-blue-100' :
                        suggestion.type === 'category' ? 'bg-green-100' :
                        suggestion.type === 'popular' ? 'bg-orange-100' :
                        'bg-purple-100'
                      }`}>
                        {suggestion.type === 'course' ? (
                          <BookOpen className="h-3 w-3 text-blue-600" />
                        ) : suggestion.type === 'category' ? (
                          <Award className="h-3 w-3 text-green-600" />
                        ) : suggestion.type === 'popular' ? (
                          <TrendingUp className="h-3 w-3 text-orange-600" />
                        ) : (
                          <Users className="h-3 w-3 text-purple-600" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700">{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
                                {/* Category Filters */}
                      <div className="flex flex-wrap gap-3 justify-center mb-6">
                        {categories.map(category => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                              selectedCategory === category.id
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>

                      {/* Advanced Filters Toggle */}
                      <div className="flex items-center justify-center mb-6">
                        <button
                          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Advanced Filters
                          <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {/* Advanced Filters Panel */}
                      {showAdvancedFilters && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Sort By */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                              <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="popular">Most Popular</option>
                                <option value="rating">Highest Rated</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="title">Title A-Z</option>
                              </select>
                            </div>

                            {/* Price Range */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                              <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="all">All Prices</option>
                                <option value="free">Free</option>
                                <option value="paid">Paid</option>
                                <option value="premium">Premium ($50+)</option>
                              </select>
                            </div>

                            {/* Duration */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                              <select
                                value={durationFilter}
                                onChange={(e) => setDurationFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="all">All Durations</option>
                                <option value="short">Short (1-2 hours)</option>
                                <option value="medium">Medium (2-6 hours)</option>
                                <option value="long">Long (1+ weeks)</option>
                              </select>
                            </div>

                            {/* Rating */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                              <select
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="all">All Ratings</option>
                                <option value="4plus">4+ Stars</option>
                                <option value="3plus">3+ Stars</option>
                              </select>
                            </div>
                          </div>

                          {/* Clear Filters */}
                          {getActiveFiltersCount() > 0 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                              <span className="text-sm text-gray-500">
                                {getActiveFiltersCount()} active filter{getActiveFiltersCount() !== 1 ? 's' : ''}
                              </span>
                              <button
                                onClick={clearAllFilters}
                                className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Clear All Filters
                              </button>
                            </div>
                          )}
                        </div>
                      )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading courses</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''} found
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 text-blue-600">
                ({getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied)
              </span>
            )}
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCourses.map(course => (
            <div 
              key={course.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCourseClick(course.id)}
            >
              {/* Course Image */}
              <div className="relative h-48 bg-gray-200">
                {course.coverImage ? (
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
                    <BookOpen className="h-16 w-16 text-white/80" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {course.price > 0 ? `$${course.price}` : 'Free'}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {categories.find(c => c.id === course.category)?.name}
                  </span>
                  <div className="flex items-center space-x-1">
                    <StarRating
                      rating={course.rating || 0}
                      size="sm"
                      showValue={false}
                    />
                    <span className="text-sm text-gray-600">
                      {course.rating > 0 ? course.rating.toFixed(1) : 'New'}
                      {course.totalRatings > 0 && ` (${course.totalRatings})`}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Play className="h-4 w-4 mr-1" />
                    {course.lessons} lessons
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.students} students
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    by <span className="font-medium">{course.instructor}</span>
                  </p>
                  
                  {enrolledCourses.has(course.id) ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Enrolled
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnroll(course.id);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedCourses.length === 0 && (
          <div className="space-y-8">
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filter criteria.
              </p>
              
              {/* Popular Searches */}
              <div className="max-w-2xl mx-auto">
                <PopularSearches onSearchClick={(term) => setSearchTerm(term)} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CourseBrowser;
