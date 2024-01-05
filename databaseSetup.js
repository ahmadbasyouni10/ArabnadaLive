//initializing sqlite3 (Node.js library), which we need to create database
const sqlite3 = requite('sqlite3').verbose();
let sq

//connect to the db, create it if doesn't exist
const db = new sqlite3.Database('twitch_bot_database.db');

function setUpDatabase () {
    const createTable = `
        CREATE TABLE IF NOT EXISTS custom_commands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            response TEXT NOT NULL,
            added_by TEXT NOT NULL,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) 
        `;
    
    db.run(createTableSql)
}