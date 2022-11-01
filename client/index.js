const grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = "../protos/jwt.proto";
const dotenv = require('dotenv');
const jwt = require("jsonwebtoken");
dotenv.config();
const bcrypt = require('bcrypt');
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};


var grpcObj = protoLoader.loadSync(PROTO_PATH, options);
const PasswordService = grpc.loadPackageDefinition(grpcObj).PasswordService;

const clientStub = new PasswordService(
    "localhost:50051",
    grpc.credentials.createInsecure(),
     {
    'grpc.keepalive_time_ms': 10000,
        'grpc.keepalive_timeout_ms': 5000,
        'grpc.keepalive_permit_without_calls': true,
        'grpc.http2.max_pings_without_data': 0,
        'grpc.http2.min_time_between_pings_ms':10000,
        'grpc.http2.min_ping_interval_without_data_ms': 5000,
}
);

clientStub.RetrieveJWT({}, async (error, AUTHDETAILS) => {
    //implement your error logic here
    console.log(AUTHDETAILS)
    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;

    try {
        const token = AUTHDETAILS.jwtToken;

        const decodedToken = await jwt.verify(
            token,
            jwtSecretKey
        );

        // retrieve the user details of the logged in user
        const user = await decodedToken;
        console.log(user)
    } catch (error) {
        // Access Denied
        console.log(error)
    }
});
