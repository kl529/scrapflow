import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import ScrapGrid from './ScrapGrid';
import DateFilter from './DateFilter';
import SearchBar from './SearchBar';
import ScrapModal from './ScrapModal';
import LanguageSelector from './LanguageSelector';
import useLanguage from '../hooks/useLanguage';

const MainWindow = () => {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [scraps, setScraps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedScrap, setSelectedScrap] = useState(null);

  useEffect(() => {
    loadData();
    
    // 윈도우 포커스 시 데이터 새로고침
    const handleFocus = () => {
      loadData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // 스크랩 저장 완료 이벤트 리스너
    const handleScrapSaved = () => {
      loadData(); // 카테고리 개수와 전체 목록 새로고침
    };
    
    // IPC 이벤트 리스너 (나중에 구현 예정)
    if (window.electronAPI && window.electronAPI.onScrapSaved) {
      window.electronAPI.onScrapSaved(handleScrapSaved);
    }
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      if (window.electronAPI && window.electronAPI.removeAllListeners) {
        window.electronAPI.removeAllListeners('scrap-saved');
      }
    };
  }, []);

  useEffect(() => {
    loadScraps();
  }, [selectedCategory, dateFilter, searchText]);

  // 언어 변경 시 기본 카테고리명 업데이트
  useEffect(() => {
    if (selectedCategory === '전체' || selectedCategory === 'All') {
      setSelectedCategory(t('allCategories'));
    }
  }, [currentLanguage, t]);

  // useCallback으로 함수들을 메모이제이션하여 불필요한 리렌더링 방지
  const loadData = useCallback(async () => {
    try {
      const [scrapsData, categoriesData] = await Promise.all([
        window.electronAPI.getScraps(),
        window.electronAPI.getCategories()
      ]);
      
      setScraps(scrapsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error(t('dataLoadError'), error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadScraps = useCallback(async () => {
    try {
      // 실제 카테고리 값으로 변환 (전체/All을 실제 DB 값으로)
      const actualCategory = selectedCategory === t('allCategories') ? '전체' : selectedCategory;

      const filters = {
        category: actualCategory,
        dateFilter: dateFilter !== 'all' ? dateFilter : null,
        searchText: searchText || null
      };
      
      const scrapsData = await window.electronAPI.getScraps(filters);
      setScraps(scrapsData);
    } catch (error) {
      console.error(t('scrapLoadError'), error);
    }
  }, [selectedCategory, dateFilter, searchText]);

  const handleDeleteScrap = useCallback(async (id) => {
    try {
      await window.electronAPI.deleteScrap(id);
      loadScraps();
      loadCategories();
    } catch (error) {
      console.error(t('scrapDeleteError'), error);
    }
  }, [loadScraps]);

  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await window.electronAPI.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error(t('categoryLoadError'), error);
    }
  }, []);

  const handleCardClick = (scrap) => {
    setSelectedScrap(scrap);
  };

  const handleCloseModal = () => {
    setSelectedScrap(null);
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        onCategoryUpdate={loadCategories}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('appTitle')}
            </h1>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="flex items-center space-x-1 lg:space-x-2">
                <LanguageSelector
                  currentLanguage={currentLanguage}
                  onLanguageChange={changeLanguage}
                />
                <button
                  onClick={() => window.electronAPI?.openExternal('https://github.com/kl529/scrapflow')}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </button>
                <Link
                  to="/statistics"
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="hidden sm:inline">{t('statistics')}</span>
                </Link>
                <Link
                  to="/about"
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">{t('about')}</span>
                </Link>
              </div>
              <div className="hidden lg:block">
                <DateFilter
                  selectedFilter={dateFilter}
                  onFilterChange={setDateFilter}
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 lg:items-center">
            <div className="flex items-center space-x-4 flex-1">
              <SearchBar onSearch={handleSearch} />
              {searchText && (
                <div className="text-sm text-gray-500">
                  "{searchText}" {t('searchingFor')}
                </div>
              )}
            </div>
            <div className="lg:hidden">
              <DateFilter
                selectedFilter={dateFilter}
                onFilterChange={setDateFilter}
              />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <ScrapGrid
            scraps={scraps}
            onDelete={handleDeleteScrap}
            onCardClick={handleCardClick}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>
      
      {selectedScrap && (
        <ScrapModal
          scrap={selectedScrap}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default MainWindow;