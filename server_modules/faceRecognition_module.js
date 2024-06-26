const imports = require ('./../imports')

const express = imports.EXPRESS
const parseArgs = imports.PARSE_ARGS
const grpc = imports.GRPC
const grpcClient = imports.GRPC_CLIENT
const grpcAddress = imports.GRPC_ADDRESS
var protobuf = imports.PROTOBUF
const WebSocket = imports.WEBSOCKET
const uuid = imports.UUID

// --------------------------------------------------------------------------

const ml_imgInference_clients = {};

const connection = function(connection)  {
    console.log("A new client connected on Machine Learning (FaceRecognition) on port 9000 (Test 1) ")

    const userId = uuid();
    ml_imgInference_clients[userId] = connection;

    connection.on('message', function incoming(data, isBinary) {
        message = isBinary ? data : data.toString();

        console.log(message.substring(0,30))
        try {
            //console.log(data)
            //message = isBinary ? data : data.toString();
            //const jsonMessage = JSON.parse(message)

            //console.log(jsonMessage)

            //connection.binaryType = 'arraybuffer'
            
            //console.log("Receved: %s", message)
            //console.log("Message received")

            //console.log(message.byteLength)
            /*
            protobuf.load("protobufs/messages/PacientsAndEmotionsInferenceReply.proto", function(err, root) {
                if (err)
                    throw err;
                    
                var reply = root.lookupType("pacientsAndEmotionsInferenceReply.PacientsAndEmotionsInferenceReply");
                
                var payload = { nome : ["dsad", "dsa"] }
                var errMsg = reply.verify(payload)
                if (errMsg)
                    throw Error(errMsg)
        
                var message = reply.create(payload)
                ws.binaryType = 'arraybuffer'
                console.log('2 Message:', message);
                var buf = reply.encode(message).finish()
                console.log("Check: ", typeof(buf))
                var decoded = reply.decode(buf);
                var what =buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length)
                console.log("Check: ", typeof(what))
                ws.send(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length))
                ws.send("test")
                console.log('Test:', decoded);
                console.log("----")
                console.log("----")
                console.log("----")
                console.log("----")

            })

            */
            //ws.binaryType = 'arraybuffer'

            //var base64Data = req.rawBody.replace(/^data:image\/png;base64,/, "");

            require("fs").writeFile("out.png", message, 'base64', function(err) {
              console.log(err);
            });
        
            const client = new grpcClient.imageInference.ImageInferenceService(
                grpcAddress.ADDRESS,
            
                grpc.credentials.createInsecure()
            );

            var inferenceResult
            var request

          
            /*
            protobuf.load("protobufs/messages/ProtoImage.proto", function(err, root) {
                request = root.lookupType("protoImage.ProtoImage");
                
                console.log("So it begins...")

                var decoded = request.decode(new Uint8Array(data));

                fs.writeFile("yo.jpg", decoded['image'], function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("The file was saved!");
                    }
                });*/

                var buf = Buffer.from(message, 'base64'); 

                client.FaceRecognitionWithDetection({ image: buf, collections: ["pacients"], useFastDetection: false }, function (err, response) {
                    try {
                        //console.log('0 Message:', response.detections);
                        //console.log('R Message:', response);
                        //console.log('Response in JSON:', JSON.stringify(response))
                        inferenceResult = response.detections
                        //console.log("----")
                        //console.log(response.detections.length)
                    
                            //console.log(response.detections[0]['emotionsDetected']['continuous'])
                            //console.log(response.detections[0]['emotionsDetected']['categorical'])

                            /*
                            protobuf.load("protobufs/messages/PacientsAndEmotionsInferenceReply.proto", function(err, root) {
                                var reply = root.lookupType("pacientsAndEmotionsInferenceReply.PacientsAndEmotionsInferenceReply");
                                console.log('1 Message:', inferenceResult);
                                var message = reply.create({ detections : [
                                    {
                                        uuid: 'test',
                                        bodyCenter: { x: 894, y: 407 },
                                        faceRect: { x1: 0, y1: 0, x2: 0, y2: 0 },
                                        emotionsDetected: {
                                            categorical: [],
                                            continuous: {
                                                "Valence": 0.0,
                                                "Arousal": 0.0,
                                                "Dominance": 0.0
                                            }
                                        }
                                    }
                                ] })
                                console.log('2 Message:', message);
                                var buf = reply.encode(message).finish()
                                console.log("Check: ", typeof(buf))
                                var decoded = reply.decode(buf);
                                console.log('Mine:', decoded);
                                console.log('Test 0:', decoded.detections[0])
                                console.log("----")
                                ws.send(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length))
                                console.log("----")
                                console.log("And now it ends")
                                console.log("----")
                            })*/
                            /*
                            protobuf.load("protobufs/messages/PacientsAndEmotionsInferenceReply.proto", function(err, root) {
                                var reply = root.lookupType("pacientsAndEmotionsInferenceReply.PacientsAndEmotionsInferenceReply");
                                console.log('1 Message:', inferenceResult);
                                var message = reply.create({ detections : [
                                    {
                                        uuid: 'test',
                                        bodyCenter: { x: 894, y: 407 },
                                        faceRect: { x1: 23, y1: 0, x2: 0, y2: 0 },
                                        emotionsDetected: {
                                            categorical: ["Oidasdasd"],
                                            continuous: {
                                                "Valence": 2.4,
                                                "Arousal": 0.0,
                                                "Dominance": 0.0
                                            }
                                        }
                                    }
                                ] })
                                console.log('2 Message:', message);
                                var buf = reply.encode(message).finish()
                                console.log("Check: ", typeof(buf))
                                var decoded = reply.decode(buf);
                                console.log('Mine:', decoded);
                                console.log('Test 0:', decoded.detections[0])
                                console.log(JSON.stringify(decoded))
                                console.log("----")
                                */
                                console.log(JSON.stringify(response))
                                connection.send(JSON.stringify(response))
                                //console.log("----")
                                //console.log("And now it ends")
                                //console.log("----")
                                //console.log("----")
                        } catch (exception) {
                            console.log("ML Pacients & Emotion Recon Response Exception: " + exception)

                        }
                        

            
                    
                });
                
            
            
        } catch (exception) {
            console.log("ML Pacients & Emotion Recon Exception: " + exception)

        }

        
    })

}

module.exports = { CONNECTION: connection }