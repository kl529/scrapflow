import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeatmapCalendar from './HeatmapCalendar';

const Statistics = () => {
  const [stats, setStats] = useState({
    totalScraps: 0,
    todayScraps: 0,
    thisWeekScraps: 0,
    thisMonthScraps: 0,
    categoryStats: [],
    dailyStats: []
  });
  const [loading, setLoading] = useState(true);

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
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // 오늘, 이번 주, 이번 달 스크랩 계산
      const todayScraps = scrapsData.filter(scrap => 
        new Date(scrap.created_at) >= todayStart
      ).length;

      const thisWeekScraps = scrapsData.filter(scrap => 
        new Date(scrap.created_at) >= weekStart
      ).length;

      const thisMonthScraps = scrapsData.filter(scrap => 
        new Date(scrap.created_at) >= monthStart
      ).length;

      // 날짜별 스크랩 개수 계산
      const dailyStats = calculateDailyStats(scrapsData);

      setStats({
        totalScraps: scrapsData.length,
        todayScraps,
        thisWeekScraps,
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
              📊 통계
            </h1>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="전체 스크랩"
            value={stats.totalScraps}
            icon="📚"
            color="bg-blue-500"
          />
          <StatCard
            title="오늘"
            value={stats.todayScraps}
            icon="📅"
            color="bg-green-500"
          />
          <StatCard
            title="이번 주"
            value={stats.thisWeekScraps}
            icon="📊"
            color="bg-purple-500"
          />
          <StatCard
            title="이번 달"
            value={stats.thisMonthScraps}
            icon="📈"
            color="bg-orange-500"
          />
        </div>

        {/* 히트맵 달력 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🌱</span>
            스크랩 활동
          </h2>
          <HeatmapCalendar data={stats.dailyStats} />
        </div>

        {/* 카테고리별 통계 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📂</span>
            카테고리별 분포
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
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white text-xl`}>
        {icon}
      </div>
    </div>
  </div>
);

export default Statistics;