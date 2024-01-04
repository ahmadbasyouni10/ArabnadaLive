//imports the Node.js library that will interact with Twitch's service
const tmi = require('tmi.js')

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

//Connects the client to Twitch's IRC servers
client.connect();

//Registering Command Handlers
client.on('connected', whenConnected)
client.on('chat', whenChat)

// List of known commands
let commands = { ping , echo }


//Bot Handlers
function whenConnected (address, port) {
    client.action(twitchChannel, 'Hello, Shroom Bot is now connected.')
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

        //Checks if the first word in user's message matches commands familiar by the bot
        if (cleanCommand in commands) {
            const commandFunction = commands[cleanCommand]
            
            //Calls function that matches the command of user
            commandFunction(client, message, args, user, twitchChannel, self)

            console.log(`* EXECUTED_COMMAND : ${cleanCommand} command for ${user.username}`)
        } else {
            console.log(`* ERROR : Unknown command "${cleanCommand}" from ${user.username}`)
        }
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

