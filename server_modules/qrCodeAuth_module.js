const imports = require ('./../imports')

const uuid = imports.UUID

// --------------------------------------------------------------------------

const qrCodeAuth_clients = {};

const connection = function(connection)  {
    console.log("A new client connected on QRCode Authentication on port 9010")

    const userId = uuid();
    qrCodeAuth_clients[userId] = connection;
    console.log(userId)
    let channel;

    connection.on('message', function incoming(data, isBinary) {
        console.log(data.toString())
        try {
            const message = isBinary ? data : data.toString();
            const jsonMessage = JSON.parse(message)
            
            if (jsonMessage["channel"] != null) {
                console.log(jsonMessage["channel"])
    
                channel = jsonMessage["channel"]
    
                if (qrCodeAuth_clients[channel] == null) {
                    if (jsonMessage["confirmation"] == null)
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
        } catch (exception) {
            console.log("QRCode Auth Exception: " + exception)

        }
    
    })

    connection.on('close', () => {
        if (qrCodeAuth_clients[channel] != undefined) {
            if (qrCodeAuth_clients[channel]["provider"] != null) qrCodeAuth_clients[channel]["provider"].close()
            if (qrCodeAuth_clients[channel]["requester"] != null) qrCodeAuth_clients[channel]["requester"].close()

        }

        delete qrCodeAuth_clients[channel]
        
    })

}

module.exports = { CONNECTION: connection }