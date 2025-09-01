import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const [scrapsWithoutOcr, setScrapsWithoutOcr] = useState([]);
  const [allScraps, setAllScraps] = useState([]);
  const [ocrProgress, setOcrProgress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadScrapsWithoutOcr();
    loadAllScraps();
    
    // OCR 진행률 이벤트 리스너
    const handleOcrProgress = (event, data) => {
      setOcrProgress(data);
      if (data.processed === data.total) {
        setIsProcessing(false);
        loadScrapsWithoutOcr(); // 완료되면 다시 로드
        loadAllScraps(); // 전체 스크랩도 다시 로드
      }
    };

    window.electronAPI.onOcrMigrationProgress?.(handleOcrProgress);

    return () => {
      // 클린업은 필요시 추가
    };
  }, []);

  const loadScrapsWithoutOcr = async () => {
    try {
      if (!window.electronAPI || !window.electronAPI.getScrapsWithoutOcr) {
        console.error('electronAPI.getScrapsWithoutOcr가 정의되지 않음');
        return;
      }
      const scraps = await window.electronAPI.getScrapsWithoutOcr();
      console.log('OCR 없는 스크랩:', scraps.length, '개');
      setScrapsWithoutOcr(scraps);
    } catch (error) {
      console.error('OCR 없는 스크랩 로드 실패:', error);
    }
  };

  const loadAllScraps = async () => {
    try {
      if (!window.electronAPI || !window.electronAPI.getScraps) {
        console.error('electronAPI.getScraps가 정의되지 않음');
        return;
      }
      const scraps = await window.electronAPI.getScraps();
      setAllScraps(scraps);
    } catch (error) {
      console.error('전체 스크랩 로드 실패:', error);
    }
  };

  const handleProcessOCR = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setOcrProgress({ processed: 0, total: scrapsWithoutOcr.length });
    
    try {
      const result = await window.electronAPI.processScrapsOcr();
      console.log('OCR 처리 완료:', result);
    } catch (error) {
      console.error('OCR 처리 실패:', error);
      setIsProcessing(false);
      setOcrProgress(null);
    }
  };

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
              ℹ️ About ScrapFlow
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* 소개 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">ScrapFlow</h2>
            <p className="text-lg text-gray-600">
              스크린샷으로 생각을 기록하고 정리하는 스마트한 방법
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">
              ScrapFlow는 일상 속에서 마주치는 영감, 아이디어, 중요한 정보들을 스크린샷으로 쉽게 캡처하고 
              체계적으로 관리할 수 있도록 도와주는 애플리케이션입니다. 
              단순한 스크린샷 도구를 넘어서, 여러분의 생각과 아이디어를 하나의 흐름으로 연결해주는 
              개인 지식 관리 도구입니다.
            </p>
          </div>
        </div>

        {/* 주요 기능 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">✨</span>
            주요 기능
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              icon="📸"
              title="빠른 스크린샷 캡처"
              description="Ctrl+Shift+S (또는 Cmd+Shift+S) 단축키로 언제든지 화면의 원하는 영역을 캡처할 수 있습니다."
            />
            <FeatureCard
              icon="💭"
              title="생각 정리"
              description="캡처한 스크린샷에 코멘트를 추가하여 나만의 생각과 해석을 기록할 수 있습니다."
            />
            <FeatureCard
              icon="📂"
              title="카테고리 관리"
              description="개발, 디자인, 비즈니스 등 다양한 카테고리로 스크랩을 체계적으로 분류하고 관리할 수 있습니다."
            />
            <FeatureCard
              icon="🔍"
              title="스마트 검색"
              description="코멘트와 OCR로 추출된 텍스트에서 실시간 검색이 가능하며, 대소문자를 구분하지 않습니다."
            />
            <FeatureCard
              icon="🤖"
              title="자동 OCR 텍스트 추출"
              description="Tesseract.js 6.x를 사용하여 영어와 한국어 텍스트를 자동으로 인식하고 추출합니다."
            />
            <FeatureCard
              icon="📊"
              title="활동 통계"
              description="GitHub 잔디심기 스타일의 히트맵으로 스크랩 활동을 시각적으로 확인할 수 있습니다."
            />
            <FeatureCard
              icon="🖼️"
              title="스크랩 상세 보기"
              description="스크랩을 클릭하면 큰 화면으로 이미지, 코멘트, OCR 텍스트를 자세히 볼 수 있습니다."
            />
            <FeatureCard
              icon="📅"
              title="날짜별 필터링"
              description="오늘, 이번 주, 이번 달로 스크랩을 필터링하여 원하는 기간의 자료를 쉽게 찾을 수 있습니다."
            />
            <FeatureCard
              icon="⚡"
              title="실시간 업데이트"
              description="스크랩 추가/삭제 시 카테고리 개수와 목록이 즉시 업데이트되어 항상 최신 상태를 유지합니다."
            />
          </div>
        </div>

        {/* 사용법 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">📖</span>
            사용법
          </h3>

          <div className="space-y-6">
            <UsageStep
              number="1"
              title="스크린샷 캡처하기"
              description="Ctrl+Shift+S (Windows/Linux) 또는 Cmd+Shift+S (Mac) 단축키를 누르면 화면 캡처 모드가 시작됩니다. 마우스로 원하는 영역을 드래그하여 선택하세요."
            />
            <UsageStep
              number="2"
              title="코멘트 추가하기"
              description="캡처가 완료되면 코멘트 창이 나타납니다. 스크린샷에 대한 생각이나 메모를 자유롭게 작성해보세요. (선택사항)"
            />
            <UsageStep
              number="3"
              title="카테고리 선택하기"
              description="적절한 카테고리를 선택하거나 새로운 카테고리를 생성하여 스크랩을 분류하세요."
            />
            <UsageStep
              number="4"
              title="스크랩 검색하기"
              description="상단 검색창에서 코멘트나 OCR로 추출된 텍스트를 실시간으로 검색할 수 있습니다. 카테고리나 날짜 필터와 함께 사용하면 더욱 정확한 결과를 얻을 수 있습니다."
            />
            <UsageStep
              number="5"
              title="스크랩 상세 보기"
              description="스크랩을 클릭하면 상세 모달이 열리며, 큰 이미지와 코멘트를 확인할 수 있습니다. OCR 텍스트가 있는 경우 '문자인식' 버튼을 클릭하여 추출된 텍스트를 볼 수 있습니다."
            />
          </div>
        </div>

        {/* 단축키 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">⌨️</span>
            단축키
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ShortcutItem
              keys="Ctrl+Shift+S"
              mac="Cmd+Shift+S"
              description="스크린샷 캡처"
            />
            <ShortcutItem
              keys="ESC"
              description="모달 창 닫기"
            />
          </div>
        </div>

        {/* OCR 상태 및 마이그레이션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">🔍</span>
            OCR 텍스트 추출
          </h3>
          
          {/* 디버깅 정보 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">📊 OCR 상태</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-gray-900">전체 스크랩</div>
                <div className="text-2xl font-bold text-blue-600">{allScraps.length}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-gray-900">OCR 완료</div>
                <div className="text-2xl font-bold text-green-600">
                  {allScraps.length - scrapsWithoutOcr.length}
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-gray-900">OCR 대기</div>
                <div className="text-2xl font-bold text-orange-600">{scrapsWithoutOcr.length}</div>
              </div>
            </div>
            
            {/* 샘플 데이터 표시 */}
            {allScraps.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-700 mb-2">🔍 검색 테스트용 데이터 샘플</h5>
                <div className="max-h-32 overflow-y-auto bg-white p-2 rounded border text-xs">
                  {allScraps.slice(0, 3).map((scrap, index) => (
                    <div key={scrap.id} className="mb-2 p-2 border-b border-gray-100 last:border-b-0">
                      <div><strong>스크랩 {scrap.id}:</strong></div>
                      <div>코멘트: "{scrap.comment || '(없음)'}"</div>
                      <div>OCR: "{scrap.ocr_text ? scrap.ocr_text.substring(0, 100) + '...' : '(없음)'}"</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            {scrapsWithoutOcr.length > 0 ? (
              <p className="text-gray-700 mb-4">
                기존 스크랩 <strong>{scrapsWithoutOcr.length}개</strong>에 OCR 텍스트 추출이 필요합니다. 
                텍스트 추출을 완료하면 이미지 속 텍스트로도 검색할 수 있게 됩니다.
              </p>
            ) : (
              <p className="text-green-700 mb-4">
                ✅ 모든 스크랩에 OCR 텍스트 추출이 완료되었습니다!
                <br />
                <span className="text-gray-600 text-sm">새로운 스크린샷은 자동으로 OCR 처리됩니다.</span>
              </p>
            )}
              
              {isProcessing && ocrProgress && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      처리 중... ({ocrProgress.processed}/{ocrProgress.total})
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round((ocrProgress.processed / ocrProgress.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(ocrProgress.processed / ocrProgress.total) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              {scrapsWithoutOcr.length > 0 && (
                <button
                  onClick={handleProcessOCR}
                  disabled={isProcessing}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isProcessing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isProcessing ? '처리 중...' : 'OCR 텍스트 추출 시작'}
                </button>
              )}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">주의사항</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• OCR 처리에는 시간이 걸릴 수 있습니다</li>
                    <li>• 처리 중에는 앱을 종료하지 마세요</li>
                    <li>• 한국어와 영어 텍스트를 인식합니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 저장 위치 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">📁</span>
            데이터 저장 위치
          </h3>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">macOS</h4>
              <code className="text-sm text-gray-700 bg-white px-2 py-1 rounded">
                ~/Library/Application Support/scrapflow/
              </code>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Windows</h4>
              <code className="text-sm text-gray-700 bg-white px-2 py-1 rounded">
                %APPDATA%/scrapflow/
              </code>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Linux</h4>
              <code className="text-sm text-gray-700 bg-white px-2 py-1 rounded">
                ~/.config/scrapflow/
              </code>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>팁:</strong> 스크린샷 이미지는 screenshots/ 폴더에, 
              메타데이터(코멘트, 카테고리 등)는 scrapflow.db 파일에 저장됩니다.
            </p>
          </div>
        </div>

        {/* 버전 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ScrapFlow v1.0.0
          </h3>
          <p className="text-gray-600 mb-4">
            생각을 기록하고, 아이디어를 연결하고, 지식을 쌓아가세요.
          </p>
          <div className="text-sm text-gray-500">
            Made with ❤️ using Electron & React
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50">
    <div className="text-2xl">{icon}</div>
    <div>
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

const UsageStep = ({ number, title, description }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
      {number}
    </div>
    <div>
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

const ShortcutItem = ({ keys, mac, description }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-3">
      <kbd className="px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded">
        {keys}
      </kbd>
      {mac && (
        <>
          <span className="text-gray-400">/</span>
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded">
            {mac}
          </kbd>
        </>
      )}
    </div>
    <span className="text-sm text-gray-600">{description}</span>
  </div>
);

export default About;