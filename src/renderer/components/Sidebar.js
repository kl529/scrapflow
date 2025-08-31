import React, { useState } from 'react';
import CategoryModal from './CategoryModal';

const Sidebar = ({ categories, selectedCategory, onCategorySelect, onCategoryUpdate }) => {
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">카테고리</h2>
        
        <button
          onClick={handleAddCategory}
          className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          + 새 카테고리
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => onCategorySelect(category.name)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors flex items-center justify-between ${
                selectedCategory === category.name
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {category.count}
              </span>
            </button>
          ))}
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