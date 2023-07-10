const imports = require ('./../imports')
const { promisify } = require("util");


const express = imports.EXPRESS
const WebSocket = imports.WEBSOCKET
const uuid = imports.UUID
const redis = imports.REDIS 
const short = require('shortid');

// --------------------------------------------------------------------------

const connection = function(connection)  {
    const channelSuffix = "careXR_"

    const publisher = redis.createClient({
        url: 'redis://default:EGGjURloNvz8K6fpudILQdYQWbEV8zhm@redis-19874.c233.eu-west-1-1.ec2.cloud.redislabs.com:19874'
    });
    const subscriber = publisher.duplicate();

    console.log("A new client connected on VR Heal Session on port 9030")

    let channel;
    const userId = uuid();
    
    subscriber.on("subscribe", function(channel, count) {
        console.log("Subscribed")
    });
      
    subscriber.on("message", function(channel, data) {
        message =  data.toString();
        const jsonMessage = JSON.parse(message)

        if (jsonMessage["state"] == null)
                return
                

        switch (jsonMessage["state"]) {

            case "initialize":
                if (userId == jsonMessage["applicationUUID"])
                    //publisher.srem("activeChannels", jsonMessage["channel"])
                    connection.send(JSON.stringify(jsonMessage))
                   
        

        }
            
    });

    shortId = 0

    async function GenerateShortID() {
        shortId = short()
        await publisher.sismember('vrHeal_sessions', shortId, async function(err, reply) {
            if (err) throw err;
            if (reply == 0)
                return 
            await GenerateShortID()
          });

          return shortId

      }

    connection.on('message', async function incoming(data, isBinary) {
        console.log(data.toString())
        try {
            message = isBinary ? data : data.toString();
            const jsonMessage = JSON.parse(message)

            if (jsonMessage["state"] == null)
                return
                

            switch (jsonMessage["state"]) {

                case "initialize":
                
                    await GenerateShortID();
                    publisher.sadd("vrHeal_sessions", shortId)

                    publisher.get(channelSuffix + shortId, function(err, reply) {
                        // reply is null when the key is missing

                        if (reply == null) {
                            subscriber.subscribe(channelSuffix + shortId);

                        }

                        message = {
                            state: jsonMessage["state"].toString(),
                            applicationUUID: userId,
                            channel: shortId,
                          };

                        publisher.publish(channelSuffix + shortId, JSON.stringify(message));

                        

                    });
        
                case "connecting":

            }

            /*
            redisClient.set("key", "test2");
            redisClient.get("key", function(err, reply) {
                // reply is null when the key is missing
                console.log(reply);
              });


              subscriber.unsubscribe();
                        subscriber.quit();
                        publisher.quit();
              */
   

        } catch (exception) {
            console.log("QRCode Auth Exception: " + exception)

        }
    
    })

    connection.on('close', () => {
        subscriber.unsubscribe();
        subscriber.quit();
        publisher.quit();

    })

}

module.exports = { CONNECTION: connection }