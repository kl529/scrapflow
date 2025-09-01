const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, shell, protocol, screen, desktopCapturer } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const screenshot = require('screenshot-desktop');
const DatabaseManager = require('./database');
const OCRService = require('./ocrService');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

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
    app.whenReady().then(() => {
      this.setupProtocol();
      this.createMainWindow();
      this.setupTray();
      this.registerGlobalShortcuts();
      this.database.init();
      
      // OCR 서비스 초기화 시도
      this.initOCR();
      
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
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
      console.log('OCR 서비스 초기화 완료');
    } catch (error) {
      console.error('OCR 서비스 초기화 실패:', error.message);
    }
  }

  setupProtocol() {
    // 로컬 파일에 접근하기 위한 커스텀 프로토콜 등록
    protocol.registerFileProtocol('scrapflow', (request, callback) => {
      const url = request.url.substr(12); // 'scrapflow://' 제거
      callback({ path: path.normalize(decodeURIComponent(url)) });
    });
  }

  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      },
      show: false
    });

    const startUrl = isDev 
      ? 'http://localhost:3000' 
      : `file://${path.join(__dirname, '../../build/index.html')}`;
    
    this.mainWindow.loadURL(startUrl);

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  setupTray() {
    const iconPath = path.join(__dirname, '../assets/tray-icon.png');
    
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
      console.log('글로벌 단축키 감지됨: CommandOrControl+Shift+S');
      this.takeScreenshot();
    });

    if (!ret) {
      console.error('글로벌 단축키 등록 실패');
    } else {
      console.log('글로벌 단축키 등록 성공: CommandOrControl+Shift+S');
    }

    // 단축키가 등록되었는지 확인
    console.log('등록된 단축키:', globalShortcut.isRegistered('CommandOrControl+Shift+S'));
  }

  async takeScreenshot() {
    try {
      console.log('macOS 네이티브 스크린샷 시작...');
      
      // 현재 활성 윈도우를 기억하고 Electron 앱을 백그라운드로 숨기기
      if (this.mainWindow && this.mainWindow.isVisible()) {
        this.mainWindow.hide();
        console.log('메인 윈도우를 임시로 숨김');
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
        // 메인 윈도우를 다시 보이게 함 (필요한 경우)
        // this.mainWindow가 필요하면 다시 show
        
        if (code === 0) {
          // 성공적으로 캡처되었으면 코멘트 윈도우 표시
          console.log('스크린샷 캡처 성공:', filepath);
          this.showCommentWindow(filepath);
        } else if (code === 1) {
          // 사용자가 ESC로 취소한 경우
          console.log('사용자가 스크린샷 캡처를 취소했습니다.');
          // 취소 시에만 메인 윈도우를 다시 보이게 함
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


  showCommentWindow(imagePath) {
    if (this.commentWindow) {
      this.commentWindow.close();
    }

    this.commentWindow = new BrowserWindow({
      width: 400,
      height: 500,
      resizable: false,
      alwaysOnTop: true,
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
      : `file://${path.join(__dirname, '../../build/index.html#/comment')}`;
    
    this.commentWindow.loadURL(commentUrl);
    
    this.commentWindow.once('ready-to-show', () => {
      this.commentWindow.show();
      this.commentWindow.webContents.send('screenshot-captured', imagePath);
    });

    this.commentWindow.on('closed', () => {
      this.commentWindow = null;
    });
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
}

new ScrapFlowApp();