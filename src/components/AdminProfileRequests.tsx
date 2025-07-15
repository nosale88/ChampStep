import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, User, Users, MessageSquare, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ProfileRequest } from '../types';
import { getAllProfileRequests, updateProfileRequestStatus } from '../services/profileService';

interface AdminProfileRequestsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminProfileRequests: React.FC<AdminProfileRequestsProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const [requests, setRequests] = useState<ProfileRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ProfileRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getAllProfileRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading profile requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessing(true);
    try {
      await updateProfileRequestStatus(requestId, 'approved', adminNote.trim() || undefined);
      await loadRequests();
      setSelectedRequest(null);
      setAdminNote('');
      alert('요청이 승인되었습니다.');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('승인 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessing(true);
    try {
      await updateProfileRequestStatus(requestId, 'rejected', adminNote.trim() || undefined);
      await loadRequests();
      setSelectedRequest(null);
      setAdminNote('');
      alert('요청이 거부되었습니다.');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('거부 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-6xl w-full max-h-[90vh] overflow-hidden rounded-xl shadow-xl ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">프로필 연동 요청 관리</h2>
            <button
              onClick={onClose}
              className={`text-gray-500 hover:text-gray-700 ${
                isDarkMode ? 'hover:text-gray-300' : ''
              }`}
            >
              ✕
            </button>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-4 mt-4">
            {[
              { key: 'all', label: '전체', count: requests.length },
              { key: 'pending', label: '대기중', count: requests.filter(r => r.status === 'pending').length },
              { key: 'approved', label: '승인됨', count: requests.filter(r => r.status === 'approved').length },
              { key: 'rejected', label: '거부됨', count: requests.filter(r => r.status === 'rejected').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Request List */}
          <div className={`w-1/2 border-r overflow-y-auto ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>로딩 중...</p>
                </div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Eye className={`w-12 h-12 mx-auto mb-4 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {filter === 'all' ? '연동 요청이 없습니다' : `${filter === 'pending' ? '대기중인' : filter === 'approved' ? '승인된' : '거부된'} 요청이 없습니다`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedRequest?.id === request.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : isDarkMode
                          ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          {request.requestType === 'dancer' ? 
                            <User className="w-4 h-4" /> : 
                            <Users className="w-4 h-4" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{request.targetName}</div>
                          <div className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {request.requestType === 'dancer' ? '댄서' : '크루'} 연동 요청
                          </div>
                          <div className={`text-xs mt-1 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            {new Date(request.createdAt).toLocaleDateString()} {new Date(request.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className={`text-sm font-medium ${getStatusColor(request.status)}`}>
                          {request.status === 'pending' ? '대기중' : 
                           request.status === 'approved' ? '승인됨' : '거부됨'}
                        </span>
                      </div>
                    </div>
                    {request.message && (
                      <div className={`mt-2 p-2 rounded text-sm ${
                        isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <MessageSquare className="w-3 h-3 inline mr-1" />
                        {request.message.length > 50 ? `${request.message.substring(0, 50)}...` : request.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Request Details */}
          <div className="w-1/2 overflow-y-auto">
            {selectedRequest ? (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">요청 상세 정보</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        요청 유형
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        {selectedRequest.requestType === 'dancer' ? 
                          <User className="w-4 h-4" /> : 
                          <Users className="w-4 h-4" />
                        }
                        <span>{selectedRequest.requestType === 'dancer' ? '댄서' : '크루'}</span>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        대상 프로필
                      </label>
                      <div className="mt-1 font-medium">{selectedRequest.targetName}</div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        요청 상태
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        {getStatusIcon(selectedRequest.status)}
                        <span className={getStatusColor(selectedRequest.status)}>
                          {selectedRequest.status === 'pending' ? '승인 대기' : 
                           selectedRequest.status === 'approved' ? '승인됨' : '거부됨'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        요청일시
                      </label>
                      <div className="mt-1">
                        {new Date(selectedRequest.createdAt).toLocaleDateString()} {new Date(selectedRequest.createdAt).toLocaleTimeString()}
                      </div>
                    </div>

                    {selectedRequest.message && (
                      <div>
                        <label className={`block text-sm font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          사용자 메시지
                        </label>
                        <div className={`mt-1 p-3 rounded-lg ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          {selectedRequest.message}
                        </div>
                      </div>
                    )}

                    {selectedRequest.adminNote && (
                      <div>
                        <label className={`block text-sm font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          관리자 메모
                        </label>
                        <div className={`mt-1 p-3 rounded-lg ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          {selectedRequest.adminNote}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedRequest.status === 'pending' && (
                  <div>
                    <h4 className="font-semibold mb-3">요청 처리</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          관리자 메모 (선택사항)
                        </label>
                        <textarea
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="승인/거부 사유나 추가 안내사항을 입력하세요"
                          rows={3}
                          className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApprove(selectedRequest.id)}
                          disabled={processing}
                          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{processing ? '처리 중...' : '승인'}</span>
                        </button>
                        <button
                          onClick={() => handleReject(selectedRequest.id)}
                          disabled={processing}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>{processing ? '처리 중...' : '거부'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Eye className={`w-12 h-12 mx-auto mb-4 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    왼쪽에서 요청을 선택하여 상세 정보를 확인하세요
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileRequests;