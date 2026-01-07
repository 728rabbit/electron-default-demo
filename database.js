const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class sqliteDB {
    constructor() {
        this.db = null;
    }

    init() {
        if (!this.db) {
            const dbPath = path.join(app.getPath('userData'), 'iwebyapp.db');
            this.db = new Database(dbPath);
            console.log('sqlite3 Path: ' + dbPath);

            this.db.function('HK_NOW', () => { return this.currentDateTime(); });

            this.runMigrations();
        }
    }

    currentDateTime() {
        const date = new Date(
            new Date().toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' })
        );
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // 月份 0~11
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    }

    normalizeVersion(version) {
        const [major = 0, minor = 0, patch = 0] = version
            .split('.')
            .map(n => parseInt(n, 10));

        return major * 10000 + minor * 100 + patch;
    }

    runMigrations() {
        const appVersion = app.getVersion();
        const newVersion = this.normalizeVersion(appVersion);
        console.log('App Version:', appVersion, '=>', newVersion);

        const migrations = 
        [
            {
                version: '1.0.0',
                up: (db) => {
                    db.prepare(`
                        CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        created_at TEXT DEFAULT (HK_NOW())
                        )
                    `).run();
                }
            },
            {
                version: '1.0.1',
                up: (db) => {
                    db.prepare(`
                        ALTER TABLE users ADD COLUMN email TEXT
                    `).run();
                }
            }
        ];

        // Version control
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version INTEGER PRIMARY KEY,
                created_at TEXT DEFAULT (HK_NOW())
            )
        `).run();
        const row = this.db.prepare('SELECT MAX(version) AS v FROM schema_migrations').get();
        const currentVersion = row?.v ?? 0;
        for (const m of migrations) {
            const migrationVersion = this.normalizeVersion(m.version);
            if (migrationVersion > currentVersion && migrationVersion <= newVersion) {
                console.log('Running migration:', m.version);
                m.up(this.db);
                this.db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(migrationVersion);
            }
        }
    }
}

module.exports = sqliteDB;