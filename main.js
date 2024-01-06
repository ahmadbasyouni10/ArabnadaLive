//imports the setUpDatBase and startTwitchbot function w/ destructuring
const { setUpDatabase } = require('./databaseSetup');
const { startTwitchBot } = require('./twitchBot');

//call the functions
setUpDatabase();
startTwitchBot();