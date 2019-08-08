module.exports= (async()=>{
    var chalk = require("chalk");
    const request = require("request");
    const secrets = require("./options");
    const notifier = require("node-notifier");
    const https = require("https");
    const _ = require("lodash");
    const fs = require('fs');
    const radelfbot = await require('./clients/radelfbot-client');
    const streamer = await require("./clients/streamer-client");
    const discord = await require("./clients/discord-client");
    
    var formatDate = (date = new Date())=>{
        var hours = date.getHours();
        var mins  = date.getMinutes();
        var secs = date.getSeconds();

        hours = (hours < 10 ? "0" : "") + hours;
        mins = (mins < 10 ? "0" : "") + mins;
        secs = (secs < 10? "0" : "") + secs;

        return chalk.bgCyan.black(`[${hours}:${mins}:${secs}]`);
    };

    var log = {
        say: (sender, message = '')=>{
                console.log(`${formatDate(new Date())} ${chalk.bgWhite.rgb(64,0,128)("[Twitch]")} ${chalk.blue.bgWhite.bold(sender)}: ${message}`);
            },
        logger: (level, message = '')=>{
                var debug = chalk.rgb(128,128,128)('debug');
                var info = chalk.rgb(0,128,175)('info');
                var warn = chalk.rgb(255,128,0)('warn');
                var error = chalk.red('error');
                var fatal = chalk.rgb(163,73,164)('fatal');

                switch (level) {
                    case 'debug':
                        console.log(`${formatDate(new Date())} ${debug}: ${message}`);
                        break;
                    case 'info':
                        console.log(`${formatDate(new Date())} ${info}: ${message}`); 
                        break; 
                    case 'warn':
                        console.log(`${formatDate(new Date())} ${warn}: ${message}`);
                        break;
                    case 'error':
                        console.log(`${formatDate(new Date())} ${error}: ${message}`);
                        break;
                    case 'fatal':
                        console.log(`${formatDate(new Date())} ${fatal}: ${message}`);
                        break;
                    default:
                        console.log(`${formatDate(new Date())} unknown: ${level}:${message}`);
                        break;
                }
            },
        discord: (sender, msg = '')=>{
            console.log(`${formatDate(new Date())} ${chalk.bgWhite.rgb(0,255,50)("[discord]")} ${chalk.blue.bgWhite.bold(sender)}: ${msg}`);
        }
    };

    var username = (userstate)=>{
        return userstate['display-name'] || userstate['username']
    };
    
    var notify = (topic = '', msg= '')=>{
        notifier.notify({
            title: topic,
            message: msg,
            wait: false,
            sound: true,
        })
    };

    var api = async(target= '')=>{
        var url = 'https://api.twitch.tv/helix/' + target;
        var Options = {
            'Client-ID': secrets.clientId,
            "Authorization": secrets.identity.streamer.bearer
        }
        return new Promise((resolve, rej)=>{
        https.get(url,{'headers': Options},(res)=>{ 
            res.on('data', (body)=>{
                resolve(JSON.parse(body));
            })
        }).on('error', (e)=>{log.logger('error', e);rej(e)});
        });

    };

    var reqst = async(target= '')=>{
        return new Promise((resolve,reject)=>{
            request(target,(err, res, body)=>{
            if(err){log.logger('error', err);reject(err)};
            resolve(body);
            })
        })
        
    }

    var savePoints = async()=>{
        await SortPoint();
        var pointsObj = radelfbot.points;
        var pointsStr = JSON.stringify(pointsObj);
        await new Promise((resolve, reject)=>{
            fs.writeFile('C:/Users/Alfred/Desktop/chatbot1.0/points.txt',pointsStr, (err)=>{
                if(err){log.logger('error', err);reject(err);}
                else{resolve();}

            });
        });
        log.logger('info', 'points saved');
        return;
    };

    var Clearrance = (userstate)=>{
        if(userstate['badges']['broadcaster'] == 1){
            return 'broadcaster';
        }else if(userstate['badges']['moderator'] == 1){
            return 'mod';
        } else {return 'viewer';};
    };

    var Chatters = async()=>{
        var body = await reqst('http://tmi.twitch.tv/group/user/alfred1203/chatters');
        body = JSON.parse(body);
        var allchatters  = _.union(body.chatters.viewers, body.chatters.moderators, body.chatters.broadcaster, body.chatters.vips, body.chatters.staff, body.chatters.admins, body.chatters.global_mods);
        var uri = 'users?';
        await new Promise((res,rej)=>{
            allchatters.forEach((element,index,arr )=> {
                uri += `login=${element}`;
                if(index != arr.length-1){ uri += '&'};
                if(index == arr.length-1){res()};
            });
        });
        var chatsapi = await api(uri);
        var chaties = []
        await new Promise((res,rej)=>{
            chatsapi.data.forEach((e,i,a)=>{
                chaties.push({'name': e.login, 'id': e.id});
                if(i == a.length-1){res()};
            });
        });
        return chaties;
    };

    var SortPoint = async()=>{
        radelfbot.points.sort((a,b)=> {b.points - a.points});
        return;
    };

    var logout = async()=>{
        var channel = discord.channels.find(ch => ch.name == 'bot');
        await channel.send("Im very sleepy!! :tired_face: :tired_face: I'm going to bed now!! :v:");
        await streamer.disconnect().then((data)=>{log.logger('info', `streamer disconnected from ${data}`)});
        await radelfbot.disconnect().then((data)=>{log.logger('info', `radelfbot disconnected from ${data}`)});
        await discord.destroy().then(()=>{log.logger('info', 'discord bot disconnected from discord')});
        return;
    };

    var getId = async(name)=>{
        return new Promise(async(res, rej)=>{
            var user = lodash.find(radelfbot.chatters, o=> o.name == name);
            if(user != undefined){
                res(user.id);
            } else {
                var user = await api(`users?login=${name}`);
                var userId = user.data[0]['id'];
                res(userId);
            };
        });
    };

    var readPoints = async()=>{
        return new Promise((res,rej)=>{
            var fs = require('fs');

            fs.readFile('C:/Users/Alfred/Desktop/chatbot1.0/points.txt', 'utf8',(err, data)=>{
                if(err)rej(err);
                var points = JSON.parse(data);
                log.logger("info", 'points database set!');
                res(points);
            });
        });
    };

    var SpellCheck = (str)=>{
        var badWords = [
            'retarted',
            'nigger'
        ];
        var strar = str.split(' ');
        var testedarr = _.difference(badWords,strar);
        if(testedarr.length != badWords.length){
            return true;
        } else {
            return false;
        };
    };
    var ReturnObject  = {
        'logger': log.logger,
        'said': log.say,
        'username': username,
        'notice': notify,
        'api': api,
        'request': reqst,
        'savePoints': savePoints,
        'clearrance': Clearrance,
        'logout': logout,
        'discordlog': log.discord,
        'chatters': Chatters,
        'SortP': SortPoint,
        'getId': getId,
        'readPoints': readPoints,
        'SpellCheck': SpellCheck,
    };
    return ReturnObject;
})();