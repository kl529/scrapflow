import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const ScrapModal = ({ scrap, onClose }) => {
  const [imageError, setImageError] = useState(false);
  const [showOcrText, setShowOcrText] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden'; // 스크롤 방지

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
    } catch (error) {
      return '날짜 오류';
    }
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      '전체': '#6B7280',
      '개발': '#3B82F6',
      '디자인': '#F59E0B',
      '비즈니스': '#10B981'
    };
    return colorMap[category] || '#6B7280';
  };

  if (!scrap) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getCategoryColor(scrap.category) }}
            ></span>
            <span className="font-medium text-gray-900">{scrap.category}</span>
          </div>
          <div className="flex items-center space-x-2">
            {/* OCR 텍스트 보기 버튼 */}
            {scrap.ocr_text && (
              <button
                onClick={() => setShowOcrText(!showOcrText)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                  showOcrText 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>문자인식</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-auto">
          {/* 이미지 */}
          <div className="p-6 pb-4">
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              {imageError ? (
                <div className="flex items-center justify-center h-96 text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🖼️</div>
                    <div className="text-lg">이미지를 불러올 수 없습니다</div>
                  </div>
                </div>
              ) : (
                <img
                  src={window.electronAPI.getImageUrl(scrap.image_path)}
                  alt="스크랩 이미지"
                  className="w-full h-auto max-h-[60vh] object-contain"
                  onError={handleImageError}
                />
              )}
            </div>
          </div>

          {/* 정보 섹션 */}
          <div className="px-6 pb-6">
            {/* 코멘트 */}
            {scrap.comment ? (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <span className="mr-2">💭</span>
                  생각 정리
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {scrap.comment}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <span className="mr-2">💭</span>
                  생각 정리
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-400 text-center italic">
                    코멘트가 없습니다
                  </p>
                </div>
              </div>
            )}

            {/* OCR 텍스트 */}
            {showOcrText && scrap.ocr_text && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <span className="mr-2">🔤</span>
                  문자인식 결과
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap text-sm">
                    {scrap.ocr_text}
                  </p>
                </div>
              </div>
            )}

            {/* 메타 정보 */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
              <span className="flex items-center">
                <span className="mr-2">⏰</span>
                {formatDate(scrap.created_at)}
              </span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                ID: {scrap.id}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapModal;