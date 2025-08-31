# ScrapFlow API 문서

## IPC API 문서

ScrapFlow는 Electron의 IPC(Inter-Process Communication)를 통해 메인 프로세스와 렌더러 프로세스 간 통신을 합니다.

## 인증된 API (electronAPI)

렌더러 프로세스에서 `window.electronAPI`를 통해 접근 가능한 API들입니다.

### 스크랩 관련 API

#### getScraps(filters)
스크랩 목록을 조회합니다.

**Parameters:**
- `filters` (Object, optional): 필터 조건
  - `category` (String): 카테고리명 ('전체'인 경우 모든 카테고리)
  - `dateFilter` (String): 날짜 필터 ('today', 'week', 'month', null)

**Returns:**
- `Promise<Array>`: 스크랩 배열

**Example:**
```javascript
// 모든 스크랩 조회
const allScraps = await window.electronAPI.getScraps();

// 개발 카테고리의 이번주 스크랩 조회
const devScraps = await window.electronAPI.getScraps({
  category: '개발',
  dateFilter: 'week'
});
```

**Response:**
```javascript
[
  {
    id: 1,
    image_path: "/path/to/screenshot.png",
    comment: "유용한 React 패턴",
    category: "개발",
    created_at: "2025-08-31T10:30:00.000Z"
  },
  // ...
]
```

#### saveScrap(scrapData)
새로운 스크랩을 저장합니다.

**Parameters:**
- `scrapData` (Object): 스크랩 데이터
  - `image_path` (String): 이미지 파일 경로
  - `comment` (String): 사용자 코멘트
  - `category` (String): 카테고리명

**Returns:**
- `Promise<Object>`: 저장된 스크랩 데이터 (id 포함)

**Example:**
```javascript
const newScrap = await window.electronAPI.saveScrap({
  image_path: "/path/to/image.png",
  comment: "중요한 내용",
  category: "개발"
});
```

#### deleteScrap(id)
스크랩을 삭제합니다.

**Parameters:**
- `id` (Number): 삭제할 스크랩 ID

**Returns:**
- `Promise<Boolean>`: 삭제 성공 여부

**Example:**
```javascript
const deleted = await window.electronAPI.deleteScrap(123);
```

### 카테고리 관련 API

#### getCategories()
모든 카테고리를 조회합니다.

**Returns:**
- `Promise<Array>`: 카테고리 배열 (스크랩 개수 포함)

**Example:**
```javascript
const categories = await window.electronAPI.getCategories();
```

**Response:**
```javascript
[
  {
    name: "전체",
    color: "#6B7280",
    count: 25
  },
  {
    name: "개발", 
    color: "#3B82F6",
    count: 15
  },
  // ...
]
```

#### saveCategory(category)
새로운 카테고리를 생성하거나 기존 카테고리를 수정합니다.

**Parameters:**
- `category` (Object): 카테고리 데이터
  - `name` (String): 카테고리명
  - `color` (String): 색상 (#hex 형식)

**Returns:**
- `Promise<Object>`: 저장된 카테고리 데이터

**Example:**
```javascript
const newCategory = await window.electronAPI.saveCategory({
  name: "디자인",
  color: "#F59E0B"
});
```

### 윈도우 관리 API

#### closeCommentWindow()
코멘트 윈도우를 닫습니다.

**Returns:**
- `Promise<void>`

**Example:**
```javascript
await window.electronAPI.closeCommentWindow();
```

#### showMainWindow()
메인 윈도우를 표시하고 포커스합니다.

**Returns:**
- `Promise<void>`

**Example:**
```javascript
await window.electronAPI.showMainWindow();
```

### 이벤트 리스너 API

#### onScreenshotCaptured(callback)
스크린샷이 캡처되었을 때 실행될 콜백을 등록합니다.

**Parameters:**
- `callback` (Function): 콜백 함수
  - `imagePath` (String): 캡처된 이미지 경로

**Example:**
```javascript
window.electronAPI.onScreenshotCaptured((imagePath) => {
  console.log('스크린샷 캡처됨:', imagePath);
  setImagePath(imagePath);
});
```

#### removeAllListeners(channel)
특정 채널의 모든 이벤트 리스너를 제거합니다.

**Parameters:**
- `channel` (String): 이벤트 채널명

**Example:**
```javascript
// 컴포넌트 언마운트 시
window.electronAPI.removeAllListeners('screenshot-captured');
```

## 데이터베이스 스키마

### scraps 테이블
```sql
CREATE TABLE scraps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_path TEXT NOT NULL,
  comment TEXT,
  category TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### categories 테이블  
```sql
CREATE TABLE categories (
  name TEXT PRIMARY KEY,
  color TEXT NOT NULL,
  count INTEGER DEFAULT 0
);
```

## 에러 처리

모든 API 호출은 Promise를 반환하므로 try-catch 블록으로 에러를 처리해야 합니다.

**일반적인 에러 처리:**
```javascript
try {
  const scraps = await window.electronAPI.getScraps();
  // 성공 처리
} catch (error) {
  console.error('스크랩 조회 실패:', error);
  // 에러 처리
}
```

## 주요 에러 유형

- **DatabaseError**: 데이터베이스 작업 실패
- **FileSystemError**: 파일 시스템 접근 실패
- **ValidationError**: 데이터 검증 실패

## 성능 고려사항

### 대용량 데이터 처리
- `getScraps()` 호출 시 적절한 필터 사용 권장
- 이미지 파일 크기 최적화
- 페이지네이션 구현 시 limit/offset 활용

### 캐싱
- 카테고리 목록은 자주 변경되지 않으므로 클라이언트 캐싱 활용
- 이미지 썸네일 캐싱으로 성능 향상

### 동시성
- 동시에 여러 API 호출 시 Promise.all 활용
- 데이터베이스 트랜잭션 활용으로 데이터 일관성 보장