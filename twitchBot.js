//imports the Node.js library that will interact with Twitch's service
const tmi = require('tmi.js')

//functions from the database setup
const { setUpDatabase, addCommand, removeCommand } = require('./databaseSetup');

//My twitch channel
var twitchChannel = "arabnada"

//Prefix for users to access the bot in chat
var prefix = "!"

//object that controls the bot's actions
//connection to twitch's cluster and reconnects if bot disconnects
//Twitch's OAuth token
const options = {
    options: {
        debug: true,
    },
    connection: {
        cluster: 'aws',
        reconnect: true,
    },
    identity: {
        username: 'ArabnadaLive',
        password: 'oauth:oeym3hclzwsrybckabm87o09s0fbdl',
    },
    channels: [twitchChannel],
};

//Initialize the bot's client
const client = new tmi.client(options)

//Starts the twitch bot by connecting to Twitch's IRC server
function startTwitchBot() {
    client.connect();
}

//Exported so can be used in other files 
module.exports.startTwitchBot = startTwitchBot
module.exports.client = client;

//Registering Command Handlers
client.on('connected', whenConnected)
client.on('chat', whenChat)

// List of known commands
let commands = { ping , echo, socials, discord, hello, specs}

//Bot Handlers
function whenConnected (address, port) {
    client.action(twitchChannel, 'Hello, ArabnadaLive is now connected.')
}

function whenChat (twitchChannel, user, message, self) {

    // If message from bot, return
    if (self) return;

    // If message doesn't start with prefix, return
    if(message.substr(0, 1) !== prefix) {

        let sender = user['display-name']

    // If message does start with prefix check commands
    } else {

        //Creates an array with each word in the user's message
        const args = message.slice(prefix.length).trim().split(/ +/g)
        
        //Takes the first word away, lowercases it, and assigns it
        const cleanCommand = args.shift().toLowerCase();

        console.log("Clean Command: ", cleanCommand);

        //Checks if the first word in user's message matches commands familiar by the bot
        if (cleanCommand in commands) {
            const commandFunction = commands[cleanCommand]
            
            //Calls function that matches the command of user
            commandFunction(client, message, args, user, twitchChannel, self)

            console.log(`* EXECUTED_COMMAND : ${cleanCommand} command for ${user.username}`)
        } else if (cleanCommand === "newcommand") {
            newCommand(client, message, args, user, twitchChannel, self);
        } else if (cleanCommand === "deletecommand") {
            deleteCommand(client, message, args, user, twitchChannel, self);
        } else {
            console.log(`* ERROR : Unknown command "${cleanCommand}" from ${user.username}`);
        }
    }
}


// Add Command from chat (using database) 
// Update commands list, adding working function
function newCommand(client, message, args, user, twitchChannel, self) {
    // Checks if the user has the mod attribute
    if (user.username.toLowerCase() === 'arabnada') {
        // Ensures that two words are being provided at least
        if (args.length >= 2) {
            // Takes the first word as the command name
            // Takes the rest of the array args and joins them into a sentence
            const commandName = args[0];
            const responseText = args.slice(1).join('');

            // Calls the database setup function and handles error
            // If the callback is successful, then adds the command using spreading
            // Creates a dynamic function for the command to work as expected (arrow function)
            addCommand(commandName, responseText, user.username, (err) => {
                if (err) {
                    console.error("There was an error trying to add the command: ", err);
                    client.say(twitchChannel, `${user.username} - Error adding command, Try again!`);
                } else {
                    // Create a new object with the new command, which has its working function for later use
                    const newCommands = { [commandName.toLowerCase()]: (client, message, args, user, twitchChannel, self) => {
                        client.say(twitchChannel, `@${user.username} - ${responseText}`);
                    }};

                    // Use spreading to add the newcommand to commands
                    commands = { ...commands, ...newCommands };

                    console.log("Command added successfully!");
                    client.say(twitchChannel, `${user.username} - New command added successfully!`);
                }
            });
            // Guides the user on how to use the addcommand
        } else {
            client.say(twitchChannel, `@${user.username} - To add a new command, use !newCommand (command name) (response text). 
            For example: !newcommand color My favorite color is blue.`);
        }
    }
    // Informs the user that they are not a mod
    else {
        client.say(twitchChannel, `${user.username} - You don't have permission to add a new command!`);
    }
}

//Remove Command from chat (using database) 
//Update commands list, removing wrorking function
function deleteCommand(client, message, args, user, twitchChannel, self) {
    if (user.username.toLowerCase() === 'arabnada') {
        const commandName = args[0];
        
        //handles error if command doesnt exist
        if(!commandName) {
            client.say(twitchChannel, `@${user.username} - Please Provide a command that exists, so you can delete it`)
            return
        }

        //calls removeCommand from databaseSetup, handles error
        //deletes specific command from commands
        //changes it to lower case and removes extra space to avoid error using trim
        removeCommand(commandName.trim(), (err) => {
            if(err) {
                console.error("Error removing the command: ", err);
                client.say(twitchChannel, `@${user.username} - Error trying to remove the command. Try again!`)
            }
            else {
                delete commands[commandName.toLowerCase().trim()];
                console.log("Command successfully removed")

                client.say(twitchChannel, `@${user.username} - Command successfully removed`)
            }
        });
    }
    else {
        client.say(twitchChannel, `${user.username} - You don't have permission to add a new command!`);
    }
      
}



// 1 - Displays the ping of the bot to the server
function ping (client, message, args, user, twitchChannel, self) {
    client.ping().then(data => {
        let ping = Math.floor(Math.round(data*100))
        client.say(twitchChannel, `@${user.username} - My ping is ${ping} ms`)
    }
)}

// 2 - Echoes back the message of the user for fun
function echo(client, message, args, user, twitchChannel, self) {
    // Check if there is a message to echo
    if (args.length > 0) {
        const echoMessage = args.join(' ');
        client.say(twitchChannel, `@${user.username} - You said ${echoMessage}`);
    } else {
        // If no message provided, tell user
        client.say(twitchChannel, `@${user.username} - You need to provide a message for the echo command.`);
    }
}

function socials (client, message, args, user, twitchChannel, self) {
    client.say(twitchChannel, `@${user.username} - Check arabnada on other socials!
    
    1: Twitter https://twitter.com/Arabnadaa
    
    2: Youtube https://www.youtube.com/channel/UCU15T_xRYMsY1t3fELZyu4g
    
    `
    )

}

function discord (client, message, args, user, twitchChannel, self) {
    client.say(twitchChannel, `@${user.username} - Add me on Discord: arabtro`)
}

function hello (client, message, args, user, twitchChannel, self) {
    client.say(twitchChannel, `@${user.username} - HELLOOOO THERE!!!`)
}

function specs (client, message, args, user, twitchChannel, self) {
    client.say(twitchChannel, `@${user.username} - My PC has a RTX 3060 and Ryzen 5 5800x`)
}

function age (client, message, args, user, twitchChannel, self) {
    var year = new Date().getFullYear();
    var age = year - 2004;
    client.say(twitchChannel, `@${user.username} - I am ${age} years old, born in 2004`)
}