const express = require('express')
const app = express()
const server = require('http').createServer(app)

const WebSocket = require('ws')
const wss = new WebSocket.Server( { server: server } )

const parseArgs = require('minimist');
const grpc = require('@grpc/grpc-js');
const grpcClient = require('./grpc_client')

var protobuf = require("protobufjs");

wss.on('connection', (ws) => {
    console.log("A new client connected")

    
    ws.on('message', function incoming(message) {
        
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
        
        console.log(message)
        return
        
        

        const client = new grpcClient.imageInference.ImageInferenceService(
            '2.tcp.eu.ngrok.io:15904',
        
            grpc.credentials.createInsecure()
        );

        var inferenceResult
        var request
        protobuf.load("protobufs/messages/ImageInferenceRequest.proto", function(err, root) {
            request = root.lookupType("imageInferenceRequest.ImageInferenceRequest");
            
            //console.log("So it begins...")

            var decoded = request.decode(new Uint8Array(message));

            client.PacientsAndEmotionsInference({ image: decoded['image'] }, function (err, response) {
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
                        //console.log(JSON.stringify(response))
                        ws.send(JSON.stringify(response))
                        //console.log("----")
                        //console.log("And now it ends")
                        //console.log("----")
                        //console.log("----")
                    

          
                
            });
            
           
        })
        

        
    })

})

app.get('/', (req, res) => res.send('Hello World'))

server.listen(8000, () => console.log("Listening on port 8000"))

