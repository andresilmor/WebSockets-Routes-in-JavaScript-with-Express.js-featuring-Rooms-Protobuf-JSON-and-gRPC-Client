const imports = require ('./../imports')

const express = imports.EXPRESS
const WebSocket = imports.WEBSOCKET
const uuid = imports.UUID
const redis = imports.REDIS 

// --------------------------------------------------------------------------

const redisClient = redis.createClient({
    url: 'redis://default:EGGjURloNvz8K6fpudILQdYQWbEV8zhm@redis-19874.c233.eu-west-1-1.ec2.cloud.redislabs.com:19874'
  });

await redisClient.connect();



redisClient.on('error', err => console.log('Redis Client Error', err));

const vrHealSession_app = express()
const vrHealSession_server = require('http').createServer(vrHealSession_app)

const vrHealSession_wss = new WebSocket.Server( { server: vrHealSession_server } )

vrHealSession_wss.on('connection', (connection) => {
    console.log("A new client connected on VR Heal Session on port 9030")

    const userId = uuid();

    let channel;

    connection.on('message', async function incoming(data, isBinary) {
        console.log(data.toString())
        try {
            const message = isBinary ? data : data.toString();
            const jsonMessage = JSON.parse(message)
            console.log(redisClient.isReady)
            console.log(redisClient.isOpen)   
            await redisClient.set('key', 'value');
            const value = await redisClient.get('key');
            console.log(value)
            redisClient.del('key');

        } catch (exception) {
            console.log("QRCode Auth Exception: " + exception)

        }
    
    })

    connection.on('close', () => {
    

        
    })

})

module.exports = { SERVER: vrHealSession_server }