module.exports = (async()=>{
    const radelfbot = await require("../clients/radelfbot-client");
    const streamer = await require("../clients/streamer-client");
    const _ = await require("../utils");
    const tmi = require("tmi.js");
    const lodash = require("lodash");

    radelfbot.raid = {
        raiders: [],
        raided: [],
        raiding: false,
        raidTarget: "",
    };

    var raidingFunc = async function(channel, userstate, msg,self){
        if(channel != `#${radelfbot.raid.raidTarget}`)return;
        var user = _.username(userstate);
        if(radelfbot.raid.raiders.includes(user) && !radelfbot.raid.raided.includes(user)){radelfbot.raid.raided.push(user)};
        return;

    };

    var giveRaidPoints = async function(){
        var raiders = radelfbot.raid.raided;
        var amountRaiders = raiders.length;
        return new Promise((res,rej)=>{
            raiders.forEach(async(e,i,a)=> {
                var userId = await _.getId(e);
                var userIndex = lodash.findIndex(radelfbot.points, o=>o.id == userId);
                if(userIndex != -1){
                    radelfbot.points[userIndex].points += amountRaiders;
                } else {
                    radelfbot.points.push({'id': userId, 'name': e, 'points': amountRaiders});
                }
                if(i == a.length-1){res()};
            });
        });
    };

    var raidOn = async(target)=>{
        radelfbot.raid.raiding = true;
        radelfbot.raid.raidTarget = target;
        await radelfbot.say("alfred1203", `Raid is starting in 5 mins!! Type !raidready to join the raid!! target:${target}`).catch(err => _.logger("error", err));
        setTimeout(async() => {
            await radelfbot.join(target);
            radelfbot.on("message", raidingFunc);
            await radelfbot.say("alfred1203", "raid started!!!").catch(err => _.logger("error", err));
            await radelfbot.say(target, "VoHiYo");
            setTimeout(async()=>{
                await radelfbot.part(target);
                await radelfbot.say("alfred1203", "raidings over!!").catch(err => _.logger("error", err));
                radelfbot.removeListener("message", raidingFunc);
                await giveRaidPoints();
                radelfbot.raid = {
                    raiders: [],
                    raided: [],
                    raiding: false,
                    raidTarget: "",
                };
                return;
            }, 1000*60*6);
            return;
        }, 1000 *60 *5);
        return;
    };

    return raidOn;

})();