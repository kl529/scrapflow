import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CategorySelector = ({ onCategorySelected, onCancel, disabled }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const predefinedColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await window.electronAPI.getCategories();
      const filteredCategories = data.filter(cat => cat.name !== '전체');
      setCategories(filteredCategories);
      
      if (filteredCategories.length > 0) {
        setSelectedCategory(filteredCategories[0].name);
      }
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
      toast.error('카테고리를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      toast.error('카테고리 이름을 입력해주세요');
      return;
    }

    if (newCategoryName.trim() === '전체') {
      toast.error('\'전체\'는 예약된 이름입니다');
      return;
    }

    if (categories.some(cat => cat.name === newCategoryName.trim())) {
      toast.error('이미 존재하는 카테고리입니다');
      return;
    }

    setCreating(true);
    
    try {
      await window.electronAPI.saveCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor
      });
      
      await loadCategories();
      setSelectedCategory(newCategoryName.trim());
      setShowNewCategoryForm(false);
      setNewCategoryName('');
      toast.success('카테고리가 생성되었습니다');
    } catch (error) {
      console.error('카테고리 생성 실패:', error);
      toast.error('카테고리 생성에 실패했습니다');
    } finally {
      setCreating(false);
    }
  };

  const handleConfirm = () => {
    if (selectedCategory) {
      onCategorySelected(selectedCategory);
    } else {
      toast.error('카테고리를 선택해주세요');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-80">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">로딩 중...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📂 카테고리 선택
        </h3>
        
        {!showNewCategoryForm ? (
          <div>
            <div className="mb-4 max-h-48 overflow-y-auto">
              {categories.map((category) => (
                <label
                  key={category.name}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.name}
                    checked={selectedCategory === category.name}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mr-3"
                    disabled={disabled}
                  />
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                </label>
              ))}
            </div>
            
            <button
              type="button"
              onClick={() => setShowNewCategoryForm(true)}
              className="w-full p-2 text-blue-600 hover:bg-blue-50 rounded-lg mb-4 text-sm font-medium"
              disabled={disabled}
            >
              + 새 카테고리 생성
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={disabled}
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={!selectedCategory || disabled}
              >
                완료
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateCategory}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 이름
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="예: 학습자료"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                disabled={creating}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                색상 선택
              </label>
              <div className="grid grid-cols-5 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategoryColor(color)}
                    className={`w-6 h-6 rounded-full border-2 ${
                      newCategoryColor === color
                        ? 'border-gray-800'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    disabled={creating}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowNewCategoryForm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={creating}
              >
                뒤로
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={!newCategoryName.trim() || creating}
              >
                {creating ? '생성 중...' : '생성'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CategorySelector;