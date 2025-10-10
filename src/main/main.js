const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, shell, protocol, screen, desktopCapturer } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const screenshot = require('screenshot-desktop');
const DatabaseManager = require('./database');
const OCRService = require('./ocrService');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
// Canvas 대신 Electron 내장 기능 사용

class ScrapFlowApp {
  constructor() {
    this.mainWindow = null;
    this.commentWindow = null;
    this.tray = null;
    this.database = new DatabaseManager();
    this.ocrService = new OCRService();
    this.setupApp();
  }

  setupApp() {
    app.whenReady().then(async () => {
      // 동시에 실행 가능한 초기화 작업들을 병렬로 처리
      await Promise.all([
        this.setupProtocol(),
        this.database.init(),
        this.setupTray(),
      ]);

      // 메인 윈도우는 즉시 생성하되 보이지 않게 설정
      this.createMainWindow();
      this.registerGlobalShortcuts();

      // OCR 서비스는 백그라운드에서 지연 초기화 (논블로킹)
      this.initOCRLazy();
      
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
        } else if (this.mainWindow) {
          // 윈도우가 숨겨진 상태면 다시 표시
          this.mainWindow.show();
          this.mainWindow.focus();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
      this.ocrService.terminate();
    });

    this.setupIpcHandlers();
  }

  async initOCR() {
    try {
      await this.ocrService.initialize();
    } catch (error) {
      console.error('OCR 서비스 초기화 실패:', error.message);
    }
  }

  // 지연된 OCR 초기화 (논블로킹)
  initOCRLazy() {
    // 앱 시작 후 2초 후에 OCR 초기화 시작
    setTimeout(async () => {
      try {
        await this.ocrService.initialize();
      } catch (error) {
        console.error('OCR 서비스 초기화 실패:', error.message);
      }
    }, 2000);
  }

  setupProtocol() {
    // 로컬 파일에 접근하기 위한 커스텀 프로토콜 등록
    protocol.registerFileProtocol('scrapflow', (request, callback) => {
      const url = request.url.substr(12); // 'scrapflow://' 제거
      callback({ path: path.normalize(decodeURIComponent(url)) });
    });
  }

