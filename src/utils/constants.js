// Course duration options
export const DURATION_OPTIONS = [
  { value: '1-2 hours', label: '1-2 hours' },
  { value: '2-4 hours', label: '2-4 hours' },
  { value: '4-6 hours', label: '4-6 hours' },
  { value: '6-8 hours', label: '6-8 hours' },
  { value: '1 day', label: '1 day' },
  { value: '2-3 days', label: '2-3 days' },
  { value: '1 week', label: '1 week' },
  { value: '2 weeks', label: '2 weeks' },
  { value: '3 weeks', label: '3 weeks' },
  { value: '1 month', label: '1 month' },
  { value: '2 months', label: '2 months' },
  { value: '3 months', label: '3 months' },
  { value: '6 months', label: '6 months' },
  { value: '1 year', label: '1 year' }
];

// Course categories
export const COURSE_CATEGORIES = [
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

// Image upload settings
export const IMAGE_SETTINGS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  recommendedDimensions: {
    width: 1200,
    height: 675,
    ratio: '16:9'
  }
};

// Video upload settings
export const VIDEO_SETTINGS = {
  maxSize: 500 * 1024 * 1024, // 500MB
  acceptedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
  maxDuration: 7200 // 2 hours in seconds
};
