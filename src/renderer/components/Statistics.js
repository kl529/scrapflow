import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeatmapCalendar from './HeatmapCalendar';
import useLanguage from '../hooks/useLanguage';

const Statistics = () => {
  const { t, currentLanguage } = useLanguage();
  const [stats, setStats] = useState({
    totalScraps: 0,
    todayScraps: 0,
    thisMonthScraps: 0,
    categoryStats: [],
    dailyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateScraps, setSelectedDateScraps] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [scrapsData, categoriesData] = await Promise.all([
        window.electronAPI.getScraps(),
        window.electronAPI.getCategories()
      ]);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // 오늘, 이번 달 스크랩 계산
      const todayScraps = scrapsData.filter(scrap =>
        new Date(scrap.created_at) >= todayStart
      ).length;

      const thisMonthScraps = scrapsData.filter(scrap =>
        new Date(scrap.created_at) >= monthStart
      ).length;

      // 날짜별 스크랩 개수 계산
      const dailyStats = calculateDailyStats(scrapsData);

      setStats({
        totalScraps: scrapsData.length,
        todayScraps,
        thisMonthScraps,
        categoryStats: categoriesData,
        dailyStats
      });
    } catch (error) {
      console.error('통계 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyStats = (scraps) => {
    const dailyMap = {};
    
    scraps.forEach(scrap => {
      const date = new Date(scrap.created_at).toISOString().split('T')[0];
      dailyMap[date] = (dailyMap[date] || 0) + 1;
    });

    return Object.entries(dailyMap).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const handleDateClick = async (date, count) => {
    if (count === 0) return; // 스크랩이 없는 날은 모달 표시하지 않음
    
    try {
      const dateStr = new Date(date).toISOString().split('T')[0];
      const allScraps = await window.electronAPI.getScraps();
      
      // 해당 날짜의 스크랩들 필터링
      const dateScraps = allScraps.filter(scrap => {
        const scrapDate = new Date(scrap.created_at).toISOString().split('T')[0];
        return scrapDate === dateStr;
      });
      
      setSelectedDate(date);
      setSelectedDateScraps(dateScraps);
      setShowDateModal(true);
    } catch (error) {
      console.error('날짜별 스크랩 로드 실패:', error);
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
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              📊 {t('statistics')}
            </h1>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard
            title={t('totalScraps')}
            value={stats.totalScraps}
            icon="📚"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title={t('today')}
            value={stats.todayScraps}
            icon="🎯"
            color="bg-gradient-to-br from-green-500 to-green-600"
            isToday={true}
            currentLanguage={currentLanguage}
          />
          <StatCard
            title={t('thisMonthScraps')}
            value={stats.thisMonthScraps}
            icon="📈"
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>

        {/* 히트맵 달력 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🌱</span>
            {t('scrapsPerDay')}
          </h2>
          <HeatmapCalendar data={stats.dailyStats} onDateClick={handleDateClick} />
        </div>

        {/* 카테고리별 통계 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📂</span>
            {t('categoryDistribution')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.categoryStats
              .filter(cat => cat.name !== '전체')
              .map(category => (
              <div
                key={category.name}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <span className="text-xl font-bold text-gray-700">{category.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 날짜별 스크랩 모달 */}
      {showDateModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    📅 {new Date(selectedDate).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('totalItems')} <span className="font-semibold text-blue-600">{selectedDateScraps.length}</span>{t('items')}
                  </p>
                </div>
                <button
                  onClick={() => setShowDateModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 스크랩 목록 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {selectedDateScraps.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">📭</div>
                  <p>{t('noScrapsOnThisDate')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedDateScraps.map(scrap => (
                    <div key={scrap.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      {/* 스크랩 이미지 */}
                      <div className="mb-3">
                        <img 
                          src={`scrapflow://${scrap.image_path}`}
                          alt="스크랩"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dy="0.3em">이미지 없음</text></svg>';
                          }}
                        />
                      </div>

                      {/* 스크랩 정보 */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {scrap.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(scrap.created_at).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        {scrap.comment && (
                          <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                            {scrap.comment}
                          </p>
                        )}

                        {scrap.source_url && (
                          <p className="text-xs text-gray-500 truncate">
                            🔗 {scrap.source_url}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {t('categoryDistributionFooter')} {
                    [...new Set(selectedDateScraps.map(s => s.category))]
                      .map(cat => `${cat} ${selectedDateScraps.filter(s => s.category === cat).length}${currentLanguage === 'ko' ? '개' : ''}`)
                      .join(', ')
                  }
                </div>
                <button
                  onClick={() => setShowDateModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color, isToday, currentLanguage }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
        <p className="text-4xl font-bold text-gray-900 mb-1">{value}</p>
        <div className="flex items-center text-xs text-gray-400">
          {isToday && (
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {new Date().toLocaleDateString(currentLanguage === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white text-2xl shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

export default Statistics;