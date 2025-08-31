const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = path.join(app.getPath('userData'), 'scrapflow.db');
  }

  async init() {
    try {
      this.db = new Database(this.dbPath);
      console.log('데이터베이스 연결 성공');
      await this.createTables();
      return Promise.resolve();
    } catch (err) {
      console.error('데이터베이스 연결 실패:', err);
      return Promise.reject(err);
    }
  }

  async createTables() {
    const createScrapsTable = `
      CREATE TABLE IF NOT EXISTS scraps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_path TEXT NOT NULL,
        comment TEXT,
        category TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createCategoriesTable = `
      CREATE TABLE IF NOT EXISTS categories (
        name TEXT PRIMARY KEY,
        color TEXT NOT NULL,
        count INTEGER DEFAULT 0
      )
    `;

    try {
      this.db.exec(createScrapsTable);
      this.db.exec(createCategoriesTable);
      await this.initDefaultCategories();
    } catch (err) {
      console.error('테이블 생성 실패:', err);
      throw err;
    }
  }

  async initDefaultCategories() {
    const defaultCategories = [
      { name: '전체', color: '#6B7280' },
      { name: '개발', color: '#3B82F6' },
      { name: '디자인', color: '#F59E0B' },
      { name: '비즈니스', color: '#10B981' }
    ];

    const promises = defaultCategories.map(category => 
      this.saveCategory(category, false)
    );

    await Promise.all(promises);
  }

  async getScraps(filters = {}) {
    const { category, dateFilter } = filters;
    let query = 'SELECT * FROM scraps';
    const params = [];

    const conditions = [];
    
    if (category && category !== '전체') {
      conditions.push('category = ?');
      params.push(category);
    }

    if (dateFilter) {
      const now = new Date();
      let startDate;
      
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        conditions.push('created_at >= ?');
        params.push(startDate.toISOString());
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    try {
      const stmt = this.db.prepare(query);
      return stmt.all(params);
    } catch (err) {
      throw err;
    }
  }

  async saveScrap(scrapData) {
    const { image_path, comment, category } = scrapData;
    const query = 'INSERT INTO scraps (image_path, comment, category) VALUES (?, ?, ?)';

    try {
      const stmt = this.db.prepare(query);
      const result = stmt.run([image_path, comment, category]);
      const returnData = { id: result.lastInsertRowid, ...scrapData };
      await this.updateCategoryCount(category);
      return returnData;
    } catch (err) {
      throw err;
    }
  }

  async deleteScrap(id) {
    const getScrapQuery = 'SELECT category FROM scraps WHERE id = ?';
    const deleteQuery = 'DELETE FROM scraps WHERE id = ?';

    try {
      const getStmt = this.db.prepare(getScrapQuery);
      const row = getStmt.get([id]);

      if (!row) {
        throw new Error('스크랩을 찾을 수 없습니다');
      }

      const deleteStmt = this.db.prepare(deleteQuery);
      deleteStmt.run([id]);
      
      await this.updateCategoryCount(row.category);
      return true;
    } catch (err) {
      throw err;
    }
  }

  async getCategories() {
    const query = `
      SELECT 
        c.name,
        c.color,
        COALESCE(COUNT(s.id), 0) as count
      FROM categories c
      LEFT JOIN scraps s ON c.name = s.category
      GROUP BY c.name, c.color
      ORDER BY 
        CASE WHEN c.name = '전체' THEN 0 ELSE 1 END,
        c.name
    `;

    try {
      const stmt = this.db.prepare(query);
      const rows = stmt.all();

      if (rows.length > 0) {
        rows[0].count = rows.reduce((sum, cat) => 
          cat.name !== '전체' ? sum + cat.count : sum, 0
        );
      }

      return rows;
    } catch (err) {
      throw err;
    }
  }

  async saveCategory(category, updateCount = true) {
    const { name, color } = category;
    const query = 'INSERT OR REPLACE INTO categories (name, color) VALUES (?, ?)';

    try {
      const stmt = this.db.prepare(query);
      stmt.run([name, color]);
      return { name, color };
    } catch (err) {
      throw err;
    }
  }

  async updateCategoryCount(categoryName) {
    if (categoryName === '전체') return;
    
    const query = `
      UPDATE categories 
      SET count = (SELECT COUNT(*) FROM scraps WHERE category = ?)
      WHERE name = ?
    `;

    try {
      const stmt = this.db.prepare(query);
      stmt.run([categoryName, categoryName]);
    } catch (err) {
      console.error('카테고리 카운트 업데이트 실패:', err);
    }
  }

  close() {
    if (this.db) {
      try {
        this.db.close();
        console.log('데이터베이스 연결 종료');
      } catch (err) {
        console.error('데이터베이스 종료 실패:', err);
      }
    }
  }
}

module.exports = DatabaseManager;