const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 스크랩 관련
  getScraps: (filters) => ipcRenderer.invoke('get-scraps', filters),
  saveScrap: (scrapData) => ipcRenderer.invoke('save-scrap', scrapData),
  deleteScrap: (id) => ipcRenderer.invoke('delete-scrap', id),
  
  // 카테고리 관련
  getCategories: () => ipcRenderer.invoke('get-categories'),
  saveCategory: (category) => ipcRenderer.invoke('save-category', category),
  
  // OCR 관련
  processScrapsOcr: () => ipcRenderer.invoke('process-scraps-ocr'),
  getScrapsWithoutOcr: () => ipcRenderer.invoke('get-scraps-without-ocr'),
  
  // 윈도우 관련
  closeCommentWindow: () => ipcRenderer.invoke('close-comment-window'),
  showMainWindow: () => ipcRenderer.invoke('show-main-window'),
  
  // 이벤트 리스너
  onScreenshotCaptured: (callback) => {
    ipcRenderer.on('screenshot-captured', (event, imagePath) => {
      callback(imagePath);
    });
  },
  
  onOcrMigrationProgress: (callback) => {
    ipcRenderer.on('ocr-migration-progress', (event, data) => {
      callback(event, data);
    });
  },
  
  onScrapSaved: (callback) => {
    ipcRenderer.on('scrap-saved', (event, scrapData) => {
      callback(scrapData);
    });
  },
  
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // 로컬 파일 경로를 안전한 URL로 변환
  getImageUrl: (filePath) => {
    return `scrapflow://${encodeURIComponent(filePath)}`;
  },

  // 디버깅용
  debugDatabase: () => ipcRenderer.invoke('debug-database')
});