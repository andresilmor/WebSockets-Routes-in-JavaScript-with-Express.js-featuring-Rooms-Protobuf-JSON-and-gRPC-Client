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

const qrCodeDecode_clients = {};

const qrCodeDecode_app = express()
const qrCodeDecode_server = require('http').createServer(qrCodeDecode_app)

const qrCodeDecode_wss = new WebSocket.Server( { server: qrCodeDecode_server } )

qrCodeDecode_wss.on('connection', (connection) => {
    console.log("A new client connected on QRCode Decode on port 9020")

    const userId = uuid();
    qrCodeDecode_clients[userId] = connection;
    console.log("Client UUID: " + userId)

    connection.on('message', function incoming(data) {
        try {

            const client = new grpcClient.imageInference.ImageInferenceService(
                grpcAddress.ADDRESS,
            
                grpc.credentials.createInsecure()
            );

            var inferenceResult
            var request

            protobuf.load("protobufs/messages/ImageInferenceRequest.proto", function(err, root) {
                request = root.lookupType("imageInferenceRequest.ImageInferenceRequest");
    
                var decoded = request.decode(new Uint8Array(data));

                client.QRCodeDecode({ image: decoded['image'] }, function (err, response) {
                    try {
                        console.log(response)
                        connection.send(JSON.stringify(response["content"]))
                        
            
                    } catch (exception) {
                        console.log("QRCode Auth Response Exception: " + exception)


                    }

                });
                
            
            })

        } catch (exception) {
            console.log("QRCode Auth Exception: " + exception)

        }
        

        
    })
   
    connection.on('close', () => {
   
        
    })

    connection.on('open', () => {
        console.log("Connection Opened")
      });
})

module.exports = { SERVER: qrCodeDecode_server }
