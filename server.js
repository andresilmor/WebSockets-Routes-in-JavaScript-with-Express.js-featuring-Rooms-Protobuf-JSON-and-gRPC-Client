const express = require('express')
const app = express()

const server = require('http').createServer(app)

const WebSocket = require('ws')

const wss = new WebSocket.Server( { server: server } )

wss.on('connection', function connection(ws) {
    console.log("A new client connected")
    ws.send("Yo")

    ws.on('message', function incoming(message) {
        console.log("Receved: %s", message)

        ws.send("Yo again")

    })

})

app.get('/', (req, res) => res.send('Hello World'))

server.listen(8000, () => console.log("Listening on port 8000"))

