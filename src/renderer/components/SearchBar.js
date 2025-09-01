import React, { useState, useEffect } from 'react';

const SearchBar = ({ onSearch, placeholder = "스크랩 내용이나 이미지 텍스트로 검색..." }) => {
  const [searchText, setSearchText] = useState('');

  // 실시간 검색 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchText.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedText = searchText.trim();
    onSearch(trimmedText);
  };

  const handleClear = () => {
    setSearchText('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-lg">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg 
            className="w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        
        {searchText && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;