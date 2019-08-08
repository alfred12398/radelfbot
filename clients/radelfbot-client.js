module.exports= (async()=>{
    const tmi = require("tmi.js");
    const radelfbot = require("../options").identity.bot;
    const channel = require("../options").channels;

    const client = new tmi.Client({identity: radelfbot,channels: channel});
    return client;

})();