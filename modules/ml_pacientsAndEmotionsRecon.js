const imports = require ('./../imports')

const express = imports.EXPRESS
const parseArgs = imports.PARSE_ARGS
const grpc = imports.GRPC
var protobuf = imports.PROTOBUF
const WebSocket = imports.WEBSOCKET
const grpcClient = imports.GRPC_CLIENT
const grpcAddress = imports.GRPC_ADDRESS
const uuid = imports.UUID

// --------------------------------------------------------------------------

const ml_imgInference_clients = {};

const ml_imgInference_app = express()
const ml_imgInference_server = require('http').createServer(ml_imgInference_app)

const ml_imgInference_wss = new WebSocket.Server( { server: ml_imgInference_server } )

ml_imgInference_wss.on('connection', (connection) => {
    console.log("A new client connected on Machine Learning (Image inference) on port 9000 ")

    const userId = uuid();
    ml_imgInference_clients[userId] = connection;

    connection.on('message', function incoming(data) {
        try {
            //ws.binaryType = 'arraybuffer'
            
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

        
        
            const client = new grpcClient.imageInference.ImageInferenceService(
                grpcAddress.ADDRESS,
            
                grpc.credentials.createInsecure()
            );

            var inferenceResult
            var request
            protobuf.load("protobufs/messages/ImageInferenceRequest.proto", function(err, root) {
                request = root.lookupType("imageInferenceRequest.ImageInferenceRequest");
                
                //console.log("So it begins...")

                var decoded = request.decode(new Uint8Array(data));

                client.PacientsAndEmotionsInference({ image: decoded['image'] }, function (err, response) {
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
                
            
            })
        } catch (exception) {
            console.log("ML Pacients & Emotion Recon Exception: " + exception)

        }

        
    })

})

module.exports = { SERVER: ml_imgInference_server }