import React, { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import useLanguage from '../hooks/useLanguage';

const ScrapCard = ({ scrap, onDelete, onCardClick }) => {
  const { t, currentLanguage } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const [showFullComment, setShowFullComment] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent card click event propagation
    if (window.confirm(t('deleteConfirm'))) {
      onDelete(scrap.id);
    }
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(scrap);
    }
  };

  const formatDate = (dateString) => {
    try {
      const locale = currentLanguage === 'ko' ? ko : undefined;
      return format(new Date(dateString), 'yyyy.MM.dd HH:mm', { locale });
    } catch (error) {
      return t('dateError');
    }
  };

  const truncateComment = (comment, maxLength = 50) => {
    if (!comment || comment.length <= maxLength) return comment;
    return comment.substring(0, maxLength) + '...';
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="aspect-video bg-gray-100 relative">
        {imageError ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🖼️</div>
              <div className="text-sm">{t('imageLoadError')}</div>
            </div>
          </div>
        ) : (
          <img
            src={window.electronAPI.getImageUrl(scrap.image_path)}
            alt={t('scrapImage')}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        )}
        
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs"
        >
          ×
        </button>
      </div>
      
      <div className="p-3">
        <div className="mb-2">
          {scrap.comment ? (
            <div>
              <p className="text-sm text-gray-700 mb-1">
                💭 {showFullComment ? scrap.comment : truncateComment(scrap.comment)}
              </p>
              {scrap.comment.length > 50 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullComment(!showFullComment);
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  {showFullComment ? t('showLess') : t('showMore')}
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">{t('noComment')}</p>
          )}
        </div>
        
        {scrap.source_url && (
          <div className="mb-2">
            <div className="flex items-center text-xs text-blue-600">
              <span className="mr-1">🔗</span>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.electronAPI && window.electronAPI.openExternal && window.electronAPI.openExternal(scrap.source_url);
                }}
                className="hover:underline cursor-pointer truncate"
                title={`${t('clickToOpenSource')}: ${scrap.source_url}`}
              >
                {scrap.source_url.length > 30 ? scrap.source_url.substring(0, 30) + '...' : scrap.source_url}
              </a>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <span
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: getCategoryColor(scrap.category) }}
            ></span>
            {scrap.category}
          </span>
          <span>⏰ {formatDate(scrap.created_at)}</span>
        </div>
      </div>
    </div>
  );
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

export default ScrapCard;