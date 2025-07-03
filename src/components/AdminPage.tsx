import React, { useState } from 'react';
import { Competition } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const AdminPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<Partial<Competition>>({
    managerName: '',
    managerContact: '',
    managerEmail: '',
    eventName: '',
    genres: [],
    venue: '',
    eventStartDate: '',
    eventEndDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    participationType: 'individual',
    participantLimit: 0,
    isParticipantListPublic: true,
    usePreliminaries: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentGenres = prev.genres || [];
      if (checked) {
        return { ...prev, genres: [...currentGenres, value] };
      } else {
        return { ...prev, genres: currentGenres.filter(genre => genre !== value) };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    alert('새로운 행사가 등록되었습니다 (콘솔에서 확인).');
  };

  const inputStyle = `w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'} border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500`;
  const labelStyle = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;
  const requiredLabel = <span className="text-red-500 ml-1">*</span>;

  const genresList = ['전체', '비보이', '락킹', '팝핀', '힙합', '왁킹', '소울', '하우스', '케이팝', '크럼프', '보깅', '무용', '코레오', '올장르 퍼포먼스', '워크샵', '파티', '기타'];

  return (
    <div className={`container mx-auto p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <h1 className="text-2xl font-bold mb-6"> 행사 등록양식</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Manager Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="managerName" className={labelStyle}>담당자명 {requiredLabel}</label>
            <input type="text" name="managerName" id="managerName" className={inputStyle} onChange={handleInputChange} required />
          </div>
          <div>
            <label htmlFor="managerContact" className={labelStyle}>담당자 연락처 {requiredLabel}</label>
            <input type="text" name="managerContact" id="managerContact" className={inputStyle} onChange={handleInputChange} required />
          </div>
          <div>
            <label htmlFor="managerEmail" className={labelStyle}>담당자 이메일 {requiredLabel}</label>
            <input type="email" name="managerEmail" id="managerEmail" className={inputStyle} onChange={handleInputChange} required />
          </div>
        </div>

        {/* Event Name */}
        <div>
          <label htmlFor="eventName" className={labelStyle}>행사명 {requiredLabel}</label>
          <input type="text" name="eventName" id="eventName" className={inputStyle} onChange={handleInputChange} required />
        </div>

        {/* Genres */}
        <div>
          <label className={labelStyle}>댄스분야 (최대 3개) {requiredLabel}</label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-2">
            {genresList.map(genre => (
              <div key={genre} className="flex items-center">
                <input type="checkbox" id={`genre-${genre}`} value={genre} onChange={handleGenreChange} className="h-4 w-4 rounded" />
                <label htmlFor={`genre-${genre}`} className="ml-2 text-sm">{genre}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Participation Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
                <label className={labelStyle}>참가유형 {requiredLabel}</label>
                <div className="flex items-center gap-2">
                    <button type="button" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${formData.participationType === 'individual' ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`} onClick={() => setFormData(prev => ({...prev, participationType: 'individual'}))}>개인전</button>
                    <button type="button" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${formData.participationType === 'team' ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`} onClick={() => setFormData(prev => ({...prev, participationType: 'team'}))}>팀전</button>
                </div>
            </div>
            <div>
                <label htmlFor="teamSize" className={labelStyle}>팀별 배틀/퍼포먼스 선택인함</label>
                 <select name="teamSize" id="teamSize" className={inputStyle} onChange={handleInputChange} disabled={formData.participationType !== 'team'}>
                    <option>선택안함</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5+</option>
                </select>
            </div>
        </div>

        {/* Participant Limit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
                <label className={labelStyle}>행사참가인원 {requiredLabel}</label>
                <div className="flex items-center gap-2">
                    <button type="button" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${formData.participantLimit === 'unlimited' ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`} onClick={() => setFormData(prev => ({...prev, participantLimit: 'unlimited'}))}>제한없음</button>
                    <button type="button" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${formData.participantLimit !== 'unlimited' ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`} onClick={() => setFormData(prev => ({...prev, participantLimit: 0}))}>인원수</button>
                    <input type="number" name="participantLimit" value={formData.participantLimit === 'unlimited' ? '' : formData.participantLimit} className={`${inputStyle} w-24`} onChange={handleInputChange} disabled={formData.participantLimit === 'unlimited'} />
                    <span className="ml-2">명</span>
                </div>
            </div>
            <div className="flex items-center">
                <input type="checkbox" id="isParticipantListPublic" name="isParticipantListPublic" onChange={handleCheckboxChange} className="h-4 w-4 rounded" />
                <label htmlFor="isParticipantListPublic" className="ml-2 text-sm">참가자 명단공개(체크시 신청자 명단 공개)</label>
            </div>
        </div>

        {/* Preliminaries */}
        <div className="p-4 rounded-md border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}">
            <h3 className="font-semibold mb-2">[예선전 전용]</h3>
            <div className="flex items-center mb-4">
                 <input type="checkbox" id="usePreliminaries" name="usePreliminaries" onChange={handleCheckboxChange} className="h-4 w-4 rounded" />
                 <label htmlFor="usePreliminaries" className="ml-2 text-sm font-bold text-blue-500">예선전 사용(체크시 예선과 본선경기로 나뉨)</label>
            </div>
            {formData.usePreliminaries && (
                <div className="space-y-4">
                    <div className="flex items-center">
                        <input type="checkbox" id="isPrelimGroupTournament" name="isPrelimGroupTournament" onChange={handleCheckboxChange} className="h-4 w-4 rounded" />
                        <label htmlFor="isPrelimGroupTournament" className="ml-2 text-sm">예선 그룹별 토너먼트</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                            <label className={labelStyle}>예선전 경기방식</label>
                            <div className="flex gap-4">
                                <label><input type="radio" name="prelimFormat" value="tournament" onChange={handleInputChange} /> 토너먼트 방식</label>
                                <label><input type="radio" name="prelimFormat" value="scoring" onChange={handleInputChange} /> 점수제 방식</label>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="finalistCount" className={labelStyle}>본선진출팀수</label>
                            <div className="flex items-center">
                                <input type="number" name="finalistCount" id="finalistCount" className={`${inputStyle} w-24`} onChange={handleInputChange} />
                                <span className="ml-2">명/팀</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Venue */}
        <div>
          <label htmlFor="venue" className={labelStyle}>행사장소 {requiredLabel}</label>
          <input type="text" name="venue" id="venue" className={inputStyle} onChange={handleInputChange} required />
        </div>

         {/* Prize Details */}
        <div>
          <label htmlFor="prizeDetails" className={labelStyle}>우승상금 세부내역</label>
          <textarea name="prizeDetails" id="prizeDetails" rows={3} className={inputStyle} onChange={handleInputChange}></textarea>
        </div>

        {/* Requirements & Fees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label htmlFor="ageRequirement" className={labelStyle}>참가대상연령</label>
                <input type="text" name="ageRequirement" id="ageRequirement" className={inputStyle} onChange={handleInputChange} />
            </div>
            <div>
                <label htmlFor="regionRequirement" className={labelStyle}>참가대상지역</label>
                <input type="text" name="regionRequirement" id="regionRequirement" className={inputStyle} onChange={handleInputChange} />
            </div>
            <div>
                <label htmlFor="entryFee" className={labelStyle}>참가비용</label>
                <input type="text" name="entryFee" id="entryFee" className={inputStyle} onChange={handleInputChange} />
            </div>
        </div>

        {/* Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className={labelStyle}>관람인원</label>
                <div className="flex items-center gap-2">
                    <button type="button" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${formData.audienceLimit === 'unlimited' ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`} onClick={() => setFormData(prev => ({...prev, audienceLimit: 'unlimited'}))}>제한없음</button>
                    <button type="button" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${formData.audienceLimit !== 'unlimited' ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`} onClick={() => setFormData(prev => ({...prev, audienceLimit: 0}))}>인원수</button>
                    <input type="number" name="audienceLimit" value={formData.audienceLimit === 'unlimited' ? '' : formData.audienceLimit} className={`${inputStyle} w-24`} onChange={handleInputChange} disabled={formData.audienceLimit === 'unlimited'} />
                    <span className="ml-2">명</span>
                </div>
            </div>
             <div>
                <label htmlFor="audienceFee" className={labelStyle}>관람비용</label>
                <input type="text" name="audienceFee" id="audienceFee" className={inputStyle} onChange={handleInputChange} />
            </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="registrationStartDate" className={labelStyle}>접수 시작일 {requiredLabel}</label>
                <input type="date" name="registrationStartDate" id="registrationStartDate" className={inputStyle} onChange={handleInputChange} required />
            </div>
            <div>
                <label htmlFor="registrationEndDate" className={labelStyle}>접수 마감일 {requiredLabel}</label>
                <input type="date" name="registrationEndDate" id="registrationEndDate" className={inputStyle} onChange={handleInputChange} required />
            </div>
            <div>
                <label htmlFor="eventStartDate" className={labelStyle}>행사 시작일 {requiredLabel}</label>
                <input type="date" name="eventStartDate" id="eventStartDate" className={inputStyle} onChange={handleInputChange} required />
            </div>
            <div>
                <label htmlFor="eventEndDate" className={labelStyle}>행사 종료일 {requiredLabel}</label>
                <input type="date" name="eventEndDate" id="eventEndDate" className={inputStyle} onChange={handleInputChange} required />
            </div>
        </div>

        {/* Date Memo */}
        <div>
            <label htmlFor="dateMemo" className={labelStyle}>행사일 메모 <span className="text-red-500 text-xs">(작성시 행사일 우측에 메모가 표시됩니다.)</span></label>
            <input type="text" name="dateMemo" id="dateMemo" className={inputStyle} onChange={handleInputChange} />
        </div>

        {/* Detailed Description */}
        <div>
            <label htmlFor="detailedDescription" className={labelStyle}>행사 상세내용</label>
            <textarea name="detailedDescription" id="detailedDescription" rows={10} className={inputStyle} onChange={handleInputChange}></textarea>
             <div className="text-right mt-1">
                <button type="button" className="text-sm text-blue-500">단축키 일람</button>
            </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-8">
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                행사 등록하기
            </button>
        </div>

      </form>
    </div>
  );
};

export default AdminPage;
