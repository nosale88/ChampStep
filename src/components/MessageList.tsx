import React from 'react';
import { MessageCircle, User, Mail, Clock, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  targetType: 'dancer' | 'crew';
  targetName: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, targetType, targetName }) => {
  const { isDarkMode } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return '방금 전';
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (messages.length === 0) {
    return (
      <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>아직 메시지가 없습니다.</p>
        <p className="text-sm mt-1">
          {targetType === 'dancer' ? '댄서' : '크루'} {targetName}에게 첫 메시지를 남겨보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <MessageCircle className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          메시지 ({messages.length})
        </h3>
      </div>
      
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-4 rounded-xl transition-colors ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <User className={`h-4 w-4 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {message.authorName}
                  </span>
                  {message.authorEmail && (
                    <div className="flex items-center space-x-1">
                      <Mail className={`h-3 w-3 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <span className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {message.authorEmail}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <Clock className={`h-3 w-3 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <span className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {message.isPublic ? (
                      <Eye className={`h-3 w-3 ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`} />
                    ) : (
                      <EyeOff className={`h-3 w-3 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    )}
                    <span className={`text-xs ${
                      message.isPublic 
                        ? isDarkMode ? 'text-green-400' : 'text-green-600'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {message.isPublic ? '공개' : '비공개'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`ml-11 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <p className="leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList; 