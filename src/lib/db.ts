import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path
const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'downloads.db');

// Ensure the directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new Database(dbPath);

// Initialize database table
db.exec(`
  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    device_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  )
`);

export default db; 