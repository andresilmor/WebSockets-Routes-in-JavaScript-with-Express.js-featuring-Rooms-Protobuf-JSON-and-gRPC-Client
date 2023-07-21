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


const connection = function(connection)  {
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

            protobuf.load("protobufs/messages/ProtoImage.proto", function(err, root) {
                request = root.lookupType("protoImage.ProtoImage");
    
                var decoded = request.decode(new Uint8Array(data));

                client.QRCodeDecode({ image: decoded['image'] }, function (err, response) {
                    try {
                        console.log(response)
                        connection.send(JSON.stringify(response["content"]))
                        
            
                    } catch (exception) {
                        console.log("QRCode Decode Response Exception: " + exception)


                    }

                });
                
            
            })

        } catch (exception) {
            console.log("QRCode Decode Exception: " + exception)

        }
        

        
    })
   
    connection.on('close', () => {
   
        
    })

    connection.on('open', () => {
        console.log("Connection Opened")
      });
}

module.exports = { CONNECTION: connection }
