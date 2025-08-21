import { useState } from 'react';
import { TrendingUp, Hash } from 'lucide-react';

const PopularSearches = ({ onSearchClick }) => {
  const [popularSearches] = useState([
    { term: 'React', type: 'technology', count: 156 },
    { term: 'JavaScript', type: 'programming', count: 234 },
    { term: 'Python', type: 'programming', count: 189 },
    { term: 'Design', type: 'category', count: 98 },
    { term: 'Business', type: 'category', count: 76 },
    { term: 'Marketing', type: 'category', count: 65 }
  ]);

  const [trendingTopics] = useState([
    { topic: 'AI & Machine Learning', trend: 'up', percentage: 45 },
    { topic: 'Web Development', trend: 'up', percentage: 32 },
    { topic: 'Data Science', trend: 'up', percentage: 28 },
    { topic: 'Mobile Development', trend: 'down', percentage: -12 }
  ]);

  return (
    <div className="space-y-6">
      {/* Popular Searches */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Hash className="h-5 w-5 mr-2 text-blue-600" />
          Popular Searches
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((search, index) => (
            <button
              key={index}
              onClick={() => onSearchClick(search.term)}
              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-blue-100 hover:text-blue-700 transition-colors"
            >
              {search.term}
              <span className="ml-1 text-xs text-gray-500">({search.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
          Trending Topics
        </h3>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <span className="text-sm font-medium text-gray-900">{topic.topic}</span>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium ${
                  topic.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {topic.trend === 'up' ? '+' : ''}{topic.percentage}%
                </span>
                <TrendingUp className={`h-4 w-4 ${
                  topic.trend === 'up' ? 'text-green-600' : 'text-red-600 rotate-180'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularSearches;
