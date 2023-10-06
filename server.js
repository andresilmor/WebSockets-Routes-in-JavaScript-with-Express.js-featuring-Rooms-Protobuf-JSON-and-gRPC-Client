const imports = require ('./imports')

const express = imports.EXPRESS
const WebSocket = imports.WEBSOCKET

const app = express()

// ---------------------------------------------------------------------------------------------------------------------------------------
//                                                     Machine Learning (Frame Inference)
// ---------------------------------------------------------------------------------------------------------------------------------------

const pacientsAndEmotionRecon_module = require('./server_modules/faceRecognition_module.js')

const ml_imgInference_server = require('http').createServer(app)
const ml_imgInference_wss = new WebSocket.Server( { server: ml_imgInference_server } )
ml_imgInference_wss.on('connection', pacientsAndEmotionRecon_module.CONNECTION)
ml_imgInference_server.listen(9000, () => console.log("Machine Learning (FaceRecognition) on port 9000"))


// ---------------------------------------------------------------------------------------------------------------------------------------
//                                                     QRCode Authentication
// ---------------------------------------------------------------------------------------------------------------------------------------

const qrCodeAuth_module = require('./server_modules/qrCodeAuth_module.js')

const qrCodeAuth_server = require('http').createServer(app)
const qrCodeAuth_wss = new WebSocket.Server( { server: qrCodeAuth_server } )
qrCodeAuth_wss.on('connection', qrCodeAuth_module.CONNECTION)
qrCodeAuth_server.listen(9010, () => console.log("QRCode Authentication on port 9010"))


// ---------------------------------------------------------------------------------------------------------------------------------------
//                                                     QRCode Decode
// ---------------------------------------------------------------------------------------------------------------------------------------

const qrCodeDecode_module = require('./server_modules/qrCodeDecode_module.js')

const qrCodeDecode_server = require('http').createServer(app)
const qrCodeDecode_wss = new WebSocket.Server( { server: qrCodeDecode_server } )
qrCodeDecode_wss.on('connection', qrCodeDecode_module.CONNECTION)
qrCodeDecode_server.listen(9020, () => console.log("QRCode Decode on port 9020"))

// ---------------------------------------------------------------------------------------------------------------------------------------
//                                                     VR Heal Session
// ---------------------------------------------------------------------------------------------------------------------------------------

const vrHealSession_module = require('./server_modules/vrHealSession_module.js')

const vrHealSession_server_one = require('http').createServer(app)
const vrHealSession_wss_one = new WebSocket.Server( { server: vrHealSession_server_one } )
vrHealSession_wss_one.on('connection', vrHealSession_module.CONNECTION)
vrHealSession_server_one.listen(9030, () => console.log("VR Heal Session on port 9030"))

const vrHealSession_server_two = require('http').createServer(app)
const vrHealSession_wss_two = new WebSocket.Server( { server: vrHealSession_server_two } )
vrHealSession_wss_two.on('connection', vrHealSession_module.CONNECTION)
vrHealSession_server_two.listen(9031, () => console.log("VR Heal Session on port 9031"))

// ---------------------------------------------------------------------------------------------------------------------------------------
//                                                     VR Heal Session Stream
// ---------------------------------------------------------------------------------------------------------------------------------------

const vrHealSessionPanoramicStream_module = require('./server_modules/vrHealSessionPanoramicStream_module.js')

const vrHealSessionPanoramicStream_server_one = require('http').createServer(app)
const vrHealSessionPanoramicStream_wss_one = new WebSocket.Server( { server: vrHealSessionPanoramicStream_server_one } )
vrHealSessionPanoramicStream_wss_one.on('connection', vrHealSessionPanoramicStream_module.CONNECTION)
vrHealSessionPanoramicStream_server_one.listen(9040, () => console.log("VR Heal Session Stream on port 9040"))

const vrHealSessionPanoramicStream_server_two = require('http').createServer(app)
const vrHealSessionPanoramicStream_wss_two = new WebSocket.Server( { server: vrHealSessionPanoramicStream_server_two } )
vrHealSessionPanoramicStream_wss_two.on('connection', vrHealSessionPanoramicStream_module.CONNECTION)
vrHealSessionPanoramicStream_server_two.listen(9041, () => console.log("VR Heal Session Stream on port 9041"))

