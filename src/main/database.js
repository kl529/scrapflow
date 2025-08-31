const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(app.getPath('userData'), 'scrapflow.db');
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('데이터베이스 연결 실패:', err);
          reject(err);
          return;
        }
        console.log('데이터베이스 연결 성공');
        this.createTables().then(resolve).catch(reject);
      });
    });
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

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(createScrapsTable, (err) => {
          if (err) {
            console.error('scraps 테이블 생성 실패:', err);
            reject(err);
            return;
          }
        });

        this.db.run(createCategoriesTable, (err) => {
          if (err) {
            console.error('categories 테이블 생성 실패:', err);
            reject(err);
            return;
          }
          
          this.initDefaultCategories().then(resolve).catch(reject);
        });
      });
    });
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

    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  async saveScrap(scrapData) {
    const { image_path, comment, category } = scrapData;
    const query = 'INSERT INTO scraps (image_path, comment, category) VALUES (?, ?, ?)';

    return new Promise((resolve, reject) => {
      this.db.run(query, [image_path, comment, category], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        resolve({ id: this.lastID, ...scrapData });
      });
    }).then(result => {
      this.updateCategoryCount(category);
      return result;
    });
  }

  async deleteScrap(id) {
    const getScrapQuery = 'SELECT category FROM scraps WHERE id = ?';
    const deleteQuery = 'DELETE FROM scraps WHERE id = ?';

    return new Promise((resolve, reject) => {
      this.db.get(getScrapQuery, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          reject(new Error('스크랩을 찾을 수 없습니다'));
          return;
        }

        this.db.run(deleteQuery, [id], (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          this.updateCategoryCount(row.category);
          resolve(true);
        });
      });
    });
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

    return new Promise((resolve, reject) => {
      this.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        if (rows.length > 0) {
          rows[0].count = rows.reduce((sum, cat) => 
            cat.name !== '전체' ? sum + cat.count : sum, 0
          );
        }

        resolve(rows);
      });
    });
  }

  async saveCategory(category, updateCount = true) {
    const { name, color } = category;
    const query = 'INSERT OR REPLACE INTO categories (name, color) VALUES (?, ?)';

    return new Promise((resolve, reject) => {
      this.db.run(query, [name, color], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ name, color });
      });
    });
  }

  async updateCategoryCount(categoryName) {
    if (categoryName === '전체') return;
    
    const query = `
      UPDATE categories 
      SET count = (SELECT COUNT(*) FROM scraps WHERE category = ?)
      WHERE name = ?
    `;

    return new Promise((resolve, reject) => {
      this.db.run(query, [categoryName, categoryName], (err) => {
        if (err) {
          console.error('카테고리 카운트 업데이트 실패:', err);
        }
        resolve();
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('데이터베이스 종료 실패:', err);
        } else {
          console.log('데이터베이스 연결 종료');
        }
      });
    }
  }
}

module.exports = Database;