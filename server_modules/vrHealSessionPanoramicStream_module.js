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
    let receiverUUID;
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
        
        if (jsonMessage["state"] != null) {
             

            switch (jsonMessage["state"]) {

                case "disconnected":
                    connection.close()
                    break;

                case "initialize":
                    //if (userId == jsonMessage["applicationUUID"])  {
                        console.log(JSON.stringify(jsonMessage))
                        console.log("|||||||||||||||||||||||||||||||||||||||||||||||||||||||")
            
                    
                    break;

                case "streaming":
                    console.log(jsonMessage)
                    if (userId == jsonMessage["streamerUUID"]) {
                        
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
            
            if (jsonMessage["state"] != null) {
             
                switch (jsonMessage["state"]) {

                    case "initialize":
                    //if (userId == jsonMessage["applicationUUID"])  {
                        console.log(">|||||||||||||||||||||||||||||||||||||||||||||||||||||||")
                        console.log(JSON.stringify(jsonMessage))
                        console.log(">|||||||||||||||||||||||||||||||||||||||||||||||||||||||")
                        streamChannel = jsonMessage["streamChannel"]
                        receiverUUID = jsonMessage["receiverUUID"]

                        message = {
                            state: "initialize",
                            streamerUUID: userId,
                            receiverUUID: receiverUUID,
                            streamChannel: streamChannel
                            
                        };

                        publisher.get(channelSuffix + streamChannel, function(err, reply) {
            

                            publisher.publish(channelSuffix + streamChannel, JSON.stringify(message));

                        
                        });

                        connection.send(JSON.stringify(message))
                        
                    
                    break;

                    case "streaming":
                        if (jsonMessage["state"] != null) {

                            if (jsonMessage["streamerUUID"] == userId) {
                                console.log("STREAMING")
                                console.log(jsonMessage)

                                publisher.get(channelSuffix + jsonMessage["streamChannel"], function(err, reply) {
                                    publisher.publish(channelSuffix + jsonMessage["streamChannel"], JSON.stringify(jsonMessage));
                    
                                });

                            }

                        }
              
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