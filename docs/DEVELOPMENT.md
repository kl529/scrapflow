# ScrapFlow 개발 가이드

## 개발 환경 설정

### 필수 요구사항
- Node.js 16.x 이상
- npm 8.x 이상
- Git

### 설치 및 실행

1. **저장소 클론**
```bash
git clone <repository-url>
cd scrapflow
```

2. **의존성 설치**
```bash
npm install
```

3. **개발 모드 실행**
```bash
npm run dev
```

4. **프로덕션 빌드**
```bash
npm run build-all
```

## 프로젝트 구조

```
scrapflow/
├── src/
│   ├── main/                 # Electron 메인 프로세스
│   │   ├── main.js          # 앱 진입점
│   │   ├── database.js      # SQLite 데이터베이스
│   │   └── preload.js       # IPC 브릿지
│   ├── renderer/            # React 렌더러 프로세스
│   │   ├── components/      # React 컴포넌트
│   │   ├── hooks/           # 커스텀 훅
│   │   ├── utils/           # 유틸리티 함수
│   │   ├── App.js           # 메인 App 컴포넌트
│   │   ├── index.js         # React 진입점
│   │   └── index.css        # 글로벌 스타일
│   ├── shared/              # 공통 코드
│   └── assets/              # 정적 자산
├── docs/                    # 문서
├── build/                   # React 빌드 출력
├── dist/                    # Electron 패키징 출력
├── public/                  # 공개 자산
├── package.json            # 패키지 설정
├── tailwind.config.js      # Tailwind 설정
└── postcss.config.js       # PostCSS 설정
```

## 개발 워크플로우

### 1. 새로운 기능 개발

1. **브랜치 생성**
```bash
git checkout -b feature/새기능명
```

2. **개발 진행**
- 컴포넌트 작성
- API 연동
- 스타일링
- 테스트 작성

3. **커밋 및 푸시**
```bash
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin feature/새기능명
```

### 2. 버그 수정

1. **버그 재현**
- 문제 상황 재현
- 로그 확인
- 디버깅

2. **수정 및 테스트**
```bash
git checkout -b bugfix/버그명
# 수정 작업
npm test
npm run build
```

## 코딩 컨벤션

### JavaScript/React
- ES6+ 문법 사용
- 함수형 컴포넌트 + Hooks 사용
- PropTypes 또는 TypeScript 타입 정의
- 2 spaces 들여쓰기

**예시:**
```javascript
import React, { useState, useEffect } from 'react';

const MyComponent = ({ title, onClose }) => {
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // 효과 로직
  }, []);
  
  const handleClick = () => {
    // 클릭 핸들러
  };
  
  return (
    <div className="my-component">
      <h2>{title}</h2>
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
};

export default MyComponent;
```

### CSS/Tailwind
- Tailwind CSS 클래스 사용 우선
- 커스텀 CSS는 최소화
- 반응형 디자인 고려

**예시:**
```jsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
  <h3 className="text-lg font-semibold text-gray-900">제목</h3>
  <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
    버튼
  </button>
</div>
```

### 파일 명명 규칙
- 컴포넌트: PascalCase (`MyComponent.js`)
- 유틸리티: camelCase (`myUtility.js`)
- 상수: UPPER_CASE (`CONFIG.js`)
- 스타일: kebab-case (`my-style.css`)

## 디버깅

### 개발자 도구 열기
```javascript
// 메인 프로세스에서
mainWindow.webContents.openDevTools();
```

### 로그 확인
- 메인 프로세스: 터미널 출력
- 렌더러 프로세스: 브라우저 개발자 도구

### 일반적인 문제들

1. **IPC 통신 오류**
```javascript
// preload.js에서 API가 제대로 노출되었는지 확인
console.log('electronAPI:', window.electronAPI);
```

2. **데이터베이스 연결 실패**
```javascript
// database.js에서 연결 상태 확인
this.db.on('open', () => console.log('DB 연결 성공'));
this.db.on('error', (err) => console.error('DB 오류:', err));
```

3. **스크린샷 캡처 실패**
```javascript
// 권한 및 디스플레이 정보 확인
const displays = await screenshot.listDisplays();
console.log('사용 가능한 디스플레이:', displays);
```

## 테스트

### 유닛 테스트
```bash
npm test
```

### E2E 테스트
```bash
npm run test:e2e
```

### 수동 테스트 체크리스트
- [ ] 앱 시작 및 종료
- [ ] 글로벌 단축키 (Ctrl+Shift+S)
- [ ] 스크린샷 캡처
- [ ] 코멘트 입력 및 저장
- [ ] 카테고리 생성 및 선택
- [ ] 스크랩 목록 조회
- [ ] 필터링 (카테고리, 날짜)
- [ ] 스크랩 삭제
- [ ] 시스템 트레이 동작

## 빌드 및 배포

### 개발 빌드
```bash
npm run build
```

### 프로덕션 빌드
```bash
# Windows
npm run build-win

# macOS  
npm run build-mac

# Linux
npm run build-linux

# 모든 플랫폼
npm run build-all
```

### 빌드 파일 위치
- Windows: `dist/ScrapFlow Setup.exe`
- macOS: `dist/ScrapFlow.dmg`
- Linux: `dist/ScrapFlow.AppImage`

## 성능 최적화

### React 컴포넌트 최적화
```javascript
import React, { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  // 무거운 렌더링 로직
}, (prevProps, nextProps) => {
  // 커스텀 비교 로직
  return prevProps.data.id === nextProps.data.id;
});
```

### 이미지 최적화
- WebP 형식 사용 고려
- 썸네일 생성 및 캐싱
- Lazy Loading 구현

### 데이터베이스 최적화
```sql
-- 인덱스 생성
CREATE INDEX idx_scraps_category ON scraps(category);
CREATE INDEX idx_scraps_created_at ON scraps(created_at);
```

## 보안 가이드라인

### Context Isolation 유지
```javascript
// main.js
new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
  }
});
```

### 안전한 파일 경로
```javascript
// 경로 순회 공격 방지
const safePath = path.resolve(userDataPath, filename);
if (!safePath.startsWith(userDataPath)) {
  throw new Error('Invalid file path');
}
```

### 입력 데이터 검증
```javascript
const validateScrapData = (data) => {
  if (!data.image_path || !data.category) {
    throw new Error('Required fields missing');
  }
  if (data.comment && data.comment.length > 1000) {
    throw new Error('Comment too long');
  }
};
```

## 트러블슈팅

### 자주 발생하는 문제들

1. **빌드 실패**
- Node.js 버전 확인
- 의존성 재설치: `rm -rf node_modules && npm install`
- 캐시 정리: `npm run clean`

2. **앱이 시작되지 않음**
- 메인 프로세스 로그 확인
- 권한 설정 확인 (macOS/Linux)
- 바이러스 백신 소프트웨어 확인

3. **스크린샷이 캡처되지 않음**
- 화면 녹화 권한 확인 (macOS)
- 디스플레이 설정 확인
- 다중 모니터 환경 확인

## 기여하기

1. **이슈 생성**
   - 버그 리포트
   - 기능 요청
   - 질문

2. **풀 리퀘스트**
   - 포크 후 작업
   - 명확한 커밋 메시지
   - 테스트 포함
   - 문서 업데이트