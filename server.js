const express = require('express')

const parseArgs = require('minimist');
const grpc = require('@grpc/grpc-js');
var protobuf = require("protobufjs");
const WebSocket = require('ws')
const grpcClient = require('./grpc_client')
const { v4: uuid } = require('uuid');



// ---------------------------------------------------------------------------------------------------------------------------------------
//                                                     Machine Learning (Frame Inference)
// ---------------------------------------------------------------------------------------------------------------------------------------

const ml_imgInference_clients = {};

const ml_imgInference_app = express()
const ml_imgInference_server = require('http').createServer(ml_imgInference_app)

const ml_imgInference_wss = new WebSocket.Server( { server: ml_imgInference_server } )

ml_imgInference_wss.on('connection', (connection) => {
    console.log("A new client connected on Machine Learning (Image inference) on port 9000 ")

    const userId = uuid();
    ml_imgInference_clients[userId] = connection;

    connection.on('message', function incoming(data) {
        
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

        console.log(data)
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

            var decoded = request.decode(new Uint8Array(data));

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
                        connection.send(JSON.stringify(response))
                        //console.log("----")
                        //console.log("And now it ends")
                        //console.log("----")
                        //console.log("----")
                    

          
                
            });
            
           
        })
        

        
    })

})

ml_imgInference_server.listen(9000, () => console.log("Machine Learning (Image inference) on port 9000"))


// ---------------------------------------------------------------------------------------------------------------------------------------
//                                                     QRCode Authentication
// ---------------------------------------------------------------------------------------------------------------------------------------


const qrCodeAuth_clients = {};

const qrCodeAuth_app = express()
const qrCodeAuth_server = require('http').createServer(qrCodeAuth_app)

const qrCodeAuth_wss = new WebSocket.Server( { server: qrCodeAuth_server } )

qrCodeAuth_wss.on('connection', (connection) => {
    console.log("A new client connected on QRCode Authentication on port 9010")

    const userId = uuid();
    qrCodeAuth_clients[userId] = connection;
    console.log(userId)
    let channel;

    connection.on('message', function incoming(data, isBinary) {
        const message = isBinary ? data : data.toString();
        const jsonMessage = JSON.parse(message)
        
        if (jsonMessage["channel"] != null) {
             console.log(jsonMessage["channel"])
 
             channel = jsonMessage["channel"]
 
             if (qrCodeAuth_clients[channel] == null) {
                 qrCodeAuth_clients[channel] = { ...qrCodeAuth_clients[channel], "provider" : connection } 
 
             } else {
                if (qrCodeAuth_clients[channel]["requester"] == undefined || qrCodeAuth_clients[channel]["requester"] == null) {
                    qrCodeAuth_clients[channel] = { ...qrCodeAuth_clients[channel], "requester" : connection } 

                    if (jsonMessage["confirmation"] != null && jsonMessage["confirmation"] == false) {
                        qrCodeAuth_clients[channel]["provider"].send(
                            JSON.stringify({
                                confirmation: false,
                            })
                        );
                    }

                } else {
                    if (jsonMessage["confirmation"] != null && jsonMessage["confirmation"] == false) {
                        console.log("DENIED")
                        qrCodeAuth_clients[channel]["requester"].send(
                            JSON.stringify({
                                confirmation : false
                            })
                        )
                        connection.close()

                    } else if (jsonMessage["confirmation"] != null && jsonMessage["confirmation"] == true) {
                        console.log("APPROVED")
                        qrCodeAuth_clients[channel]["requester"].send(
                            JSON.stringify({
                                confirmation : true,
                                authToken: jsonMessage["uuid"]
                            })
                        )
                        connection.close()

                    }

                }
    
             }
 
        } 
    
    })

    connection.on('close', () => {
        if (qrCodeAuth_clients[channel] != undefined) {
            if (qrCodeAuth_clients[channel]["provider"] != null) qrCodeAuth_clients[channel]["provider"].close()
            if (qrCodeAuth_clients[channel]["requester"] != null) qrCodeAuth_clients[channel]["requester"].close()

        }

        delete qrCodeAuth_clients[channel]
        
    })

})

qrCodeAuth_server.listen(9010, () => console.log("QRCode Authentication on port 9010"))


// ---------------------------------------------------------------------------------------------------------------------------------------
//                                                     QRCode Decode
// ---------------------------------------------------------------------------------------------------------------------------------------

const qrCodeDecode_clients = {};

const qrCodeDecode_app = express()
const qrCodeDecode_server = require('http').createServer(qrCodeDecode_app)

const qrCodeDecode_wss = new WebSocket.Server( { server: qrCodeDecode_server } )

qrCodeDecode_wss.on('connection', (connection) => {
    console.log("A new client connected on QRCode Decode on port 9020")

    const userId = uuid();
    qrCodeAuth_clients[userId] = connection;
    console.log(userId)

    connection.on('message', function incoming(data, isBinary) {
   
    
    })

    connection.on('close', () => {
   
        
    })

})

qrCodeDecode_server.listen(9020, () => console.log("QRCode Decode on port 9020"))