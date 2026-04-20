/**
 * PostHog 분석 통합 모듈 — scrapflow (Electron Desktop App)
 *
 * 설치 & 초기화 패턴은 GRO-83 설계 플랜을 따릅니다.
 * Electron 렌더러 프로세스(Chromium 컨텍스트)에서 posthog-js 직접 사용.
 * Next.js 프록시가 없으므로 PostHog 서버에 직접 연결합니다.
 * API Key는 REACT_APP_POSTHOG_KEY 환경 변수로 주입합니다.
 */
import posthog from 'posthog-js';

const PROJECT_NAME = 'scrapflow';

let initialized = false;

export function initPostHog() {
  if (initialized) return;
  const key = process.env.REACT_APP_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: 'https://us.i.posthog.com',
    ui_host: 'https://us.posthog.com',
    capture_pageview: false, // 수동으로 screen_viewed 이벤트를 발행
    capture_pageleave: false,
    persistence: 'localStorage',
    loaded: (ph) => {
      ph.register({ project_name: PROJECT_NAME });
      if (process.env.NODE_ENV === 'development') {
        ph.opt_out_capturing();
      }
    },
  });
  initialized = true;
}

/** 이벤트 추적 헬퍼 */
export function track(event, props) {
  posthog.capture(event, props);
}

/** 유저 식별 (선택적 — 오프라인 앱이므로 익명 사용 가능) */
export function identifyUser(userId, traits) {
  posthog.identify(userId, traits);
}

/** 앱 세션 리셋 */
export function resetUser() {
  posthog.reset();
}

/**
 * 표준 이벤트 카탈로그 (GRO-83 공통 이벤트 스키마)
 */
export const events = {
  // 화면 진입 (데스크탑 앱이므로 page_viewed 대신 screen_viewed 사용)
  screenViewed: (screenName) =>
    track('screen_viewed', { screen_name: screenName }),

  // 앱 열기/닫기
  appOpened: (entryPoint = 'direct') =>
    track('app_opened', { entry_point: entryPoint }),

  // scrapflow 핵심 기능 이벤트
  screenshotCaptured: () =>
    track('feature_used', { feature_name: 'screenshot_capture' }),

  ocrCompleted: (success) =>
    track('feature_used', {
      feature_name: 'ocr_extraction',
      action_detail: success ? 'success' : 'failure',
    }),

  itemSaved: (itemType) =>
    track('content_created', { content_type: itemType || 'scrap' }),

  itemDeleted: () =>
    track('content_deleted', { content_type: 'scrap' }),

  searchPerformed: (query, resultsCount) =>
    track('search_performed', { query, results_count: resultsCount }),

  ctaClicked: (ctaName, ctaLocation) =>
    track('cta_clicked', { cta_name: ctaName, cta_location: ctaLocation }),

  errorEncountered: (errorType, errorMessage) =>
    track('error_encountered', {
      error_type: errorType,
      error_message: errorMessage,
    }),
};
