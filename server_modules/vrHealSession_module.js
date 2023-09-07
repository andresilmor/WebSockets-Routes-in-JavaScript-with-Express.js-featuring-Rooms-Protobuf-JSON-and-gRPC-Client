const imports = require ('./../imports')
const uuid = imports.UUID
const redis = imports.REDIS 
const short = require('shortid');

var protobuf = imports.PROTOBUF

const MongoClient = imports.MONGO_CLIENT;
const GridFSBucket = imports.GRID_FS_BUCKET;

const jimp = imports.JIMP;

const mongodbUrl = imports.MONGO_URL;
const dbName = "SessionMaterial";


// --------------------------------------------------------------------------

const connection = function(connection)  {

    const channelSuffix = "careXR_"

    const publisher = redis.createClient({
        url: imports.REDIS_URL
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
      
    subscriber.on("message", async function(channel, data) {
        message =  data.toString();
        const jsonMessage = JSON.parse(message)

        if (jsonMessage["state"] != null) {
             

            switch (jsonMessage["state"]) {

                case "disconnected":
                    connection.close()
                    break;

                case "initialize":
                    break;

                case "upgrading":
                    if (userId !== jsonMessage["managerUUID"]) {
                        message = {
                            state: "connected",
                            managerUUID: jsonMessage["managerUUID"],
                            applicationUUID: userId,
                            channel: jsonMessage["secretChannel"],
                        };
                        
                        connection.send(JSON.stringify(message))

                        message = {
                            state: "connecting",
                            managerUUID: jsonMessage["managerUUID"],
                            applicationUUID: userId,
                            channel: jsonMessage["secretChannel"],
                        };

                        sessionChannel = jsonMessage["secretChannel"]

                        subscriber.unsubscribe()

                        subscriber.subscribe(channelSuffix +  sessionChannel);

                        publisher.get(channelSuffix + jsonMessage["secretChannel"], function(err, reply) {
                            publisher.publish(channelSuffix + jsonMessage["secretChannel"], JSON.stringify(message));

                        });   

                    }

                    break;

                case "connecting":

                    if (userId === jsonMessage["managerUUID"]) {
                        message = {
                            state: "connected",
                            managerUUID: jsonMessage["managerUUID"],
                            applicationUUID: jsonMessage["applicationUUID"],
                            channel: jsonMessage["channel"],
                        };
                        
                        sessionChannel = jsonMessage["channel"]
                        
                        connection.send(JSON.stringify(message))

                    }
                    break;

                case "connected":

                    if (!jsonMessage.hasOwnProperty("execute") ) {

                    } else if (jsonMessage.hasOwnProperty("execute")) {
                    
                        const execute = jsonMessage["execute"]
                        
                        switch (execute["operation"]) {
                            case "loadScene":
                                if (execute.hasOwnProperty("params") && execute["responder"] == userId) {
                                    connection.send(JSON.stringify(jsonMessage))

                                } else if (execute.hasOwnProperty("return") && execute["requester"] == userId) {
                                    connection.send(JSON.stringify(jsonMessage))

                                }
                                break

                            case "downloadHotspot":

                                if (userId != jsonMessage["applicationUUID"])
                                    return

                                if (!execute.hasOwnProperty("unblocked")) {
                                    message = {
                                        warning: {
                                            message: "protobuf_incoming",
                                            proto: "ProtoImage",
                                            goal: "hotspotTexture",
                                            to: userId,
                                            blocked: jsonMessage

                                        }

                                    }

                                    connection.send(JSON.stringify(message))

                                } else {

                                    if (userId == jsonMessage["applicationUUID"]) {

                                        const client = new MongoClient(mongodbUrl);

                                        try {
                                            await client.connect();

                                            const db = client.db(dbName);
                                            const collection = db.collection("360_hotspots");
                                            const gridFSBucket = new GridFSBucket(db, { bucketName: "360_images" });

                                            var hotspotUUID = jsonMessage["execute"]["params"]["hotspotUUID"]
                                           
                                            const document = await collection.findOne({ uuid });

                                            if (!document) {
                                                console.log("Document not found for the given UUID.");
                                                return;
                                            }

                                            const imageObjectId = document.imageBytes;

                                            const startTime = Date.now();

                                            const imageChunks = [];
                                            const downloadStream = gridFSBucket.openDownloadStream(imageObjectId);

                                            downloadStream.on("data", (chunk) => {
                                                imageChunks.push(chunk);

                                                if (downloadStream.file) {
                                                    const progress = (downloadStream.bytesReceived / downloadStream.file.length) * 100;
                                                    console.log(progress.toFixed(2) + "%");
                                                }

                                            });

                                            downloadStream.on("error", (error) => {
                                                console.error("Error retrieving image:", error.message);
                                                client.close();
                                            });

                                            downloadStream.on("end", () => {
                                        
                                                const binaryImage = Buffer.concat(imageChunks);
                                                
                                                client.close();
                                                
                                                protobuf.load("protobufs/messages/ProtoImage.proto", function(err, root) {
                                                    const protoImage = root.lookupType("protoImage.ProtoImage"); 
                                                    const protoMessage = protoImage.encode({ image: binaryImage }).finish();

                                                    connection.send(protoMessage)

                                                    jsonMessage["execute"] = {
                                                        requester: jsonMessage["execute"]["requester"],
                                                        responder: jsonMessage["execute"]["responder"],
                                                        operation: jsonMessage["execute"]["operation"],
                                                        params: {
                                                            uuid: document["uuid"],
                                                            label: document["label"],
                                                            imageHeight: document["imageHeight"],
                                                            imageWidth: document["imageWidth"],
                                                            mapping: document["mapping"]

                                                        }

                                                    }

                                                    message = {
                                                        state: jsonMessage["state"],
                                                        managerUUID: jsonMessage["managerUUID"],
                                                        applicationUUID: jsonMessage["applicationUUID"],
                                                        execute: jsonMessage["execute"],
                                                        channel: jsonMessage["channel"],
                                                    };

                                                    connection.send(JSON.stringify(message))

                                                })

                                            });
                                        } catch (error) {
                                            console.error("Error:", error.message);
                                            client.close();
                                        }

                                    }

                                }
                                break;

                            case "endSession":
                                if (execute.hasOwnProperty("params") && execute["responder"] == userId) {
                                    connection.send(JSON.stringify(jsonMessage))

                                } else if (execute.hasOwnProperty("return") && execute["requester"] == userId) {
                                   
                                }
                                break;

                            case "saveExercise":
                                if (execute.hasOwnProperty("params") && execute["responder"] == userId) {
                                    console.log("Save: ")
                                    console.log(jsonMessage)

                                } else if (execute.hasOwnProperty("return") && execute["requester"] == userId) {
                                
                                }
                                break;
                                
                        }
    

                    }


                    break;
            
            
                case "running":
                    if (!jsonMessage.hasOwnProperty("execute")) {
                    

                    } else {
                        const execute = jsonMessage["execute"]
                        switch (execute["operation"]) {
                            case "downloadHotspot":
                                if (execute.hasOwnProperty("params") && execute["requester"] == userId) {
                                  
                                } else if (execute.hasOwnProperty("return") && execute["requester"] == userId) {
                                  
                                    const client = new MongoClient(mongodbUrl);

                                    try {
                                            await client.connect();

                                            const db = client.db(dbName);
                                            const collection = db.collection("360_hotspots");
                                            const gridFSBucket = new GridFSBucket(db, { bucketName: "360_images" });

                                            // Find the document by UUID
                                            imageUUID = jsonMessage["execute"]["return"]["exerciseEnvUUID"]
                                            const document = await collection.findOne({ uuid: imageUUID });

                                            if (!document) {
                                                console.log("Document not found for the given UUID.");
                                                return;
                                            }

                                            const imageObjectId = document.imageBytes;

                                            const startTime = Date.now();

                                            const imageChunks = [];
                                            const downloadStream = gridFSBucket.openDownloadStream(imageObjectId);

                                            downloadStream.on("data", (chunk) => {
                                                imageChunks.push(chunk);

                                                    if (downloadStream.file) {
                                                        const progress = (downloadStream.bytesReceived / downloadStream.file.length) * 100;
                                                        console.log(progress.toFixed(2) + "%");
                                                    }

                                            });

                                            downloadStream.on("error", (error) => {
                                                console.error("Error retrieving image:", error.message);
                                                client.close();
                                            });

                                            downloadStream.on("end", () => {
                                        
                                                const binaryImage = Buffer.concat(imageChunks);
                                                
                                                client.close();
                                                
                                                jimp.read(binaryImage).then((image) => {
                                                    image.resize(1400, jimp.AUTO);

                                                    image.getBase64(image.getMIME(), (err, base64) => {

                                                        jsonMessage["execute"]["return"]["imageHeight"] = document["imageHeight"]
                                                        jsonMessage["execute"]["return"]["imageWidth"] = document["imageWidth"]
                                                        jsonMessage["execute"]["return"]["mapping"] = document["mapping"]     
                                                        
                                                        jsonMessage["execute"]["return"]["imageBase64"] = base64
                                                        
                                                        connection.send(JSON.stringify(jsonMessage))
                                                        
                                                    })
                                                })
                                                .catch((err) => {
                                                    console.log(err)
                                                });

                                                

                                            });
                                        } catch (error) {
                                            console.error("Error:", error.message);
                                            client.close();
                                        }

                                }

                                break;

                            case "startExercise":
                                if (execute.hasOwnProperty("params") && execute["responder"] == userId) {
                                    connection.send(JSON.stringify(jsonMessage))

                                } else if (execute.hasOwnProperty("return") && execute["requester"] == userId) {
                                   

                                }
                                break;

                            case "pauseExercise":
                                    if (execute.hasOwnProperty("params") && execute["responder"] == userId) {
                                        connection.send(JSON.stringify(jsonMessage))
    
                                    } else if (execute.hasOwnProperty("return") && execute["requester"] == userId) {
                                        connection.send(JSON.stringify(jsonMessage))

                                    }
                                    break;

                            case "continueExercise":
                                    if (execute.hasOwnProperty("params") && execute["responder"] == userId) {
                                        connection.send(JSON.stringify(jsonMessage))
    
                                    } else if (execute.hasOwnProperty("return") && execute["requester"] == userId) {
                                        connection.send(JSON.stringify(jsonMessage))
                                       
                                    }
                                    break;

                            case "restartExercise":
                                    if (execute.hasOwnProperty("params") && execute["responder"] == userId) {
                                        connection.send(JSON.stringify(jsonMessage))
    
                                    } else if (execute.hasOwnProperty("return") && execute["requester"] == userId) {
                                        connection.send(JSON.stringify(jsonMessage))
                                       
                                    }
                                    break;

                            case "stopExercise":
                                    if (execute.hasOwnProperty("params") && execute["responder"] == userId) {
                                        connection.send(JSON.stringify(jsonMessage))
    
                                    } else if (execute.hasOwnProperty("return") && execute["requester"] == userId) {
                                        connection.send(JSON.stringify(jsonMessage))
                                       
                                    }
                                    break;

                        }
                        

                    }
                
                    break;
                
            } 

        } else if (jsonMessage["warning"] != null) {

            


        }
            
    });

    // ---------------------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------------------
    //          PUB/SUB LOGIC ABOVE     |     WS LOGIC DOWN    
    // ---------------------------------------------------------------------------------------------------------------------
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
        try {
            message = isBinary ? data : data.toString();
            const jsonMessage = JSON.parse(message)
            
            if (jsonMessage["state"] != null) {
             
                switch (jsonMessage["state"]) {

                    case "initialize":
                        if (jsonMessage.hasOwnProperty("channel")) {
                            connection.close()
                            return
                        
                        }

                        await GenerateShortID();

                        console.log("1 - " + shortId)

                        publisher.get(channelSuffix + shortId, function(err, reply) {
                            // reply is null when the key is missing

                            message = {
                                state: "initialize",
                                applicationUUID: userId,
                                channel: shortId,
                            };

                            publisher.publish(channelSuffix + message["channel"], JSON.stringify(message));

                            connection.send(JSON.stringify(message))

                            if (reply == null) {
                                subscriber.subscribe(channelSuffix + shortId);

                            }

                        });
                        break;
            
                    case "connecting":

                        if (jsonMessage["channel"] != shortId) {

                            subscriber.unsubscribe()
                            
                            sessionChannel = uuid();

                            message = {
                                state: "upgrading",
                                managerUUID: userId,
                                channel: jsonMessage["channel"],
                                secretChannel: sessionChannel,
                            };

                            publisher.get(channelSuffix + jsonMessage["channel"], function(err, reply) {
                                publisher.publish(channelSuffix + jsonMessage["channel"], JSON.stringify(message));

                            });    

                            publisher.get(channelSuffix + jsonMessage["channel"], function(err, reply) {
                                subscriber.subscribe(channelSuffix +  sessionChannel);

                            });  

                        }
                        
                        break;


                    case "connected":
                        message = {
                            state: "connected",
                            managerUUID: jsonMessage["managerUUID"],
                            applicationUUID: jsonMessage["applicationUUID"],
                            execute: jsonMessage["execute"],
                            channel: jsonMessage["channel"],

                        };

                        publisher.get(channelSuffix + jsonMessage["channel"], function(err, reply) {
                            publisher.publish(channelSuffix + jsonMessage["channel"], JSON.stringify(message));

                        });    
                
                        break;

                    case "running":
                        publisher.get(channelSuffix + jsonMessage["channel"], function(err, reply) {
                            publisher.publish(channelSuffix + jsonMessage["channel"], JSON.stringify(jsonMessage));

                        });    

                        break;

                    

                }
                
            } else if (jsonMessage["warning"] != null) {
                switch (jsonMessage["warning"]["message"]) {
                    
                    case "protobuf_incoming":

                        if (userId == jsonMessage["warning"]["to"]) {
                         
                            switch (jsonMessage["warning"]["message"]) {
                                case "protobuf_incoming":
                                    if (jsonMessage["warning"]["response"] != true )
                                        return

                                    var execute = jsonMessage["warning"]["blocked"]["execute"]
            
                                    execute["unblocked"] = true
                                    jsonMessage["warning"]["blocked"]["execute"] = execute
                            
                                    publisher.publish(channelSuffix + jsonMessage["warning"]["blocked"]["channel"], JSON.stringify(jsonMessage["warning"]["blocked"]));
                                    
                                    break
            
                            }
            
                        }

                        break

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