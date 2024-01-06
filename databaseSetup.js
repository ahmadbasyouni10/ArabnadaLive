// Initializing SQLite3 (Node.js library), which we need to interact w/ Database
const sqlite3 = require('sqlite3').verbose();


// Connect to the db, create it if doesn't exist
// Prints in console if error occurs
const db = new sqlite3.Database('twitch_bot_database.db', (err)=> {
if (err) {
    console.log(err.message);
}
});

// Creates table with id being key
// Executes the table with SQL by using run, handles error as well
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

// addCommand, adds new command in table
// Uses parametrized query to stop SQL injection, from user input
function addCommand(name, response, username, callback) {
    const sql = "INSERT INTO custom_commands (name, response) VALUES (?, ?)";
    db.run(sql, [name, response], function (err) {
        if (err) {
            console.error("Error adding command to database: ", err)
            if (callback) {
                callback(err);
            }
        }
        else {
            console.log("Command added")
            if (callback) {
                callback(null);
            }
        }
    });
} 

// RemoveCommand, Deletes command from table
function removeCommand(name, callback) {
    const sql = "DELETE FROM custom_commands WHERE name = ?";
    db.run(sql, [name], function (err) {
        if (err) {
            console.error("Error removing command from database: ", err)
            if (callback) {
                callback(err);
            }
        }
        else {
            console.log("Command removed")
            if (callback) {
                callback(null);
            }
        }
    });
}

// Disconnects from database, when bot is disconnected
process.on('exit', () => {
    db.close();
});

//Exports functions so can be used in twitchBot.js
module.exports = { setUpDatabase, addCommand, removeCommand};