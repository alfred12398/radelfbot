(async()=>{
    const tmi = require("tmi.js");
    const radelfbot = await require("./clients/radelfbot-client");
    const streamer = await require("./clients/streamer-client");
    const discordbot = await require('./clients/discord-client');
    const secrets = require('./options');
    
    await require("./listening");
    
    await discordbot.login(secrets.identity.discord.token);        
    await radelfbot.connect();
    await streamer.connect();

    
})();