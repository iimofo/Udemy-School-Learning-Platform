import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, X, Check, Trash2, MessageSquare, BookOpen, Users, Award, 
  ChevronDown, Send, MoreVertical, Clock, Star
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationCenter = ({ user, isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendDirectMessage,
    createCourseAnnouncement
  } = useNotifications(user?.uid);

  const [activeTab, setActiveTab] = useState('all');
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState('');
  const [messageText, setMessageText] = useState('');

  // Get user's courses if they're a teacher
  const [userCourses, setUserCourses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    // Fetch user's courses if they're a teacher
    if (user?.role === 'teacher') {
      // This would be replaced with actual course fetching
      setUserCourses([
        { id: 'course1', title: 'React Fundamentals' },
        { id: 'course2', title: 'JavaScript Basics' }
      ]);
    }

    // Fetch all users for messaging (simplified)
    setAllUsers([
      { id: 'user1', displayName: 'John Doe', role: 'student' },
      { id: 'user2', displayName: 'Jane Smith', role: 'teacher' }
    ]);
  }, [user]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course_announcement':
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'new_enrollment':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'new_lesson':
        return <BookOpen className="h-4 w-4 text-purple-600" />;
      case 'course_completion':
        return <Award className="h-4 w-4 text-yellow-600" />;
      case 'direct_message':
        return <MessageSquare className="h-4 w-4 text-indigo-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'course_announcement':
        return 'bg-blue-100 text-blue-800';
      case 'new_enrollment':
        return 'bg-green-100 text-green-800';
      case 'new_lesson':
        return 'bg-purple-100 text-purple-800';
      case 'course_completion':
        return 'bg-yellow-100 text-yellow-800';
      case 'direct_message':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.courseId) {
      navigate(`/courses/${notification.courseId}`);
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementMessage.trim() || !selectedCourse) return;

    try {
      await createCourseAnnouncement(selectedCourse, {
        id: Date.now().toString(),
        message: announcementMessage
      });
      setAnnouncementMessage('');
      setSelectedCourse('');
      setShowAnnouncementForm(false);
    } catch (error) {
      console.error('Error sending announcement:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !messageRecipient) return;

    try {
      await sendDirectMessage(messageRecipient, messageText);
      setMessageText('');
      setMessageRecipient('');
      setShowMessageForm(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'unread' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            Unread ({unreadCount})
          </button>
          {user?.role === 'teacher' && (
            <button
              onClick={() => setActiveTab('course_announcement')}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === 'course_announcement' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
            >
              Announcements
            </button>
          )}
        </div>

        {/* Quick Actions */}
        {user?.role === 'teacher' && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAnnouncementForm(true)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                <BookOpen className="h-4 w-4 mr-1 inline" />
                Announcement
              </button>
              <button
                onClick={() => setShowMessageForm(true)}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
              >
                <MessageSquare className="h-4 w-4 mr-1 inline" />
                Message
              </button>
            </div>
          </div>
        )}

        {/* Announcement Form */}
        {showAnnouncementForm && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <form onSubmit={handleSendAnnouncement} className="space-y-3">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Course</option>
                {userCourses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              <textarea
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                placeholder="Write your announcement..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnnouncementForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Message Form */}
        {showMessageForm && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <form onSubmit={handleSendMessage} className="space-y-3">
              <select
                value={messageRecipient}
                onChange={(e) => setMessageRecipient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Recipient</option>
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.displayName} ({user.role})</option>
                ))}
              </select>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write your message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => setShowMessageForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                          {notification.priority === 'high' && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        {!notification.read && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No notifications</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
