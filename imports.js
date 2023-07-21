const express = require('express')
const parseArgs = require('minimist');
const grpc = require('@grpc/grpc-js');
var protobuf = require("protobufjs");
const WebSocket = require('ws')
const grpcClient = require('./grpc_client')
const grpcAddress = require ('./grpc_address')
const { v4: uuid } = require('uuid');
const redis = require('redis');

const { MongoClient, ObjectId } = require("mongodb");
const GridFSBucket = require("mongodb").GridFSBucket;

const MongoDB_URL = "mongodb+srv://andresilmor:project-greenhealth@carexr-mongodb-cluster.mcnxmz7.mongodb.net/?retryWrites=true&w=majority";
const Redis_URL = 'redis://default:EGGjURloNvz8K6fpudILQdYQWbEV8zhm@redis-19874.c233.eu-west-1-1.ec2.cloud.redislabs.com:19874';

module.exports = {
    EXPRESS: express,
    PARSE_ARGS: parseArgs,
    GRPC: grpc,
    PROTOBUF: protobuf,
    WEBSOCKET: WebSocket,
    GRPC_CLIENT: grpcClient,
    GRPC_ADDRESS: grpcAddress,
    UUID: uuid,
    REDIS: redis,
    GRID_FS_BUCKET: GridFSBucket,
    MONGO_CLIENT: MongoClient,
    OBJECT_ID: ObjectId,
    MONGO_URL: MongoDB_URL,
    REDIS_URL: Redis_URL

}