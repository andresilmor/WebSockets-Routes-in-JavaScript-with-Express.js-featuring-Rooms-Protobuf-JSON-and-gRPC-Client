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
        
        ws.binaryType = 'arraybuffer'
        
        //console.log("Receved: %s", message)
        console.log("Message received")

        console.log(message.byteLength)

        const client = new grpcClient.imageInference.ImageInferenceService(
            '5.tcp.eu.ngrok.io:17400',
        
            grpc.credentials.createInsecure()
        );
        
        protobuf.load("protobufs/messages/ImageInferenceRequest.proto", function(err, root) {
            var request = root.lookupType("imageInferenceRequest.ImageInferenceRequest");

            var decoded = request.decode(message);

            client.Inference({ image: decoded['Test'] }, function (err, response) {
                console.log('Message:', response.pred);
                ws.send(response.pred)
            });
            
        })
        
        
        ws.send(message.buffer)
    })

})

app.get('/', (req, res) => res.send('Hello World'))

server.listen(8000, () => console.log("Listening on port 8000"))

