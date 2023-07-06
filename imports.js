const express = require('express')
const parseArgs = require('minimist');
const grpc = require('@grpc/grpc-js');
var protobuf = require("protobufjs");
const WebSocket = require('ws')
const grpcClient = require('./grpc_client')
const grpcAddress = require ('./grpc_address')
const { v4: uuid } = require('uuid');
const redis = require('redis');

module.exports = {
    EXPRESS: express,
    PARSE_ARGS: parseArgs,
    GRPC: grpc,
    PROTOBUF: protobuf,
    WEBSOCKET: WebSocket,
    GRPC_CLIENT: grpcClient,
    GRPC_ADDRESS: grpcAddress,
    UUID: uuid,
    REDIS: redis

}