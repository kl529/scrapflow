# ScrapFlow UI 디자인 가이드

## 디자인 시스템

### 색상 팔레트

#### Primary Colors
```css
--blue-50: #eff6ff;
--blue-100: #dbeafe;
--blue-500: #3b82f6;  /* 메인 액션 */
--blue-600: #2563eb;  /* 호버 상태 */
--blue-700: #1d4ed8;  /* 액티브 상태 */
```

#### Semantic Colors
```css
--success: #10b981;   /* 성공, 저장 */
--warning: #f59e0b;   /* 주의, 경고 */
--error: #ef4444;     /* 오류, 삭제 */
--info: #06b6d4;      /* 정보 */
```

#### Neutral Colors
```css
--gray-50: #f9fafb;   /* 배경 */
--gray-100: #f3f4f6;  /* 연한 배경 */
--gray-200: #e5e7eb;  /* 테두리 */
--gray-300: #d1d5db;  /* 비활성 테두리 */
--gray-500: #6b7280;  /* 보조 텍스트 */
--gray-700: #374151;  /* 주 텍스트 */
--gray-900: #111827;  /* 제목 */
```

### 타이포그래피

#### 폰트 스택
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
```

#### 텍스트 스케일
- **Hero (32px)**: 메인 제목
- **Heading 1 (24px)**: 섹션 제목  
- **Heading 2 (20px)**: 서브 섹션
- **Heading 3 (18px)**: 카드 제목
- **Body (16px)**: 본문 텍스트
- **Small (14px)**: 보조 정보
- **Caption (12px)**: 라벨, 메타 정보

### 간격 시스템

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## 화면별 디자인 명세

### 메인 윈도우 (1200x800)

#### 레이아웃 구조
```
┌─────────────────────────────────────────────┐
│ Header (높이: 64px)                          │
├─────────┬───────────────────────────────────┤
│         │ Content Area                      │
│ Sidebar │ ┌─────────────────────────────┐   │
│         │ │ Date Filter (높이: 48px)     │   │
│(너비:   │ ├─────────────────────────────┤   │
│ 256px)  │ │                             │   │
│         │ │ Scrap Grid                  │   │
│         │ │                             │   │
│         │ │                             │   │
│         │ └─────────────────────────────┘   │
└─────────┴───────────────────────────────────┘
```

#### 컴포넌트 스펙

**Header**
- 배경: `bg-white`
- 테두리: `border-b border-gray-200`
- 패딩: `px-6 py-4`
- 제목: "📚 ScrapFlow" (text-2xl font-bold)

**Sidebar**
- 배경: `bg-white`
- 테두리: `border-r border-gray-200`
- 너비: `256px` (고정)

**Scrap Grid**
- 그리드: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- 간격: `gap-4`
- 패딩: `p-4`

### 스크랩 카드

#### 디자인 스펙
```
┌─────────────────────────────┐
│ Image Area (16:9 비율)       │ ← 200px width
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │     Screenshot          │ │ ← 112px height
│ │                         │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 💭 Comment text...      │ │
│ │ ⏰ 2025.08.31 14:30     │ │ ← 60px height
│ │ 📂 Category             │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**스타일링**
- 배경: `bg-white`
- 그림자: `shadow-sm hover:shadow-md`
- 테두리: `border border-gray-200`
- 모서리: `rounded-lg`
- 전환: `transition-shadow duration-200`

### 코멘트 윈도우 (400x500)

#### 레이아웃
```
┌───────────────────────────────┐
│ 📷 스크랩 저장               │ ← Header (48px)
├───────────────────────────────┤
│                               │
│    Screenshot Preview         │ ← 280px height
│    (16:9 비율)                │
│                               │
├───────────────────────────────┤
│ 💭 코멘트를 입력하세요...      │ ← Label
│ ┌─────────────────────────┐   │
│ │                         │   │ ← 80px height
│ │     텍스트 입력 영역      │   │
│ │                         │   │
│ └─────────────────────────┘   │
├───────────────────────────────┤
│    [취소]        [저장]       │ ← Footer (56px)
└───────────────────────────────┘
```

### 카테고리 선택 모달 (320x400)

#### 레이아웃
```
┌─────────────────────────┐
│ 📂 카테고리 선택         │ ← Header
├─────────────────────────┤
│ ○ 전체 (25)             │
│ ○ 개발 (15)             │ ← 카테고리 목록
│ ○ 디자인 (8)            │   (스크롤 가능)
│ ○ 비즈니스 (2)          │
│ ┌─────────────────────┐ │
│ │ + 새 카테고리 생성   │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│    [취소]      [완료]   │ ← Footer
└─────────────────────────┘
```

## 인터랙션 디자인

### 애니메이션

#### 호버 효과
```css
.scrap-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}
```

#### 모달 등장
```css
.modal-enter {
  opacity: 0;
  transform: scale(0.95);
}
.modal-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: all 0.2s ease-out;
}
```

#### 버튼 상태
```css
.button {
  transition: all 0.15s ease-in-out;
}
.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.button:active {
  transform: translateY(0);
}
```

### 상태별 스타일

#### 로딩 상태
```jsx
<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
```

#### 빈 상태
```jsx
<div className="text-center py-12 text-gray-500">
  <div className="text-6xl mb-4">📷</div>
  <h3 className="text-lg font-medium mb-2">스크랩이 없습니다</h3>
  <p className="text-sm">Ctrl+Shift+S로 첫 번째 스크랩을 만들어보세요!</p>
</div>
```

#### 에러 상태
```jsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <div className="text-red-600 text-sm">오류가 발생했습니다</div>
</div>
```

## 반응형 디자인

### 브레이크포인트
```css
/* Mobile */
@media (max-width: 768px) {
  .sidebar { width: 240px; }
  .scrap-grid { grid-template-columns: 1fr; }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .scrap-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1025px) {
  .scrap-grid { grid-template-columns: repeat(3, 1fr); }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .scrap-grid { grid-template-columns: repeat(4, 1fr); }
}
```

## 접근성 가이드라인

### 키보드 탐색
- Tab으로 모든 인터랙티브 요소 접근 가능
- Enter/Space로 버튼 활성화
- ESC로 모달 닫기

### 색상 대비
- WCAG AA 기준 준수 (4.5:1 이상)
- 색상만으로 정보 전달 금지
- 아이콘과 텍스트 조합 사용

### 스크린 리더
```jsx
<button aria-label="스크랩 삭제">
  <TrashIcon />
</button>

<img src="..." alt="캡처된 스크린샷" />

<div role="alert" aria-live="polite">
  저장이 완료되었습니다
</div>
```

## 다크 모드 (향후 계획)

### 색상 변수
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --border: #e5e7eb;
}

[data-theme="dark"] {
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --text-primary: #f9fafb;
  --border: #374151;
}
```

## 성능 최적화

### 이미지 최적화
- WebP 포맷 사용
- 썸네일 생성 및 캐싱
- Lazy loading 구현

### CSS 최적화
- 불필요한 Tailwind 클래스 제거
- CSS-in-JS 대신 정적 CSS 활용
- 애니메이션 성능 최적화 (transform, opacity 사용)