import React from 'react';
import useLanguage from '../hooks/useLanguage';

const DateFilter = ({ selectedFilter, onFilterChange }) => {
  const { t } = useLanguage();

  const filters = [
    { key: 'today', label: t('today') },
    { key: 'month', label: t('thisMonth') },
    { key: 'all', label: t('allTime') }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`px-3 py-1 text-sm rounded-lg transition-colors whitespace-nowrap ${
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