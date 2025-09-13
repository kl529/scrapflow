import React from 'react';
import ScrapCard from './ScrapCard';
import useLanguage from '../hooks/useLanguage';

const ScrapGrid = ({ scraps, onDelete, onCardClick, selectedCategory }) => {
  const { t } = useLanguage();

  if (scraps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-6xl mb-4">📷</div>
        <h3 className="text-lg font-medium mb-2">{t('noScraps')}</h3>
        <p className="text-sm">{t('noScrapsDescription')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {scraps.map((scrap) => (
        <ScrapCard
          key={scrap.id}
          scrap={scrap}
          onDelete={onDelete}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
};

export default ScrapGrid;