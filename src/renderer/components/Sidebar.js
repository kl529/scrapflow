import React, { useState } from 'react';
import CategoryModal from './CategoryModal';
import useLanguage from '../hooks/useLanguage';

const Sidebar = ({ categories, selectedCategory, onCategorySelect, onCategoryUpdate }) => {
  const { t } = useLanguage();
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleAddCategory = () => {
    setShowCategoryModal(true);
  };

  const handleCategoryCreated = () => {
    setShowCategoryModal(false);
    onCategoryUpdate();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('categories')}</h2>

        <button
          onClick={handleAddCategory}
          className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          + {t('addCategory')}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="p-2">
          {categories.map((category) => {
            // 카테고리 표시명 결정
            const displayName = category.name === '전체' ? t('allCategories') : category.name;
            // 선택 상태 확인 (실제 카테고리명이나 번역된 이름 모두 확인)
            const isSelected = selectedCategory === category.name ||
                             (category.name === '전체' && selectedCategory === t('allCategories'));

            return (
              <button
                key={category.name}
                onClick={() => onCategorySelect(category.name === '전체' ? t('allCategories') : category.name)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm font-medium">{displayName}</span>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto p-4 border-t border-gray-200">
          <button
            onClick={() => window.electronAPI?.openExternal('https://github.com/sponsors/kl529')}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>{t('buyMeCoffee')}</span>
          </button>
        </div>
      </div>
      
      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(false)}
          onCategoryCreated={handleCategoryCreated}
        />
      )}
    </div>
  );
};

export default Sidebar;