(async()=>{
    const tmi = require("tmi.js");
    const _ =  await require("./utils");
    const radelfbot = await require("./clients/radelfbot-client");
    const streamer = await require("./clients/streamer-client");
    const process = require('process');
    const lodash = require('lodash');
    const webhook = await require("./twitch-webhooks");
    const TTcommands = await require("./commands/commands");
    const discordbot = await require("./clients/discord-client");
    const DDcommands = await require("./discord/commands");

    //twitch
    radelfbot.on('connected', async(addr, port)=>{
        _.logger('info',`radelfbot connected to ${addr}:${port}`);
        await radelfbot.say('alfred1203', "Hi everyone, Im finnaly Awake!!").catch((err)=>{_.logger("error", err)});;
        await require("./timers");
        radelfbot.points = await _.readPoints();
        return;
    });

    streamer.on('connected', async(addr,port)=>{
        _.logger('info',`streamer connected to ${addr}:${port}`);

        var body = await _.api('streams?user_id=82579257');
        if(body.data[0] != undefined){
            _.notice('Stream', "stream went on");
            radelfbot.islive = true;
            var channel = discordbot.channel.find(ch => ch.name=='bot');
            await channel.send("Alfred1203 went live check his stream at: https://www.twitch.tv/alfred1203").catch(e=>_.logger("error", e));
            return;
        } else {
            radelfbot.islive = false;
        }

        return;
    });
    
    radelfbot.on('message', (channel, userstate, msg, self)=>{
        if (self) {_.said('radelfbot', msg); return};
        if (channel !== '#alfred1203')return;
        var user = _.username(userstate);
        var user_id = userstate['user-id'];
        _.said(user, msg);
        
        //TTcommands
        var coms = Object.keys(TTcommands);
        var com = msg.split(" ")[0].toLowerCase();
        if(coms.includes(com)){
                TTcommands[com](channel,userstate,msg).catch((e)=>{
                    _.logger('error', `${_.username(userstate)} tried to exuctute: ${com}`);
                    _.logger('error', e);
                });
        }
        var sc = _.SpellCheck(msg);
        if(sc){
            streamer.timeout('alfred1203',user,180,"bad words");
        }
        return;
    });
    
    //discord
    discordbot.on("ready",async()=>{
        _.logger("info", "bot connected to discord");
        var channel = discordbot.channels.find(ch => ch.name == 'bot');
        await channel.send('I have awoken').catch(err=> _.logger("error", err));
        return;
    });

    discordbot.on("message",(message)=>{
        if(message.channel.name != 'bot')return;
        _.discordlog(message.author.username, message.content);
        var com = message.content.split(" ")[0].trim().toLowerCase();
        if(Object.keys(DDcommands).includes(com)){
                DDcommands[com](message).catch((error)=>{
                _.logger("error", `${message.author.username} tried to use ${com}`);
                _.logger("error", error);
            });
        };
        return;
    });

    process.on('SIGINT', async()=>{
        await _.savePoints();
        await webhook();
        await radelfbot.say('alfred1203', 'I\'m am feeling tired!! I\'m going to sleep').catch((err)=>{_.logger("error", err)});;       
        await _.logout();
        process.exit(0);
    });

    return;
})();