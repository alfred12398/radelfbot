module.exports = (async()=>{
    const discordbot = await require("../clients/discord-client");
    const radelfbot = await require("../clients/radelfbot-client");
    const _ = await require("../utils");
    const lodash = require("lodash");

    var channel = discordbot.channels.find(ch => ch.name == 'bot');
    discordbot.hello = true;
    discordbot.commands = true;
    discordbot.twitch = true;
    var hello = async(msg)=>{
        if(discordbot.hello == false)return;
        discordbot.hello= false;
        setTimeout(() => {
            discordbot.hello= true;
            return;
        }, 45000);
        var user = msg.author.username;
        await msg.reply(`Hello ${user}!! :v:`).catch((err)=>{_.logger('error', err)});
        return;
    };

    var commandslist = async(msg)=>{
        if(discordbot.commands == false)return;
        discordbot.commands = false;
        setTimeout(() => {
            discordbot.commands= true;
            return;
        }, 15000);
        let commands = lodash.pull(Object.keys(CommandObject),'!test').join(",");
        await msg.reply(commands).catch((err)=>{_.logger('error', err)});
        return;
        };

    var test = async(msg)=>{

    };

    var twitch = async(msg)=>{
        if(discordbot.twitch == false)return;
        discordbot.twitch = false;
        setTimeout(() => {
            discordbot.twitch= true;
            return;
        }, 15000);
        await msg.reply("check out alfred1203 twitch channel at: https://www.twitch.tv/alfred1203").catch((err)=>{_.logger('error', err)});
        return;
    }

    var CommandObject = {
        "!hello": hello,
        "!commands": commandslist,
        "!test": test,
        "!twitch": twitch,
    };
    return CommandObject;
})();