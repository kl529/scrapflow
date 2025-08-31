import React, { useState } from 'react';
import toast from 'react-hot-toast';

const CategoryModal = ({ onClose, onCategoryCreated }) => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#3B82F6');
  const [saving, setSaving] = useState(false);

  const predefinedColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast.error('카테고리 이름을 입력해주세요');
      return;
    }

    if (categoryName.trim() === '전체') {
      toast.error('\'전체\'는 예약된 이름입니다');
      return;
    }

    setSaving(true);
    
    try {
      await window.electronAPI.saveCategory({
        name: categoryName.trim(),
        color: categoryColor
      });
      
      toast.success('카테고리가 생성되었습니다');
      onCategoryCreated();
    } catch (error) {
      console.error('카테고리 저장 실패:', error);
      toast.error('카테고리 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📂 새 카테고리 생성
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 이름
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="예: 학습자료"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              disabled={saving}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              색상 선택
            </label>
            <div className="grid grid-cols-5 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCategoryColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    categoryColor === color
                      ? 'border-gray-800'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={saving}
                />
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={saving}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              disabled={saving || !categoryName.trim()}
            >
              {saving ? '저장 중...' : '완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;