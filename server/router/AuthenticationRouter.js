const {User, validate} = require('../models/Users');
const express = require('express')
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
const router = express.Router();


// Set up Global configuration access
dotenv.config();


router.post("/users/login", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    email_or_username = req.body.username;
    password = req.body.password;

    if (!email_or_username || !password) {
        return res.status(400).send("please provide email/username and password");
    }

    // get account from database
    const account = await User.findOne({ $or: [{email: email_or_username},{ username: email_or_username}] });

    // check account found and verify password
    if (!account || !bcrypt.compareSync(password, account.password)) {
        // authentication failed
        return res.status(401).send("Authentication Failed, please check username/email or password");
    } else {
        // authentication successful
        // Validate User Here
        // Then generate JWT Token

        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        let data = {
            time: Date(),
            userId: account.username,
        }

        const token = jwt.sign(
            {
                userId: account._id,
                userEmail: account.email,
            },
            jwtSecretKey,
            { expiresIn: "24h" }
        );


        let AUTHDETAILS = {
            jwtToken: token,
            auth: true
        };

        protoBufCall(AUTHDETAILS)

        return res.status(202).send(token);
    }

});


// Verification of JWT
router.get("/user/validateToken", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    // Tokens are generally passed in header of request
    // Due to security reasons.

    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;

    try {
        const token = req.header(tokenHeaderKey);

        const verified = jwt.verify(token, jwtSecretKey);
        if(verified){
            return res.send("Successfully Verified");
        }else{
            // Access Denied
            return res.status(401).send(error);
        }
    } catch (error) {
        // Access Denied
        return res.status(401).send(error);
    }
});



function protoBufCall(AUTHDETAILS){
    const grpc = require("@grpc/grpc-js");
    const protoLoader = require("@grpc/proto-loader");
    const PROTO_PATH = "../protos/jwt.proto";

    const loaderOptions = {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    };

    var packageDef = protoLoader.loadSync(PROTO_PATH, loaderOptions);
    const grpcObj = grpc.loadPackageDefinition(packageDef);
    const ourServer = new grpc.Server();



    ourServer.bindAsync(
        "127.0.0.1:50051",
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            console.log("Server running at http://127.0.0.1:50051");
            ourServer.start();
        }
    );


    ourServer.addService(grpcObj.PasswordService.service, {
        /*our protobuf message(passwordMessage) for the RetrievePasswords was Empty. */
        RetrieveJWT: (passwordMessage, callback) => {
            callback(null, AUTHDETAILS);
        },
        // addNewDetails: (passwordMessage, callback) => {
        //     const passwordDetails = { ...passwordMessage.request };
        //     dummyRecords.passwords.push(passwordDetails);
        //     callback(null, passwordDetails);
        // },
        // updatePasswordDetails: (passwordMessage, callback) => {
        //     const detailsID = passwordMessage.request.id;
        //     const targetDetails = dummyRecords.passwords.find(({ id }) => detailsID == id);
        //     targetDetails.password = passwordMessage.request.password;
        //     targetDetails.hashValue = passwordMessage.request.hashValue;
        //     targetDetails.saltValue = passwordMessage.request.saltValue;
        //     callback(null, targetDetails);
        // },
    });
}



module.exports = router;