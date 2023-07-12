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

    console.log("A new client connected on VR Heal Session")

    let sessionChannel = null;
    shortId = 0;
    count = 0;
    const userId = uuid();

    isValid = false
    
    subscriber.on("subscribe", function(channel, count) {
        console.log("Subscribed")
    });
      
    subscriber.on("message", function(channel, data) {
        message =  data.toString();
        const jsonMessage = JSON.parse(message)

        if (jsonMessage["state"] == null)
                return
                

        switch (jsonMessage["state"]) {

            case "disconnected":
                connection.close()
                break;

            case "initialize":
                if (userId == jsonMessage["applicationUUID"])
                    connection.send(JSON.stringify(jsonMessage))
                   
                break;

            case "connecting":

                if (!jsonMessage.hasOwnProperty("applicationUUID") && userId != jsonMessage["managerUUID"]) {
                  
                    sessionChannel = uuid();

                    message = {
                        state: "connecting",
                        managerUUID: jsonMessage["managerUUID"],
                        applicationUUID: userId,
                        channel: jsonMessage["channel"],
                        secretChannel: sessionChannel,
                      };

                    publisher.publish(channelSuffix + jsonMessage["channel"], JSON.stringify(message));

                    return

                }
                
                if (jsonMessage.hasOwnProperty("applicationUUID")) {
                    subscriber.unsubscribe();

                    sessionChannel = jsonMessage["secretChannel"]

                    publisher.get(channelSuffix + jsonMessage["secretChannel"], function(err, reply) {
           
                        if (reply == null) {
                            subscriber.subscribe(channelSuffix + jsonMessage["secretChannel"]);

                        }

                        message = {
                            state: "connected",
                            managerUUID: jsonMessage["managerUUID"],
                            applicationUUID: jsonMessage["applicationUUID"],
                            channel: jsonMessage["secretChannel"],
                          };
                        
                        publisher.publish(channelSuffix + jsonMessage["secretChannel"], JSON.stringify(message));
          
                       
                    });

                    return

                }
                
                break;

            case "connected":
                if (!jsonMessage.hasOwnProperty("execute")) {
                    if (userId == jsonMessage["managerUUID"]) {
                        if (count == 0) {
                            console.log(WhoAmI(jsonMessage) + " is Connected")
                            //console.log(jsonMessage)
                            connection.send(JSON.stringify(jsonMessage))
                            /*
                            {
                            state: 'connected',
                            managerUUID: '68a7f4fd-27f9-4a89-a016-216c5036e325',
                            applicationUUID: '8134fc33-bdaf-4eba-a96b-2880bf5fa698',
                            channel: '87ee6209-40c6-4f0b-a549-4968559a3997'
                            }

                            */
                            count += 1

                        }

                    } else if (userId == jsonMessage["applicationUUID"]) {
                        console.log(WhoAmI(jsonMessage) + " is Connected")
                        //console.log(jsonMessage)
                         /*
                            {
                            state: 'connected',
                            managerUUID: '68a7f4fd-27f9-4a89-a016-216c5036e325',
                            applicationUUID: '8134fc33-bdaf-4eba-a96b-2880bf5fa698',
                            channel: '87ee6209-40c6-4f0b-a549-4968559a3997'
                            }

                            */
                        connection.send(JSON.stringify(jsonMessage))

                    }

                } else {
                 
                    const execute = jsonMessage["execute"]

                    if (execute.hasOwnProperty("params") && execute["responder"] == userId) {
                        console.log("Execute on " + WhoAmI(jsonMessage))
                  
                        connection.send(JSON.stringify(jsonMessage))

                    } else if (execute.hasOwnProperty("return") && execute["requester"] == userId) {
                        console.log("Sending Return to " + WhoAmI(jsonMessage))
                        console.log(jsonMessage)
                        connection.send(JSON.stringify(jsonMessage))

                    }
  

                }


                break;
        
        
        }
            
    });


    // ---------------------------------------------------------------------------------------------------------------------


    async function GenerateShortID() {
        shortId = short()
        await publisher.sismember('vrHeal_sessions', channelSuffix +  shortId, async function(err, reply) {
            if (err) throw err;
            if (reply == 0)
                return 
            await GenerateShortID()
          });

          return shortId

      }

     function WhoAmI(uuid) {
        if (uuid["applicationUUID"] == userId)
            return "Application "
        if (uuid["managerUUID"] == userId)
            return "Manager "

        return "Man... "
      }

    connection.on('message', async function incoming(data, isBinary) {
        try {
            message = isBinary ? data : data.toString();
            const jsonMessage = JSON.parse(message)
            
            console.log(jsonMessage)
            if (jsonMessage["state"] == null)
                return
                

            switch (jsonMessage["state"]) {

                case "initialize":
                    if (jsonMessage.hasOwnProperty("channel")) {
                        connection.close()
                        return
                    
                    }

                    await GenerateShortID();


                    //publisher.sadd("vrHeal_sessions", channelSuffix + shortId)

                    publisher.get(channelSuffix + shortId, function(err, reply) {
                        // reply is null when the key is missing

                        if (reply == null) {
                            subscriber.subscribe(channelSuffix + shortId);

                        }

                        message = {
                            state: "initialize",
                            applicationUUID: userId,
                            channel: shortId,
                          };

                        publisher.publish(channelSuffix + shortId, JSON.stringify(message));

                        

                    });
                    break;
        
                case "connecting":

                    subscriber.unsubscribe();
                    subscriber.subscribe(channelSuffix +  jsonMessage["channel"]);

                    message = {
                        state: "connecting",
                        managerUUID: userId,
                        channel: jsonMessage["channel"],
                    };

                    publisher.publish(channelSuffix + jsonMessage["channel"], JSON.stringify(message));

                    
                    break;


                case "connected":
                    message = {
                        state: "connected",
                        managerUUID: jsonMessage["managerUUID"],
                        applicationUUID: jsonMessage["applicationUUID"],
                        execute: jsonMessage["execute"],
                        channel: jsonMessage["channel"],
                    };

                    publisher.publish(channelSuffix + jsonMessage["channel"], JSON.stringify(message));
              
                    break;
                

            }


        } catch (exception) {
            console.log(jsonMessage)
            console.log("QRCode Auth Exception: " + exception)

        }
    
    })

    connection.on('close', () => {
        console.log("Disconnecting")

        message = {
            state: "disconnected"
        };

        if (sessionChannel != null)
            publisher.publish(channelSuffix + sessionChannel, JSON.stringify(message));
        else 
            publisher.publish(channelSuffix + shortId, JSON.stringify(message));


        subscriber.unsubscribe();
        subscriber.quit();
        publisher.quit();

    })

}

module.exports = { CONNECTION: connection }