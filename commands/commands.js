module.exports= (async()=>{
    const radelfbot = await require("../clients/radelfbot-client");
    const streamer = await require("../clients/streamer-client");
    const _ = await require("../utils");
    const secrets = require("../options");
    const lodash = require('lodash');
    const raids = await require("./raids");

    radelfbot.cmdcd = {
        hello: true,
        commands: true,
        poke: true,
        uptime: true,
        points: true,
        givePoints: true,
        help: true,
        discord: true,
        radelf: true,
        top5: true,
        rank: true,
        rollDice: true,
    }
    
    var hello = async(channel,userstate,msg)=>{
        if(_.clearrance(userstate) != "broadcaster"){
            if(radelfbot.cmdcd.hello == false)return;
            radelfbot.cmdcd.hello= false;
            setTimeout(() => {
                radelfbot.cmdcd.hello= true;
                return;
            }, 45000);
        };
        await radelfbot.say('alfred1203', `Hello ${_.username(userstate)}!! VoHiYo`).catch((err)=>{_.logger('error', err)});
        return;
    };

    var commandslist = async(channel,userstate)=>{
        if(_.clearrance(userstate) != "broadcaster"){
            if(radelfbot.cmdcd.commands == false)return;
            radelfbot.cmdcd.commands= false;
            setTimeout(() => {
                radelfbot.cmdcd.commands= true;
                return;
            }, 15000);
        };
        let commands = lodash.pull(Object.keys(CommandObject),'!test','!raidon').join(",");
        await radelfbot.say('alfred1203', commands).catch(err => _.logger("error", err));
        return;
        };

    var poke = async(channel,userstate, msg)=>{
        if(_.clearrance(userstate) != "broadcaster"){
            if(radelfbot.cmdcd.poke == false) return;
            radelfbot.cmdcd.poke = false;
            setTimeout(() => {
                radelfbot.cmdcd.poke = true;
                return;
            }, 50000);
        };
        var poker = _.username(userstate);
        var pokie = msg.split(" ")[1].replace('@', '') || "alfred1203";
        await radelfbot.say('alfred1203', `${poker} poked ${pokie}!! Keepo Keepo`).catch((err)=>{_.logger('error', err)});
        return;
    };

    var uptime = async(channel, userstate)=>{
        if(_.clearrance(userstate) != "broadcaster"){
            if(radelfbot.cmdcd.uptime == false)return;
            radelfbot.cmdcd.uptime = false;
            setTimeout(() => {
                radelfbot.cmdcd.uptime = true;
                return;
            }, 35000);
        };
        var body = await _.api('streams?user_id=82579257');
        if(body.data[0] == undefined){await radelfbot.say('alfred1203', `The stream is currently offline!! BibleThump BibleThump `).catch((err)=>{_.logger('error', err)});radelfbot.islive = false;}
        else{
            const started = new Date(body.data[0]["started_at"]);
            const now = new Date();
            const since = Math.floor((now - started)/1000);
            const [hours, minutes, seconds] = [
                Math.floor(since / 60 / 60),
                Math.floor(since / 60) % 60,
                Math.floor(since) % 60
            ];

            const duration = [
                hours === 0 ? "" : `${hours} hours `.slice(0,-1-(hours === 1)),
                minutes === 0 ? "" : `${minutes} minutes `.slice(0,-1-(minutes === 1)),
                seconds === 0 ? "" : `${seconds} seconds `.slice(0,-1-(seconds === 1))
            ];

            var time = duration.join(" ").trim();
            await radelfbot.say('alfred1203', `alfred1203 has been streaming for ${time}!! VoHiYo VoHiYo`).catch((err)=>{_.logger('error', err)});
            radelfbot.islive = true;
        };
        return;
    };

    var points = async(channel, userstate, msg)=>{
        if(_.clearrance(userstate) != "broadcaster"){
            if(radelfbot.cmdcd.points == false)return;
            radelfbot.cmdcd.points = false;
            setTimeout(() => {
                radelfbot.cmdcd.points = true;
                return;
            }, 30000);
        };
        var user = _.username(userstate);
        var userId = userstate['user-id'];
        var userOb = lodash.find(radelfbot.points, o=>o.id == userId);
        if(userOb != undefined && userOb.points > 0){
            points = userOb.points;
            await radelfbot.say('alfred1203', `@${user} have ${points} points!!`).catch((err)=>{_.logger('error', err)});
            return;
        } else {
            points = 0;
            await radelfbot.say('alfred1203', `@${user} have ${points} points!! Keep watching the stream and be active in chat to earn more points!`).catch((err)=>{_.logger('error', err)});
            return;
        }
    };

    var givePoints = async(channel,userstate,msg)=>{
        if(_.clearrance(userstate) != "broadcaster"){
            if(radelfbot.cmdcd.givePoints == false)return;
            radelfbot.cmdcd.givePoints = false;
            setTimeout(() => {
                radelfbot.cmdcd.givePoints = true;
                return;
            }, 15000);
        }

        var userid = userstate['user=id'];
        var username = _.username(userstate);
        var targetName = msg.split(' ')[1].trim().replace('@', "");
        var pointsToGive = parseInt(msg.split(' ')[2]) || 10;
        var targetId = await _.getId(targetName);
        var targetIndex = lodash.findIndex(radelfbot.points, e=>e.id == targetId);
        var userIndex = lodash.findIndex(radelfbot.points, e=>e.id == userid);
        if(_.clearrance(userstate) == "broadcaster"){
            if(targetIndex != -1){
                radelfbot.points[targetIndex].points += pointsToGive;
            } else {
                radelfbot.points.push({'id': targetId, 'name': targetName, 'points': pointsToGive});
            }
            await radelfbot.say('alfred1203', `Alfred granted @${targetName} with ${pointsToGive} points free!! PogChamp`).catch((err)=>{_.logger('error', err)});
            return;
        } else if(userIndex == -1 || radelfbot.points[userIndex].points <= pointsToGive){
            await radelfbot.say("alfred1203", `@${username} does not have enough points to give!! BibleThump BibleThump `).catch((err)=>{_.logger('error', err)});
            return;
        } else if(targetIndex != -1){
            radelfbot.points[targetIndex].points += pointsToGive;
            radelfbot.points[userIndex].points -= pointsToGive;
            await radelfbot.say('alfred1203', `@${username} gave @${targetName} ${pointsToGive} of their own points!! SeemsGood  SeemsGood `).catch((err)=>{_.logger('error', err)});
            return;
        } else {
            radelfbot.points[userIndex].points -= pointsToGive;
            radelfbot.points.push({'id': targetId, 'name': targetName, 'points': pointsToGive});
            await radelfbot.say('alfred1203', `@${username} gave @${targetName} ${pointsToGive} of their own points!! SeemsGood  SeemsGood `).catch((err)=>{_.logger('error', err)});
            return;
        }
    };

    var Top5 = async(channel,userstate,msg)=>{
        if(_.clearrance(userstate) != "broadcaster"){
            if(radelfbot.cmdcd.top5 == false)return;
            radelfbot.cmdcd.top5 = false;
            setTimeout(() => {
                radelfbot.cmdcd.top5 = true;
                return;
            }, 45000);
        };
        await _.SortP();
        var user1 = radelfbot.points[0];
        var user2 = radelfbot.points[1];
        var user3 = radelfbot.points[2];
        var user4 = radelfbot.points[3];
        var user5 = radelfbot.points[4];
        var msg = `1.${user1.name}: ${user1.points}, 2.${user2.name}: ${user2.points},` +
            `3.${user3.name}: ${user3.points},4.${user4.name}: ${user4.points}, 5.${user5.name}: ${user5.points}`;
        await radelfbot.say('alfred1203', msg);
        return;
    };

    var help = async(channel,userstate,msg)=>{
        if(_.clearrance(userstate) != "broadcaster"){
            if(radelfbot.cmdcd.help == false)return;
            radelfbot.cmdcd.help = false;
            setTimeout(() => {
                radelfbot.cmdcd.help = true;
                return;
            }, 10000);
        };
        var cmdDiscr = {
            'hello': 'RadElfbot says hi to you! usage: !hello',
            'commands': 'A list of all commands! usage !commands',
            'poke': 'You poke someone or yourself! usage: !poke [target]',
            'uptime': 'Tell you how long Alfred have been streaming! usage: !uptime',
            'points': 'Tells you how much points you have! usage: !points',
            'give': 'Gift a friend some of your points! usage: !give [target] [amount(default:10)]',
            'discord': 'Gives you Alfred\'s discord link usage: !discord',
            'radelfbot': 'A brief discription of ME!! usage: !radelfbot',
            'raidready': 'Join the raid if there\'s a raid going on! usage: !raidready',
            'top5': 'Give you the top points holders! usage: !top5',
            'rolldice': "Roll 2 dices to get a chance to get free points! usage: !rolldice",
        } 
        if(msg.split(' ')[1] == undefined || !Object.keys(cmdDiscr).includes(msg.split(' ')[1].trim().replace('!', '').toLowerCase())){
            await radelfbot.say('alfred1203', "Use !help [command] to get a discription and usage of the commands").catch((err)=>{_.logger('error', err)});
            return;
        } else {
            var cmd = msg.split(' ')[1].trim().replace('!', '').toLowerCase();
            await radelfbot.say('alfred1203', cmdDiscr[cmd]).catch((err)=>{_.logger('error', err)});
            return;
        };

    };

    var discord = async(channel,userstate,msg)=>{
        if(_.clearrance(userstate) != "broadcaster"){
            if(radelfbot.cmdcd.discord == false)return;
            radelfbot.cmdcd.discord = false;
            setTimeout(() => {
                radelfbot.cmdcd.discord = true;
                return;
            }, 30000);
        };
        var str = 'Join discord here: https://discord.gg/BbBZafb';
        await radelfbot.say('alfred1203', str).catch((err)=>{_.logger('error', err)});
        return;
    };
    
    var radelf = async(channel,userstate,msg)=>{
        if(_.clearrance(userstate) != "broadcaster"){
            if(radelfbot.cmdcd.radelf == false)return;
            radelfbot.cmdcd.radelf = false;
            setTimeout(() => {
                radelfbot.cmdcd.radelf = true;
                return;
            }, 30000);
        };
        await radelfbot.say('alfred1203', 'I am a twitch-chat-bot currently being developed by alfred1203! PogChamp Kappa').catch((err)=>{_.logger('error', err)})
        return;
    };

    var raidOn = async(channel,userstate,msg)=>{
        if(_.clearrance(userstate) != "broadcaster")return;
        var targetN = msg.split(" ")[1].trim(); 
        raids(targetN);
    };

    var raidReady = async(channel,userstate,msg)=>{
        if(radelfbot.raid.raiding != true){
            await radelfbot.say('alfred1203', "no raids going on at the moment!").catch(err => _.logger("error", err));
            return;
        }
        var user = _.username(userstate);
        if(!radelfbot.raid.raiders.includes(user)){
            radelfbot.raid.raiders.push(user);
            await radelfbot.whisper(user, "you've been added to the list! When the raid starts type at least once in the target chat to earn rewards!!").catch(err => _.logger("error", err));
        };
        return;
    };

    var rollDice = async(channel,userstate,msg)=>{
        if(_.clearrance(userstate) != "broadcaster"){
            if(radelfbot.cmdcd.rollDice == false)return;
            radelfbot.cmdcd.rollDice = false;
            setTimeout(() => {
                radelfbot.cmdcd.rollDice = true;
                return;
            }, 1000 * 60 *5);
        };
        var randnum = Math.floor((Math.random() * 12));
        var userID = userstate["user-id"];
        var username = _.username(userstate);
        var UI = lodash.findIndex(radelfbot.points, e=> e.id == userID);
        if (UI != -1){
            radelfbot.points[UI].points += randnum;
        } else {
            radelfbot.points.push({"id": userID, "name": username, "points": randnum});
        }
        await radelfbot.say("alfred1203", `${username} rolled a ${randnum} !!`).catch(err => _.logger("error", err));
        return;
    };
    /*
    waiting on personal api key
    var rank = async(channel,userstate,msg)=>{
        if(_.clearrance(userstate) != "broadcaster"){
            if(radelfbot.cmdcd.rank == false)return;
            radelfbot.cmdcd.rank = false;
            setTimeout(() => {
                radelfbot.cmdcd.rank = true;
                return;
            }, 30000);
        };
        var sparkStr = `https://la1.api.riotgames.com/lol/league/v4/entries/by-summoner/${secrets.SparkJesterflas}?api_key=${secrets.LolApiKey}`;
        var alfredStr = `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${secrets.alfred1203}?api_key=${secrets.LolApiKey}`;
        var alfredStats = await _.request(alfredStr);
        var sparkStats = await _.request(sparkStr);
        alfredStats = JSON.parse(alfredStats);
        sparkStats = JSON.parse(sparkStats);
        await radelfbot.say('alfred1203',`alfred1203(NA): ${alfredStats[0]["tier"]} ${alfredStats[0]["rank"]} ${alfredStats[0]['leaguePoints']}lp. Spark Jesterflas(LAN): ${sparkStats[0]["tier"]} ${sparkStats[0]["rank"]} ${sparkStats[0]['leaguePoints']}lp.`);
        return;
    };
    */
    var test = async(channel,userstate)=>{
        var chats = await _.chatters();
        console.log(chats);
        return;
    }; 
    

    var CommandObject = {
        '!hello': hello,
        '!commands': commandslist,
        '!poke': poke,
        '!uptime': uptime,
        '!points': points,
        '!test': test,
        '!give': givePoints,
        '!help': help,
        '!discord': discord,
        '!radelfbot': radelf,
        '!raidready': raidReady,
        '!raidon': raidOn,
        '!top5': Top5,
        '!rolldice': rollDice,
        //'!rank': rank,
    }
    return CommandObject;
})();