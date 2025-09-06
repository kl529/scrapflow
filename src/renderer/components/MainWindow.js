import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import ScrapGrid from './ScrapGrid';
import DateFilter from './DateFilter';
import SearchBar from './SearchBar';
import ScrapModal from './ScrapModal';

const MainWindow = () => {
  const [scraps, setScraps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedScrap, setSelectedScrap] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

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

  const loadData = async () => {
    try {
      const [scrapsData, categoriesData] = await Promise.all([
        window.electronAPI.getScraps(),
        window.electronAPI.getCategories()
      ]);
      
      setScraps(scrapsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadScraps = async () => {
    try {
      const filters = {
        category: selectedCategory,
        dateFilter: dateFilter !== 'all' ? dateFilter : null,
        searchText: searchText || null
      };
      
      const scrapsData = await window.electronAPI.getScraps(filters);
      setScraps(scrapsData);
    } catch (error) {
      console.error('스크랩 로드 실패:', error);
    }
  };

  const handleDeleteScrap = async (id) => {
    try {
      await window.electronAPI.deleteScrap(id);
      loadScraps();
      loadCategories();
    } catch (error) {
      console.error('스크랩 삭제 실패:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await window.electronAPI.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
    }
  };

  const handleCardClick = (scrap) => {
    setSelectedScrap(scrap);
  };

  const handleCloseModal = () => {
    setSelectedScrap(null);
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const handleImportScrap = async () => {
    if (isImporting) return;
    
    setIsImporting(true);
    
    try {
      // 파일 열기 대화상자 표시
      const result = await window.electronAPI.showOpenDialog({
        title: '스크랩 임포트',
        filters: [
          { name: 'ScrapFlow 파일', extensions: ['scrap'] },
          { name: 'JSON 파일', extensions: ['json'] },
          { name: '모든 파일', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        // 파일 읽기
        const fileContent = await window.electronAPI.readFile(result.filePaths[0]);
        const importData = JSON.parse(fileContent);
        
        // 스크랩 임포트
        const importedScrap = await window.electronAPI.importScrap(importData);
        
        // 데이터 새로고침
        await loadData();
        
        alert('스크랩이 성공적으로 임포트되었습니다!');
      }
    } catch (error) {
      console.error('스크랩 임포트 실패:', error);
      alert('스크랩 임포트 중 오류가 발생했습니다. 파일 형식을 확인해주세요.');
    } finally {
      setIsImporting(false);
    }
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
              📚 ScrapFlow
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {/* 스크랩 임포트 버튼 */}
                <button
                  onClick={handleImportScrap}
                  disabled={isImporting}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isImporting
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  {isImporting ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  )}
                  <span>{isImporting ? '임포트중...' : '스크랩 가져오기'}</span>
                </button>
                
                <Link
                  to="/statistics"
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>통계</span>
                </Link>
                <Link
                  to="/about"
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>About</span>
                </Link>
              </div>
              <DateFilter
                selectedFilter={dateFilter}
                onFilterChange={setDateFilter}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <SearchBar onSearch={handleSearch} />
            {searchText && (
              <div className="text-sm text-gray-500">
                "{searchText}" 검색 중
              </div>
            )}
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