  createMainWindow() {
    const windowConfig = {
      width: 1200,
      height: 800,
      icon: path.join(__dirname, '../logo.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        // 성능 최적화 옵션
        backgroundThrottling: false, // 백그라운드에서도 성능 유지
        enableRemoteModule: false,   // 보안 및 성능 향상
      },
      show: false,
      // 윈도우 생성 최적화
      paintWhenInitiallyHidden: false,
    };

    this.mainWindow = new BrowserWindow(windowConfig);

    const startUrl = isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../index.html')}`;

    this.mainWindow.loadURL(startUrl);

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  setupTray() {
    const iconPath = path.join(__dirname, '../logo.png');
    
    // 아이콘 파일이 없으면 기본 아이콘 사용하거나 건너뛰기
    try {
      this.tray = new Tray(iconPath);
    } catch (error) {
      console.warn('트레이 아이콘을 로드할 수 없습니다. 기본 설정으로 계속 진행합니다.');
      // 아이콘 없이도 트레이 메뉴는 동작하도록 임시 해결
      return;
    }
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'ScrapFlow 열기',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
          } else {
            this.createMainWindow();
          }
        }
      },
      {
        label: '스크린샷 캡처',
        accelerator: 'CommandOrControl+Shift+S',
        click: () => this.takeScreenshot()
      },
      { type: 'separator' },
      {
        label: '종료',
        click: () => {
          app.quit();
        }
      }
    ]);

    if (this.tray) {
      this.tray.setToolTip('ScrapFlow');
      this.tray.setContextMenu(contextMenu);
      
      this.tray.on('double-click', () => {
        if (this.mainWindow) {
          this.mainWindow.show();
          this.mainWindow.focus();
        }
      });
    }
  }

  registerGlobalShortcuts() {
    const ret = globalShortcut.register('CommandOrControl+Shift+S', () => {
      this.takeScreenshot();
    });

    if (!ret) {
      console.error('글로벌 단축키 등록 실패');
    }
  }

  async getCurrentBrowserUrl() {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      // 먼저 현재 활성 애플리케이션이 브라우저인지 확인
      let frontmostApp = null;
      try {
        const { stdout } = await execAsync(`osascript -e 'tell application "System Events" to set frontApp to name of first application process whose frontmost is true'`);
        frontmostApp = stdout.trim();
      } catch (error) {
        // 실패시 조용히 무시
      }
      
      // 브라우저별 URL 가져오기 스크립트 (더 안전한 방식)
      const browserScripts = [
        {
          name: 'Google Chrome',
          processName: 'Google Chrome',
          script: `tell application "Google Chrome"
            if it is running then
              try
                if (count of windows) > 0 then
                  if visible of front window then
                    return URL of active tab of front window
                  end if
                end if
              end try
            end if
            return ""
          end tell`
        },
        {
          name: 'Safari',
          processName: 'Safari',
          script: `tell application "Safari"
            if it is running then
              try
                if (count of windows) > 0 then
                  if visible of front window then
                    return URL of front document
                  end if
                end if
              end try
            end if
            return ""
          end tell`
        },
        {
          name: 'Arc',
          processName: 'Arc',
          script: `tell application "Arc"
            if it is running then
              try
                if (count of windows) > 0 then
                  if visible of front window then
                    return URL of active tab of front window
                  end if
                end if
              end try
            end if
            return ""
          end tell`
        },
        {
          name: 'Microsoft Edge',
          processName: 'Microsoft Edge',
          script: `tell application "Microsoft Edge"
            if it is running then
              try
                if (count of windows) > 0 then
                  if visible of front window then
                    return URL of active tab of front window
                  end if
                end if
              end try
            end if
            return ""
          end tell`
        },
        {
          name: 'Whale',
          processName: 'Whale',
          script: `tell application "Whale"
            if it is running then
              try
                if (count of windows) > 0 then
                  if visible of front window then
                    return URL of active tab of front window
                  end if
                end if
              end try
            end if
            return ""
          end tell`
        }
      ];
      
      // 활성 앱이 브라우저인 경우 먼저 시도
      const activeBrowser = browserScripts.find(browser => browser.processName === frontmostApp);
      if (activeBrowser) {
        try {
          const { stdout, stderr } = await execAsync(`osascript -e '${activeBrowser.script}'`);

          if (!stderr) {
            const url = stdout.trim();

            if (url && url !== '' && !url.includes('error') && url.startsWith('http')) {
              return url;
            }
          }
        } catch (error) {
          // 실패시 조용히 무시
        }
      }
      
      // 활성 앱에서 URL을 찾지 못한 경우 다른 브라우저들을 시도
      for (const browser of browserScripts) {
        if (browser.processName === frontmostApp) continue; // 이미 시도함

        try {
          const { stdout, stderr } = await execAsync(`osascript -e '${browser.script}'`);

          if (!stderr) {
            const url = stdout.trim();

            if (url && url !== '' && !url.includes('error') && url.startsWith('http')) {
              return url;
            }
          }
        } catch (error) {
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error('브라우저 URL 가져오기 실패:', error);
      return null;
    }
  }

  async takeScreenshot() {
    try {
      // 스크린샷 찍기 전에 브라우저 URL 가져오기 (백그라운드에서 숨기기 전에)
      const currentUrl = await this.getCurrentBrowserUrl();

      // 현재 활성 윈도우를 기억하고 Electron 앱을 백그라운드로 숨기기
      if (this.mainWindow && this.mainWindow.isVisible()) {
        this.mainWindow.hide();
      }
      
      // 잠시 대기하여 다른 앱이 포커스를 받을 시간을 줌
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // macOS screencapture 명령어를 사용한 영역 선택 캡처
      const { spawn } = require('child_process');
      const filename = `screenshot-${Date.now()}.png`;
      const filepath = path.join(app.getPath('userData'), 'screenshots', filename);
      
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      
      // screencapture -i (interactive mode)로 영역 선택 모드 실행
      // -x 옵션 추가: 소리 없이 캡처
      const screencapture = spawn('screencapture', ['-i', '-x', filepath]);
      
      screencapture.on('close', (code) => {
        if (code === 0) {
          // 성공적으로 캡처되었으면 코멘트 윈도우 표시
          this.showCommentWindow(filepath, currentUrl);
        } else if (code === 1) {
          // 사용자가 ESC로 취소한 경우
          if (this.mainWindow) {
            this.mainWindow.show();
          }
        } else {
          console.error('스크린샷 캡처 실패, 종료 코드:', code);
          if (this.mainWindow) {
            this.mainWindow.show();
          }
        }
      });
      
      screencapture.on('error', (error) => {
        console.error('screencapture 실행 오류:', error);
        
        // 에러 시 메인 윈도우 복원
        if (this.mainWindow) {
          this.mainWindow.show();
        }
        
        // 권한 문제 안내
        const { dialog } = require('electron');
        dialog.showErrorBox('권한 필요', 
          'ScrapFlow가 스크린샷을 캡처하려면 화면 녹화 권한이 필요합니다.\n\n' +
          '시스템 환경설정 > 보안 및 개인 정보 보호 > 화면 녹화에서\n' +
          'ScrapFlow(또는 Electron)을 허용해주세요.\n\n' +
          '권한을 허용한 후 앱을 다시 시작하세요.');
      });
      
    } catch (error) {
      console.error('스크린샷 캡처 실패:', error);
      
      // 에러 시 메인 윈도우 복원
      if (this.mainWindow) {
        this.mainWindow.show();
      }
    }
  }


  showCommentWindow(imagePath, sourceUrl = null) {
    try {
      if (this.commentWindow) {
        this.commentWindow.close();
      }

      this.commentWindow = new BrowserWindow({
        width: 500,
        height: 650,
        resizable: false,
        alwaysOnTop: true,
        icon: path.join(__dirname, '../logo.png'),
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js')
        },
        parent: this.mainWindow,
        modal: false,
        show: false
      });

    const commentUrl = isDev
      ? 'http://localhost:3000/#/comment'
      : `file://${path.join(__dirname, '../index.html#/comment')}`;
    
    this.commentWindow.loadURL(commentUrl);
    
    this.commentWindow.once('ready-to-show', () => {
      if (this.commentWindow) {
        this.commentWindow.show();
        this.commentWindow.webContents.send('screenshot-captured', { 
          imagePath, 
          sourceUrl 
        });
      }
    });

      this.commentWindow.on('closed', () => {
        this.commentWindow = null;
      });
    } catch (error) {
      console.error('코멘트 윈도우 생성 실패:', error);
      this.commentWindow = null;
    }
  }

  setupIpcHandlers() {
    ipcMain.handle('get-scraps', async (event, filters = {}) => {
      return await this.database.getScraps(filters);
    });

    ipcMain.handle('save-scrap', async (event, scrapData) => {
      try {
        // OCR 텍스트 추출
        let ocrText = null;
        try {
          ocrText = await this.ocrService.recognizeText(scrapData.image_path);
        } catch (ocrError) {
          console.error('OCR 처리 실패:', ocrError.message);
        }
        
        // OCR 결과와 함께 스크랩 저장
        const scrapWithOcr = { ...scrapData, ocr_text: ocrText };
        const savedScrap = await this.database.saveScrap(scrapWithOcr);
        
        // 메인 윈도우에 스크랩 저장 완료 알림
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('scrap-saved', savedScrap);
        }
        
        return savedScrap;
      } catch (error) {
        console.error('스크랩 저장 실패:', error);
        throw error;
      }
    });

    ipcMain.handle('delete-scrap', async (event, id) => {
      return await this.database.deleteScrap(id);
    });

    ipcMain.handle('get-categories', async () => {
      return await this.database.getCategories();
    });

    ipcMain.handle('save-category', async (event, category) => {
      return await this.database.saveCategory(category);
    });

    ipcMain.handle('close-comment-window', () => {
      if (this.commentWindow) {
        this.commentWindow.close();
      }
    });

    ipcMain.handle('show-main-window', () => {
      if (this.mainWindow) {
        this.mainWindow.show();
        this.mainWindow.focus();
      }
    });

    ipcMain.handle('process-scraps-ocr', async () => {
      return await this.processScrapsOCR();
    });

    ipcMain.handle('get-scraps-without-ocr', async () => {
      return await this.database.getScrapsWithoutOcr();
    });

    ipcMain.handle('export-scrap', async (event, scrapData) => {
      return await this.createShareImage(scrapData);
    });

    ipcMain.handle('show-save-dialog', async (event, options) => {
      const { dialog } = require('electron');
      const result = await dialog.showSaveDialog(this.mainWindow, options);
      return result;
    });

    ipcMain.handle('write-file', async (event, filePath, data) => {
      const fs = require('fs').promises;
      await fs.writeFile(filePath, data);
      return true;
    });

    ipcMain.handle('read-file', async (event, filePath) => {
      const fs = require('fs').promises;
      const data = await fs.readFile(filePath);
      return data;
    });

    ipcMain.handle('show-item-in-folder', async (event, filePath) => {
      shell.showItemInFolder(filePath);
    });

    ipcMain.handle('open-external', async (event, url) => {
      shell.openExternal(url);
    });

    // 디버깅용 핸들러
    ipcMain.handle('debug-database', async () => {
      try {
        const totalCount = this.database.db.prepare('SELECT COUNT(*) as count FROM scraps').get();
        const withComment = this.database.db.prepare('SELECT COUNT(*) as count FROM scraps WHERE comment IS NOT NULL AND comment != ""').get();
        const withOcr = this.database.db.prepare('SELECT COUNT(*) as count FROM scraps WHERE ocr_text IS NOT NULL AND ocr_text != ""').get();
        const recentScraps = this.database.db.prepare('SELECT id, comment, ocr_text, created_at FROM scraps ORDER BY created_at DESC LIMIT 3').all();
        
        return {
          totalCount: totalCount.count,
          withComment: withComment.count,
          withOcr: withOcr.count,
          recentScraps
        };
      } catch (error) {
        console.error('디버그 데이터베이스 조회 실패:', error);
        return { error: error.message };
      }
    });
  }

  async processOCRAsync(scrapId, imagePath) {
    try {
      console.log(`스크랩 ${scrapId}에 대한 OCR 처리 시작...`);
      const ocrText = await this.ocrService.recognizeText(imagePath);
      
      if (ocrText) {
        await this.database.updateScrapOcrText(scrapId, ocrText);
        console.log(`스크랩 ${scrapId} OCR 처리 완료`);
        
        // 메인 윈도우가 열려있으면 업데이트 알림
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('scrap-ocr-updated', { scrapId, ocrText });
        }
      }
    } catch (error) {
      console.error(`스크랩 ${scrapId} OCR 처리 실패:`, error);
    }
  }

  async processScrapsOCR() {
    try {
      const scrapsWithoutOcr = await this.database.getScrapsWithoutOcr();
      console.log(`OCR 처리가 필요한 스크랩 ${scrapsWithoutOcr.length}개 발견`);
      
      let processedCount = 0;
      const totalCount = scrapsWithoutOcr.length;
      
      for (const scrap of scrapsWithoutOcr) {
        try {
          const ocrText = await this.ocrService.recognizeText(scrap.image_path);
          if (ocrText) {
            await this.database.updateScrapOcrText(scrap.id, ocrText);
          }
          processedCount++;
          
          // 진행률을 메인 윈도우에 전송
          if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send('ocr-migration-progress', {
              processed: processedCount,
              total: totalCount,
              current: scrap.id
            });
          }
        } catch (error) {
          console.error(`스크랩 ${scrap.id} OCR 처리 실패:`, error);
          processedCount++;
        }
      }
      
      console.log(`OCR 마이그레이션 완료: ${processedCount}/${totalCount}`);
      return { processed: processedCount, total: totalCount };
    } catch (error) {
      console.error('OCR 마이그레이션 실패:', error);
      throw error;
    }
  }

  async createShareImage(scrapData) {
    try {
      const { format } = require('date-fns');
      const { ko } = require('date-fns/locale');
      
      // 날짜 포맷팅
      const formatDate = (dateString) => {
        try {
          return format(new Date(dateString), 'yyyy.MM.dd HH:mm', { locale: ko });
        } catch (error) {
          return '날짜 오류';
        }
      };
      
      // 카테고리 색상
      const getCategoryColor = (category) => {
        const colorMap = {
          '전체': '#6B7280',
          '개발': '#3B82F6', 
          '디자인': '#F59E0B',
          '비즈니스': '#10B981'
        };
        return colorMap[category] || '#6B7280';
      };
      
      const categoryColor = getCategoryColor(scrapData.category);
      const formattedDate = formatDate(scrapData.created_at);
      const comment = scrapData.comment || '스크랩한 내용입니다';
      const truncatedComment = comment.length > 200 ? comment.substring(0, 197) + '...' : comment;
      
      // 숨겨진 윈도우 생성 (스크린샷 캡처용)
      const shareWindow = new BrowserWindow({
        width: 800,
        height: 1200, // 높이를 늘려서 긴 이미지도 수용
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });
      
      // Base64 이미지 생성
      const imageBuffer = await fs.readFile(scrapData.image_path);
      const base64Image = imageBuffer.toString('base64');
      const imageMimeType = scrapData.image_path.endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      // HTML 템플릿 생성
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: white;
              width: 760px;
              min-height: 100vh;
              display: flex;
              align-items: flex-start;
              justify-content: center;
            }
            .share-card {
              width: 100%;
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border: 1px solid #E5E7EB;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .header {
              background: #F9FAFB;
              padding: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .category-badge {
              background: ${categoryColor};
              color: white;
              padding: 6px 16px;
              border-radius: 14px;
              font-weight: 500;
              font-size: 14px;
            }
            .brand {
              color: #6B7280;
              font-weight: 500;
              font-size: 14px;
            }
            .image-container {
              padding: 20px;
              text-align: center;
            }
            .screenshot {
              max-width: 100%;
              width: auto;
              height: auto;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              display: block;
              margin: 0 auto;
            }
            .content {
              padding: 20px;
              border-top: 1px solid #F3F4F6;
            }
            .comment {
              color: #4B5563;
              font-size: 14px;
              line-height: 1.6;
              margin-bottom: 16px;
              word-wrap: break-word;
              white-space: pre-wrap;
              text-align: left;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: #9CA3AF;
              font-size: 12px;
            }
            .date {
              color: #9CA3AF;
            }
            .by-scrapflow {
              color: #9CA3AF;
            }
            .source-url {
              margin-bottom: 12px;
              padding: 8px 12px;
              background: #EFF6FF;
              border: 1px solid #DBEAFE;
              border-radius: 6px;
              font-size: 11px;
            }
            .url-label {
              color: #1D4ED8;
              font-weight: 500;
              margin-bottom: 4px;
            }
            .url-text {
              color: #1E40AF;
              word-break: break-all;
              line-height: 1.3;
            }
          </style>
        </head>
        <body>
          <div class="share-card">
            <div class="header">
              <div class="category-badge">${scrapData.category}</div>
              <div class="brand">ScrapFlow</div>
            </div>
            <div class="image-container">
              <img class="screenshot" src="data:${imageMimeType};base64,${base64Image}" alt="스크랩 이미지" />
            </div>
            <div class="content">
              <div class="comment">${truncatedComment}</div>
              ${scrapData.source_url ? `
                <div class="source-url">
                  <div class="url-label">🔗 출처:</div>
                  <div class="url-text">${scrapData.source_url}</div>
                </div>
              ` : ''}
              <div class="footer">
                <div class="date">${formattedDate}</div>
                <div class="by-scrapflow">by ScrapFlow</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // HTML 로드
      await shareWindow.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(htmlContent));
      
      // 렌더링 완료 대기 (이미지 로딩 시간 고려)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 스크린샷 캡처
      const screenshot = await shareWindow.webContents.capturePage();
      
      // 임시 파일 저장
      const tempDir = path.join(app.getPath('userData'), 'temp');
      await fs.mkdir(tempDir, { recursive: true });
      
      const shareImagePath = path.join(tempDir, `share_${Date.now()}.png`);
      await fs.writeFile(shareImagePath, screenshot.toPNG());
      
      // 윈도우 정리
      shareWindow.close();
      
      return { success: true, imagePath: shareImagePath };
      
    } catch (error) {
      console.error('공유 이미지 생성 실패:', error);
      throw error;
    }
  }
}

new ScrapFlowApp();