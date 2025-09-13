import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';

const About = () => {
  const { t } = useLanguage();
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
              ℹ️ {t('aboutTitle')}
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
              {t('appDescription')}
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {t('appFullDescription')}
            </p>
          </div>
        </div>

        {/* 주요 기능 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">✨</span>
            {t('mainFeatures')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              icon="📸"
              title={t('quickScreenshot')}
              description={t('quickScreenshotDesc')}
            />
            <FeatureCard
              icon="💭"
              title={t('thoughtOrganizing')}
              description={t('thoughtOrganizingDesc')}
            />
            <FeatureCard
              icon="📂"
              title={t('categoryManagement')}
              description={t('categoryManagementDesc')}
            />
            <FeatureCard
              icon="🔍"
              title={t('smartSearch')}
              description={t('smartSearchDesc')}
            />
            <FeatureCard
              icon="🤖"
              title={t('autoOcr')}
              description={t('autoOcrDesc')}
            />
            <FeatureCard
              icon="📊"
              title={t('activityStats')}
              description={t('activityStatsDesc')}
            />
            <FeatureCard
              icon="🖼️"
              title={t('scrapDetailView')}
              description={t('scrapDetailViewDesc')}
            />
            <FeatureCard
              icon="📅"
              title={t('dateFiltering')}
              description={t('dateFilteringDesc')}
            />
            <FeatureCard
              icon="⚡"
              title={t('realtimeUpdate')}
              description={t('realtimeUpdateDesc')}
            />
          </div>
        </div>

        {/* 사용법 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">📖</span>
            {t('howToUse')}
          </h3>

          <div className="space-y-6">
            <UsageStep
              number="1"
              title={t('screenshotCapture')}
              description={t('screenshotCaptureDesc')}
            />
            <UsageStep
              number="2"
              title={t('addComment')}
              description={t('addCommentDesc')}
            />
            <UsageStep
              number="3"
              title={t('selectCategory')}
              description={t('selectCategoryDesc')}
            />
            <UsageStep
              number="4"
              title={t('searchScraps')}
              description={t('searchScrapsDesc')}
            />
            <UsageStep
              number="5"
              title={t('viewScrapDetail')}
              description={t('viewScrapDetailDesc')}
            />
          </div>
        </div>

        {/* 단축키 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">⌨️</span>
            {t('shortcuts')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ShortcutItem
              keys="Ctrl+Shift+S"
              mac="Cmd+Shift+S"
              description={t('screenshotShortcut')}
            />
            <ShortcutItem
              keys="ESC"
              description={t('closeModal')}
            />
          </div>
        </div>

        {/* OCR 상태 및 마이그레이션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">🔍</span>
            {t('ocrTextExtraction')}
          </h3>
          
          {/* 디버깅 정보 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">📊 {t('ocrStatus')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-gray-900">{t('totalScrapsLabel')}</div>
                <div className="text-2xl font-bold text-blue-600">{allScraps.length}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-gray-900">{t('ocrCompleted')}</div>
                <div className="text-2xl font-bold text-green-600">
                  {allScraps.length - scrapsWithoutOcr.length}
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="font-medium text-gray-900">{t('ocrPending')}</div>
                <div className="text-2xl font-bold text-orange-600">{scrapsWithoutOcr.length}</div>
              </div>
            </div>
            
            {/* 샘플 데이터 표시 */}
            {allScraps.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-700 mb-2">🔍 {t('searchTestData')}</h5>
                <div className="max-h-32 overflow-y-auto bg-white p-2 rounded border text-xs">
                  {allScraps.slice(0, 3).map((scrap, index) => (
                    <div key={scrap.id} className="mb-2 p-2 border-b border-gray-100 last:border-b-0">
                      <div><strong>{t('scrapNumber')} {scrap.id}:</strong></div>
                      <div>{t('comment')}: "{scrap.comment || t('none')}"</div>
                      <div>OCR: "{scrap.ocr_text ? scrap.ocr_text.substring(0, 100) + '...' : t('none')}"</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            {scrapsWithoutOcr.length > 0 ? (
              <p className="text-gray-700 mb-4">
                {t('ocrNeedText')} <strong>{scrapsWithoutOcr.length}</strong>{t('ocrNeedCount')}
              </p>
            ) : (
              <p className="text-green-700 mb-4">
                ✅ {t('ocrCompletedText')}
                <br />
                <span className="text-gray-600 text-sm">{t('ocrAutoText')}</span>
              </p>
            )}
              
              {isProcessing && ocrProgress && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {t('processing')} ({ocrProgress.processed}/{ocrProgress.total})
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
                  {isProcessing ? t('processing') : t('startOcrExtraction')}
                </button>
              )}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">{t('precautions')}</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• {t('ocrTakesTime')}</li>
                    <li>• {t('dontCloseApp')}</li>
                    <li>• {t('recognizesKoreanEnglish')}</li>
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
            {t('dataStorageLocation')}
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
              💡 <strong>TIP:</strong> {t('storageTip')}
            </p>
          </div>
        </div>

        {/* 버전 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ScrapFlow v1.0.0
          </h3>
          <p className="text-gray-600 mb-6">
            {t('motto')}
          </p>

          {/* 개발자 소개 */}
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 mb-2">👨‍💻 {t('developer')}</div>
            <div className="text-gray-700 mb-3">
              <strong>kl529 (lyvakim)</strong>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              <span dangerouslySetInnerHTML={{__html: t('developerBio')}} />
            </p>

            {/* GitHub 및 링크 */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => window.electronAPI?.openExternal('https://github.com/kl529')}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>{t('githubProfile')}</span>
              </button>
              <button
                onClick={() => window.electronAPI?.openExternal('https://github.com/kl529/scrapflow')}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>{t('projectRepository')}</span>
              </button>
            </div>
          </div>

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