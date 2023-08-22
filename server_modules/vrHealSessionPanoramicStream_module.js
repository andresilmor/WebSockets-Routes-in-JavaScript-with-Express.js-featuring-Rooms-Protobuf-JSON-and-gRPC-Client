const imports = require ('./../imports')
const { promisify } = require("util");


const express = imports.EXPRESS
const WebSocket = imports.WEBSOCKET
const uuid = imports.UUID
const redis = imports.REDIS 
const short = require('shortid');

const grpc = imports.GRPC
const grpcClient = imports.GRPC_CLIENT
const grpcAddress = imports.GRPC_ADDRESS
var protobuf = imports.PROTOBUF

const MongoClient = imports.MONGO_CLIENT;
const ObjectId = imports.OBJECT_ID;
const GridFSBucket = imports.GRID_FS_BUCKET;

const mongodbUrl = imports.MONGO_URL;
const dbName = "SessionMaterial";

const fs = require('fs');

// --------------------------------------------------------------------------

const connection = function(connection)  {

    
    const channelSuffix = "careXR_"

    const publisher = redis.createClient({
        url: imports.REDIS_URL
    });
    const subscriber = publisher.duplicate();

    console.log("A new client connected on VR Heal Session Panoramic Stream")
    message = {
        state: "yo",
    };

    console.log("AQUI")
    console.log(message)

    //connection.send(JSON.stringify(message))

    let streamChannel = uuid();
    shortId = 0;
    count = 0;
    userId = uuid();

    isValid = false
    
    subscriber.on("subscribe", function(channel, count) {
        console.log("Subscribed")
    });
      
    subscriber.on("message", async function(channel, data) {
        message =  data.toString();
        const jsonMessage = JSON.parse(message)
        console.log(jsonMessage)
        if (jsonMessage["state"] != null) {
             

            switch (jsonMessage["state"]) {

                case "disconnected":
                    connection.close()
                    break;

                case "initialize":
                    if (userId == jsonMessage["applicationUUID"]) 
                        connection.send(JSON.stringify(jsonMessage))
                
                    
                    break;

                case "streaming":
                    console.log("----here")
                    console.log(jsonMessage["streamerUUID"])
                    console.log(userId)
                    if (userId == jsonMessage["streamerUUID"]) {
                        console.log("das")
                        connection.send(JSON.stringify(jsonMessage))
                        console.log("das")
                    }
                    break;

            
            
            } 

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


    // ---------------------------------------------------------------------------------------------------------------------

    connection.on('message', async function incoming(data, isBinary) {
        console.log("Message Received")
        try {
            message = isBinary ? data : data.toString();
            const jsonMessage = JSON.parse(message)
            
            console.log(jsonMessage)
            if (jsonMessage["state"] != null) {
             
                switch (jsonMessage["state"]) {

                    case "initialize":
                        if (jsonMessage.hasOwnProperty("channel")) {
                            connection.close()
                            return
                        
                        }

                        let channel = uuid()

                        //publisher.sadd("vrHeal_sessions", channelSuffix + shortId)

                        publisher.get(channelSuffix + channel, function(err, reply) {
                            // reply is null when the key is missing

                            if (reply == null) {
                                subscriber.subscribe(channelSuffix + channel);

                            }

                            message = {
                                state: "initialize",
                                applicationUUID: userId,
                                streamChannel: channel,
                            };

                            publisher.publish(channelSuffix + channel, JSON.stringify(message));

                            

                        });
                        break;

                    case "streaming":
              
                        break;

                    

                }
                
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

        if (streamChannel != null)
            publisher.publish(channelSuffix + streamChannel, JSON.stringify(message));
    


        subscriber.unsubscribe();
        subscriber.quit();
        publisher.quit();

    })

}

module.exports = { CONNECTION: connection }