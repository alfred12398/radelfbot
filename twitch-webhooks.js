module.exports = (async()=>{
    const twitchWebhooks = require("twitch-webhook");
    const secrets = require("./options")
    const _ =  await require("./utils");
    const radelfbot = await require("./clients/radelfbot-client");
    const discord = await require("./clients/discord-client");
   
    const webhook = new twitchWebhooks({
        client_id: secrets.clientId,
        callback: 'http://www.alfred1203.com:85',
        auth: secrets.identity.bot.bearer,
        secret: secrets.clientSecret,
        listen: {
            port: 85,
            host: '0.0.0.0'
        }
    });
    
    webhook.on('users/follows',async({event})=>{
        var user = event.data[0]['from_name'];
        _.notice('follows', `${user} started following you!`);
        await radelfbot.say('alfred1203', `Thank you @${user} for following`);
        return;
    });

    webhook.on('streams',({event})=>{
        if(event.data[0] == undefined)return;
        _.notice('Stream', "stream went on");
        _.logger('info', "the stream came online");
        var channel = discord.channels.find(ch=>ch.name == "bot");
        channel.send("Alfred1203 went live check his stream at: https://www.twitch.tv/alfred1203").catch(e=>_.logger("error", e));
        radelfbot.islive = true;
        return;
    });

    webhook.subscribe(`users/follows`,{
        first: 1,
        to_id: secrets.streamerId
    }).then(()=>{
        _.logger('info', "subscribed to twitch follows webhooks ");
    }).catch((err)=>{
        _.logger('error', `follows webhook: ${err}`);
    });

    webhook.subscribe(`streams`,{
        user_id: secrets.streamerId,
        
    }).then(()=>{
        _.logger('info', "subscribed to twitch stream webhooks ");
    }).catch((err)=>{
        _.logger('error', `stream webhook: ${err}`);
    })

    webhook.on('unsubscibe', (obj) => {
        twitchWebhook.subscribe(obj['hub.topic'])
      });

      var shutdown = async()=>{
          await webhook.unsubscribe("*");
          _.logger("info", "unsubcribed from all twitch webhooks");
          return;
      }
    return shutdown;
})();
