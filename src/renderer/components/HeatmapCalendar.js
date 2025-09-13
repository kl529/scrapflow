import React, { useState } from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, startOfWeek, endOfWeek, isSameDay, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import useLanguage from '../hooks/useLanguage';

const HeatmapCalendar = ({ data, onDateClick }) => {
  const { t, currentLanguage } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(null);
  
  const now = new Date();
  // 지난 1년간의 데이터만 표시 (GitHub 스타일)
  const endDate = now;
  const startDate = subDays(now, 364); // 정확히 365일 (52주 * 7일 + 1일)
  
  // 지난 1년간의 모든 날짜 생성
  const allDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  // 데이터를 날짜별로 매핑
  const dataMap = {};
  data.forEach(item => {
    dataMap[item.date] = item.count;
  });

  // 최대값 계산 (색상 강도 결정용)
  const maxCount = Math.max(...data.map(item => item.count), 0);

  // 색상 강도 계산
  const getIntensity = (count) => {
    if (count === 0) return 0;
    if (maxCount <= 1) return 4;
    if (count === 1) return 1;
    if (count <= maxCount * 0.25) return 1;
    if (count <= maxCount * 0.5) return 2;
    if (count <= maxCount * 0.75) return 3;
    return 4;
  };

  // 색상 클래스 결정
  const getColorClass = (count) => {
    const intensity = getIntensity(count);
    const colorMap = {
      0: 'bg-gray-100',
      1: 'bg-green-200',
      2: 'bg-green-300',
      3: 'bg-green-500',
      4: 'bg-green-600'
    };
    return colorMap[intensity] || 'bg-gray-100';
  };

  // GitHub 스타일: 세로 7개(요일별), 가로로 주차 배열
  const weeks = [];
  let currentWeek = new Array(7).fill(null); // 일요일(0)부터 토요일(6)까지
  
  // 시작 날짜의 요일로 첫 주 시작점 결정
  const firstDayOfWeek = getDay(startDate);
  
  allDays.forEach((day, index) => {
    const dayOfWeek = getDay(day);
    
    // 새로운 주 시작 (일요일이거나 첫 번째 날짜)
    if (dayOfWeek === 0 && index > 0) {
      weeks.push([...currentWeek]);
      currentWeek = new Array(7).fill(null);
    }
    
    currentWeek[dayOfWeek] = day;
  });
  
  // 마지막 주 추가
  if (currentWeek.some(day => day !== null)) {
    weeks.push(currentWeek);
  }

  // 월 이름 표시용
  const monthLabels = [];
  const monthsShown = new Set();
  
  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.find(day => day !== null);
    if (firstValidDay) {
      const monthStr = format(firstValidDay, 'MMM', { locale: currentLanguage === 'ko' ? ko : undefined });
      if (!monthsShown.has(monthStr)) {
        monthLabels.push({ month: monthStr, weekIndex });
        monthsShown.add(monthStr);
      }
    }
  });

  const handleDateClick = (date, count) => {
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date, count);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">📊 {t('scrapActivity')}</h3>
          <p className="text-sm text-gray-500">
            {t('lastYearTotal')} <span className="font-semibold text-gray-700">{data.reduce((sum, item) => sum + item.count, 0)}</span> {t('scrapsCount')}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>{t('less')}</span>
          <div className="flex space-x-0.5">
            <div className="w-2.5 h-2.5 bg-gray-200 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-green-200 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-green-300 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-green-600 rounded-sm"></div>
          </div>
          <span>{t('more')}</span>
        </div>
      </div>

      {/* 히트맵 */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-start space-x-0.5 min-w-max">
          {/* 요일 라벨 (세로) */}
          <div className="flex flex-col space-y-0.5 mr-2">
            <div className="h-3"></div> {/* 월 라벨 공간 */}
            {(currentLanguage === 'ko' ? ['일', '월', '화', '수', '목', '금', '토'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((day, index) => (
              <div 
                key={day}
                className={`w-2.5 h-2.5 text-[10px] text-gray-500 flex items-center justify-end pr-1 ${
                  index % 2 === 1 ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 주별 컬럼 */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col space-y-0.5">
              {/* 월 라벨 */}
              <div className="h-3 text-[10px] text-gray-500 flex items-center justify-center">
                {monthLabels.find(label => label.weekIndex === weekIndex)?.month || ''}
              </div>
              
              {/* 요일별 셀 (세로 7개) */}
              {week.map((day, dayIndex) => {
                if (!day) {
                  return <div key={dayIndex} className="w-2.5 h-2.5"></div>;
                }

                const dateStr = format(day, 'yyyy-MM-dd');
                const count = dataMap[dateStr] || 0;
                const colorClass = getColorClass(count);
                const isToday = isSameDay(day, now);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <div
                    key={dateStr}
                    onClick={() => handleDateClick(day, count)}
                    className={`w-2.5 h-2.5 rounded-sm cursor-pointer transition-all duration-200 ${colorClass} ${
                      isToday ? 'ring-1 ring-blue-400 ring-offset-1' : ''
                    } ${
                      isSelected ? 'ring-2 ring-purple-400 ring-offset-1' : ''
                    } hover:ring-1 hover:ring-gray-400 hover:ring-offset-1 hover:scale-110`}
                    title={currentLanguage === 'ko'
                      ? `${format(day, 'yyyy년 M월 d일 (E)', { locale: ko })}: ${count}개 스크랩`
                      : `${format(day, 'E, MMM d, yyyy')}: ${count} scraps`
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="mt-4 flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <span>🔥 {t('streak')} {calculateStreak(data, now)}{t('days')}</span>
          <span>📈 {t('maxPerDay')} {maxCount}{t('perDay')}</span>
        </div>
        <span>{t('last365Days')}</span>
      </div>
    </div>
  );
};

// 연속 기록 계산
const calculateStreak = (data, today) => {
  if (!data.length) return 0;

  const dataMap = {};
  data.forEach(item => {
    dataMap[item.date] = item.count;
  });

  let streak = 0;
  let currentDate = new Date(today);

  while (true) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const count = dataMap[dateStr] || 0;
    
    if (count === 0) break;
    
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

export default HeatmapCalendar;