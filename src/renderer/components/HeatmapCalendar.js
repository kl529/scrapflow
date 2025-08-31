import React from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';

const HeatmapCalendar = ({ data }) => {
  const now = new Date();
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);
  
  // 올해의 모든 날짜 생성
  const allDays = eachDayOfInterval({
    start: yearStart,
    end: yearEnd
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

  // 주별로 날짜 그룹핑
  const weeks = [];
  let currentWeek = [];
  
  // 첫 주의 시작을 일요일로 맞추기 위해 빈 칸 추가
  const firstDayOfWeek = getDay(yearStart);
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  allDays.forEach(day => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });

  // 마지막 주 완성
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  // 월 이름 표시용
  const monthLabels = [];
  const monthsShown = new Set();
  
  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.find(day => day !== null);
    if (firstValidDay) {
      const monthStr = format(firstValidDay, 'MMM', { locale: ko });
      if (!monthsShown.has(monthStr)) {
        monthLabels.push({ month: monthStr, weekIndex });
        monthsShown.add(monthStr);
      }
    }
  });

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      {/* 범례 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          {format(now, 'yyyy년', { locale: ko })} 스크랩 활동
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <span>적음</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
          </div>
          <span>많음</span>
        </div>
      </div>

      {/* 달력 */}
      <div className="overflow-x-auto">
        <div className="flex space-x-1">
          {/* 요일 라벨 */}
          <div className="flex flex-col space-y-1">
            <div className="h-4"></div> {/* 월 라벨 공간 */}
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div 
                key={day}
                className={`w-3 h-3 text-xs text-gray-600 flex items-center justify-center ${
                  index % 2 === 1 ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 주별 달력 */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col space-y-1">
              {/* 월 라벨 */}
              <div className="h-4 text-xs text-gray-600 flex items-center justify-center">
                {monthLabels.find(label => label.weekIndex === weekIndex)?.month || ''}
              </div>
              
              {/* 일별 셀 */}
              {week.map((day, dayIndex) => {
                if (!day) {
                  return <div key={dayIndex} className="w-3 h-3"></div>;
                }

                const dateStr = format(day, 'yyyy-MM-dd');
                const count = dataMap[dateStr] || 0;
                const colorClass = getColorClass(count);
                const isToday = isSameDay(day, now);

                return (
                  <div
                    key={dateStr}
                    className={`w-3 h-3 rounded-sm ${colorClass} ${
                      isToday ? 'ring-2 ring-blue-500' : ''
                    } hover:ring-2 hover:ring-gray-400 transition-all cursor-pointer`}
                    title={`${format(day, 'yyyy년 M월 d일', { locale: ko })}: ${count}개 스크랩`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="mt-4 flex justify-between text-xs text-gray-600">
        <span>
          총 {data.reduce((sum, item) => sum + item.count, 0)}개의 스크랩
        </span>
        <span>
          연속 기록: {calculateStreak(data, now)}일
        </span>
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