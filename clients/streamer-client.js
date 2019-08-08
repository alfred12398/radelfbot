module.exports= (async()=>{
    const tmi = require("tmi.js");
    const streamer = require("../options").identity.streamer;
    const channel = require("../options").channels;

    const client = new tmi.Client({identity: streamer,channels: channel});
    return client;

})();