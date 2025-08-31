import React, { useState, useEffect } from 'react';
import CategorySelector from './CategorySelector';
import toast from 'react-hot-toast';

const CommentWindow = () => {
  const [imagePath, setImagePath] = useState('');
  const [comment, setComment] = useState('');
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleScreenshotCaptured = (path) => {
      setImagePath(path);
    };

    window.electronAPI.onScreenshotCaptured(handleScreenshotCaptured);

    return () => {
      window.electronAPI.removeAllListeners('screenshot-captured');
    };
  }, []);

  const handleSave = () => {
    if (!imagePath) {
      toast.error('이미지가 없습니다');
      return;
    }
    setShowCategorySelector(true);
  };

  const handleCancel = () => {
    window.electronAPI.closeCommentWindow();
  };

  const handleCategorySelected = async (category) => {
    setSaving(true);
    
    try {
      const scrapData = {
        image_path: imagePath,
        comment: comment.trim(),
        category: category
      };

      await window.electronAPI.saveScrap(scrapData);
      toast.success('스크랩이 저장되었습니다!');
      
      setTimeout(() => {
        window.electronAPI.closeCommentWindow();
        window.electronAPI.showMainWindow();
      }, 1000);
      
    } catch (error) {
      console.error('스크랩 저장 실패:', error);
      toast.error('저장에 실패했습니다');
      setSaving(false);
      setShowCategorySelector(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 flex flex-col p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          📷 스크랩 저장
        </h2>
        
        <div className="flex-1 mb-4">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {imagePath && !imageError ? (
              <img
                src={window.electronAPI.getImageUrl(imagePath)}
                alt="캡처된 스크린샷"
                className="w-full h-full object-contain"
                onError={handleImageError}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">🖼️</div>
                  <div className="text-sm">이미지를 불러오는 중...</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            💭 코멘트를 입력하세요...
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="이 스크랩에 대한 메모를 남겨보세요"
            className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            autoFocus
            disabled={saving}
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={saving}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={!imagePath || saving}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
      
      {showCategorySelector && (
        <CategorySelector
          onCategorySelected={handleCategorySelected}
          onCancel={() => setShowCategorySelector(false)}
          disabled={saving}
        />
      )}
    </div>
  );
};

export default CommentWindow;