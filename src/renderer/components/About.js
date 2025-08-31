import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
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
              title="필터링 & 검색"
              description="날짜별, 카테고리별로 스크랩을 필터링하여 원하는 정보를 빠르게 찾을 수 있습니다."
            />
            <FeatureCard
              icon="📊"
              title="활동 통계"
              description="GitHub 잔디심기 스타일의 히트맵으로 스크랩 활동을 시각적으로 확인할 수 있습니다."
            />
            <FeatureCard
              icon="🖼️"
              title="이미지 확대 보기"
              description="스크랩을 클릭하면 큰 화면으로 이미지와 코멘트를 자세히 볼 수 있습니다."
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
              title="스크랩 관리하기"
              description="메인 화면에서 저장된 스크랩들을 확인하고, 클릭하여 자세히 보거나 필요없는 것은 삭제할 수 있습니다."
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