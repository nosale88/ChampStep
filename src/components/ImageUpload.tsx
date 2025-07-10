import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ImageUploadProps {
  currentImage?: string | null;
  onUpload: (file: File) => Promise<string | null>;
  onRemove?: () => void;
  label?: string;
  accept?: string;
  maxSize?: number;
  aspectRatio?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onUpload,
  onRemove,
  label = '이미지 업로드',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  aspectRatio,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증
    if (file.size > maxSize) {
      setError(`파일 크기는 ${Math.round(maxSize / 1024 / 1024)}MB를 초과할 수 없습니다.`);
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setError(null);
    setLoading(true);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const url = await onUpload(file);
      if (url) {
        setPreview(url);
      } else {
        throw new Error('업로드 실패');
      }
    } catch (err: any) {
      setError(err.message || '이미지 업로드 중 오류가 발생했습니다.');
      setPreview(currentImage || null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  return (
    <div className={className}>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}

      <div className={`relative ${aspectRatio || 'aspect-square'} max-w-xs`}>
        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            {!loading && (
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {loading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className={`w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
              isDarkMode
                ? 'border-gray-600 hover:border-gray-500 bg-gray-800'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            } ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8" />
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  클릭하여 이미지 선택
                </span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={loading}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload; 