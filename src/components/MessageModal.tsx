import React, { useState } from 'react';
import { X, MessageCircle, Send, User, Mail } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Message } from '../types';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'dancer' | 'crew';
  targetName: string;
  targetId: string;
  onSendMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
}

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetName,
  targetId,
  onSendMessage
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    content: '',
    authorName: '',
    authorEmail: '',
    isPublic: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim() || !formData.authorName.trim()) return;

    setIsSubmitting(true);
    try {
      const message: Omit<Message, 'id' | 'createdAt'> = {
        content: formData.content.trim(),
        authorName: formData.authorName.trim(),
        authorEmail: formData.authorEmail.trim() || undefined,
        targetType,
        targetId,
        isPublic: formData.isPublic
      };

      await onSendMessage(message);
      
      // 폼 초기화
      setFormData({
        content: '',
        authorName: '',
        authorEmail: '',
        isPublic: true
      });
      
      onClose();
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl max-w-md w-full transition-colors ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`border-b p-6 rounded-t-2xl transition-colors ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <MessageCircle className={`h-5 w-5 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-lg font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  메시지 보내기
                </h2>
                <p className={`text-sm transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {targetType === 'dancer' ? '댄서' : '크루'} {targetName}에게
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <User className="inline h-4 w-4 mr-1" />
              이름 *
            </label>
            <input
              type="text"
              value={formData.authorName}
              onChange={(e) => handleChange('authorName', e.target.value)}
              placeholder="이름을 입력하세요"
              className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Mail className="inline h-4 w-4 mr-1" />
              이메일 (선택)
            </label>
            <input
              type="email"
              value={formData.authorEmail}
              onChange={(e) => handleChange('authorEmail', e.target.value)}
              placeholder="이메일을 입력하세요"
              className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <MessageCircle className="inline h-4 w-4 mr-1" />
              메시지 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="메시지를 입력하세요..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => handleChange('isPublic', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isPublic" className={`text-sm transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              공개 메시지로 게시
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.content.trim() || !formData.authorName.trim()}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                isSubmitting || !formData.content.trim() || !formData.authorName.trim()
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>전송 중...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>전송</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageModal; 