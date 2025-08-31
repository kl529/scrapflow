import React from 'react';

const DateFilter = ({ selectedFilter, onFilterChange }) => {
  const filters = [
    { key: 'today', label: '오늘' },
    { key: 'week', label: '이번주' },
    { key: 'month', label: '이번달' },
    { key: 'all', label: '전체' }
  ];

  return (
    <div className="flex space-x-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            selectedFilter === filter.key
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🗓️ {filter.label}
        </button>
      ))}
    </div>
  );
};

export default DateFilter;