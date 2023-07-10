const PROTO_PATH = __dirname + '/protobufs/services/ms_imageInference.proto';
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const imageInferencePackage = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,

  longs: String,

  enums: String,

  defaults: true,

  oneofs: true,
});


const imageInference = grpc.loadPackageDefinition(imageInferencePackage).imageInference;

module.exports = { imageInference }