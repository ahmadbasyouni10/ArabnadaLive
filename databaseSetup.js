//initializing sqlite3 (Node.js library), which we need to create database
const sqlite3 = require('sqlite3').verbose();


//connect to the db, create it if doesn't exist
//prints in console if error occurs
const db = new sqlite3.Database('twitch_bot_database.db', (err)=> {
if (err) {
    console.log(err.message);
}
});

//creates table with id being key
//executes the table with SQL by using run, handles error as well
function setUpDatabase () {
    const createTable = `
        CREATE TABLE IF NOT EXISTS custom_commands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            response TEXT NOT NULL
        ) 
    `;
    
    db.run(createTable, (err)=> {
        if (err) {
            console.log(err.message)
        }
    })
}

//addCommand, adds new command in table and parametrized query bc input in SQL
function addCommand(name, response) {
    const sql = "INSERT INTO custom_commands (name, response) VALUES (?, ?)";
    db.run(sql, [name, response]);
} 

//removeCommand, Deletes command from table
function removeCommand(name) {
    const sql = "DELETE FROM custom_commands WHERE name = ?";
    db.run(sql, [name]);
}

// Disconnects from database, when bot is disconnected
process.on('exit', () => {
    db.close();
});

//Exports functions so can be used in twitchBot.js
module.exports = { setUpDatabase, addCommand, removeCommand};