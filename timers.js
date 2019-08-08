(async()=>{
    const tmi = require("tmi.js");
    const radelfbot = await require("./clients/radelfbot-client");
    const streamer = await require("./clients/streamer-client");
    const _ = await require("./utils");
    const lodash = require('lodash');
    const discord = require("./clients/discord-client");

    var givePointsInterval = setInterval(givePoints,1000 * 60 *5);
    var sayStuffInterval = setInterval(sayStuff, 1000 * 60 * 10);
    var SavePointsInterval = setInterval(_.savePoints, 1000 * 60 * 10);
    async function givePoints(){
        if (radelfbot.islive== false)return;
        var chatters = await _.chatters();
        await new Promise((res,rej)=>{
            chatters.forEach((e,i,a)=>{
                var ui = lodash.findIndex(radelfbot.points, function(o){return o.id == e.id});
                if(ui != -1){
                    radelfbot.points[ui].points += 3;
                } else {
                    radelfbot.points.push({'id': e.id, 'name': e.name, 'points': 3});
                }
                if(i == a.length -1)res();
            });
        });
        _.logger('info', 'chatters have been given points');
        return;
    };

    async function sayStuff(){
        if (radelfbot.islive== false)return;
        var stuff = [   'Join discord server here: https://discord.gg/BbBZafb',   
                        'Remember to Follow if you like the stream! :D',
                        'Be active in chat to recieve points reward!!',
                        'Remember to drink water!!Stay hydrated!',
                    ]
        var ranNum = Math.floor(Math.random() * stuff.length);
        await radelfbot.say('alfred1203', stuff[ranNum]).catch(err => _.logger("error", err));
        return;
    };
})();