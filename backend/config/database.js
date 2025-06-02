const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database/vlan_routes.db');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  getDatabase() {
    return this.db;
  }

  async initializeTables() {
    return new Promise((resolve, reject) => {
      const switchesTable = `
        CREATE TABLE IF NOT EXISTS switches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          hostname TEXT NOT NULL UNIQUE,
          ipAddress TEXT NOT NULL UNIQUE,
          model TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const vlansTable = `
        CREATE TABLE IF NOT EXISTS vlans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          vlanId TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const vlanSwitchTable = `
        CREATE TABLE IF NOT EXISTS vlan_switches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          vlan_id INTEGER NOT NULL,
          switch_id INTEGER NOT NULL,
          port TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (vlan_id) REFERENCES vlans (id) ON DELETE CASCADE,
          FOREIGN KEY (switch_id) REFERENCES switches (id) ON DELETE CASCADE,
          UNIQUE(vlan_id, switch_id)
        )
      `;

      const routesTable = `
        CREATE TABLE IF NOT EXISTS routes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          source_switch_id INTEGER NOT NULL,
          destination_switch_id INTEGER NOT NULL,
          vlan_id INTEGER NOT NULL,
          path_data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (source_switch_id) REFERENCES switches (id) ON DELETE CASCADE,
          FOREIGN KEY (destination_switch_id) REFERENCES switches (id) ON DELETE CASCADE,
          FOREIGN KEY (vlan_id) REFERENCES vlans (id) ON DELETE CASCADE
        )
      `;

      this.db.serialize(() => {
        this.db.run(switchesTable);
        this.db.run(vlansTable);
        this.db.run(vlanSwitchTable);
        this.db.run(routesTable, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database tables initialized');
            resolve();
          }
        });
      });
    });
  }
}

module.exports = new Database(); 