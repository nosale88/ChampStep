import React, { useState, useRef, useEffect } from 'react';
import { Send, Reply, Heart, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Comment, Mention, Dancer, Crew } from '../types';

interface CommentSystemProps {
  targetType: 'dancer' | 'crew';
  targetId: string;
  comments: Comment[];
  onAddComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateComment?: (commentId: string, content: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'user';
  };
  dancers: Dancer[];
  crews: Crew[];
  loading?: boolean;
}

const CommentSystem: React.FC<CommentSystemProps> = ({
  targetType,
  targetId,
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  currentUser,
  dancers,
  crews,
  loading = false
}) => {
  const { isDarkMode } = useTheme();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{id: string, name: string, type: 'dancer' | 'crew'}>>([]);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // @ 멘션 처리
  const handleInputChange = (value: string) => {
    setNewComment(value);
    
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      // @ 바로 뒤에 커서가 있을 때
      setMentionStart(lastAtIndex);
      setShowSuggestions(true);
      
      // 모든 댄서와 크루를 제안
      const allSuggestions = [
        ...dancers.map(d => ({ id: d.id, name: d.nickname, type: 'dancer' as const })),
        ...crews.map(c => ({ id: c.id, name: c.name, type: 'crew' as const }))
      ];
      setSuggestions(allSuggestions);
    } else if (lastAtIndex !== -1 && mentionStart !== null) {
      // @ 뒤에 텍스트가 있을 때 필터링
      const searchTerm = value.substring(lastAtIndex + 1).toLowerCase();
      const filteredSuggestions = [
        ...dancers.filter(d => d.nickname.toLowerCase().includes(searchTerm))
          .map(d => ({ id: d.id, name: d.nickname, type: 'dancer' as const })),
        ...crews.filter(c => c.name.toLowerCase().includes(searchTerm))
          .map(c => ({ id: c.id, name: c.name, type: 'crew' as const }))
      ];
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
      setMentionStart(null);
    }
  };

  // 멘션 선택 처리
  const handleMentionSelect = (suggestion: {id: string, name: string, type: 'dancer' | 'crew'}) => {
    if (mentionStart !== null) {
      const beforeMention = newComment.substring(0, mentionStart);
      const afterMention = newComment.substring(newComment.lastIndexOf('@') + 1);
      const newValue = beforeMention + `@${suggestion.name} `;
      setNewComment(newValue);
      setShowSuggestions(false);
      setMentionStart(null);
      textareaRef.current?.focus();
    }
  };

  // 멘션 파싱
  const parseMentions = (content: string): Mention[] => {
    const mentions: Mention[] = [];
    const mentionRegex = /@(\w+)/g;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      const mentionName = match[1];
      const dancer = dancers.find(d => d.nickname === mentionName);
      const crew = crews.find(c => c.name === mentionName);
      
      if (dancer) {
        mentions.push({
          id: dancer.id,
          type: 'dancer',
          name: dancer.nickname,
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
      } else if (crew) {
        mentions.push({
          id: crew.id,
          type: 'crew',
          name: crew.name,
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
      }
    }

    return mentions;
  };

  // 댓글 추가
  const handleSubmit = async () => {
    if (!newComment.trim() || !currentUser) return;

    const mentions = parseMentions(newComment);
    
    await onAddComment({
      content: newComment,
      authorName: currentUser.name,
      authorEmail: currentUser.email,
      authorId: currentUser.id,
      targetType,
      targetId,
      mentions,
      parentId: replyTo,
      replies: []
    });

    setNewComment('');
    setReplyTo(null);
  };

  // 댓글 수정
  const handleEdit = async (commentId: string) => {
    if (!editContent.trim() || !onUpdateComment) return;
    
    await onUpdateComment(commentId, editContent);
    setEditingComment(null);
    setEditContent('');
  };

  // 댓글 삭제
  const handleDelete = async (commentId: string) => {
    if (!onDeleteComment) return;
    
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      await onDeleteComment(commentId);
    }
  };

  // 권한 확인
  const canEditComment = (comment: Comment) => {
    if (!currentUser) return false;
    return currentUser.id === comment.authorId || currentUser.role === 'admin';
  };

  // 댓글 렌더링 (멘션 하이라이트 포함)
  const renderCommentContent = (content: string, mentions: Mention[]) => {
    if (mentions.length === 0) return content;

    let result = [];
    let lastIndex = 0;

    mentions.forEach((mention, index) => {
      // 멘션 이전 텍스트
      if (mention.startIndex > lastIndex) {
        result.push(content.substring(lastIndex, mention.startIndex));
      }
      
      // 멘션 텍스트 (하이라이트)
      result.push(
        <span 
          key={`mention-${index}`}
          className="text-blue-500 font-medium cursor-pointer hover:underline"
          onClick={() => {
            // 멘션된 댄서/크루 페이지로 이동하는 로직 추가 가능
            console.log(`Clicked mention: ${mention.type} - ${mention.name}`);
          }}
        >
          @{mention.name}
        </span>
      );
      
      lastIndex = mention.endIndex;
    });

    // 마지막 멘션 이후 텍스트
    if (lastIndex < content.length) {
      result.push(content.substring(lastIndex));
    }

    return result;
  };

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`space-y-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* 댓글 작성 */}
      <div className="relative">
        <div className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={replyTo ? "답글을 작성하세요..." : "댓글을 작성하세요... (@를 입력하여 멘션)"}
            className={`w-full p-3 border-0 resize-none focus:outline-none ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
            rows={3}
          />
          
          {/* 멘션 제안 */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-40 overflow-y-auto ${
              isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}>
              {suggestions.map((suggestion) => (
                <div
                  key={`${suggestion.type}-${suggestion.id}`}
                  className={`p-2 cursor-pointer hover:bg-opacity-80 ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleMentionSelect(suggestion)}
                >
                  <span className="font-medium">{suggestion.name}</span>
                  <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {suggestion.type === 'dancer' ? '댄서' : '크루'}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-3">
            {replyTo && (
              <button
                onClick={() => setReplyTo(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                답글 취소
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || !currentUser}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {replyTo ? '답글' : '댓글'} 작성
            </button>
          </div>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {comments.filter(comment => !comment.parentId).map((comment) => (
          <div key={comment.id} className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
            {/* 댓글 헤더 */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{comment.authorName}</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatTime(comment.createdAt)}
                </span>
                {comment.updatedAt && (
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    (수정됨)
                  </span>
                )}
              </div>
              
              {canEditComment(comment) && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingComment(comment.id);
                      setEditContent(comment.content);
                    }}
                    className={`p-1 rounded hover:bg-opacity-80 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className={`p-1 rounded hover:bg-opacity-80 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} text-red-500`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* 댓글 내용 */}
            {editingComment === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className={`w-full p-2 border rounded ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(comment.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-3">
                {renderCommentContent(comment.content, comment.mentions)}
              </div>
            )}

            {/* 댓글 액션 */}
            <div className="flex items-center gap-4 text-sm">
              <button
                onClick={() => setReplyTo(comment.id)}
                className={`flex items-center gap-1 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Reply size={14} />
                답글
              </button>
            </div>

            {/* 답글 목록 */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 ml-6 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className={`border-l-2 pl-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{reply.authorName}</span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatTime(reply.createdAt)}
                        </span>
                      </div>
                      
                      {canEditComment(reply) && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(reply.id)}
                            className={`p-1 rounded hover:bg-opacity-80 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} text-red-500`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-sm">
                      {renderCommentContent(reply.content, reply.mentions)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSystem;
