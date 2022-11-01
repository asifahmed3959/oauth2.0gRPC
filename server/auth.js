const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');

// Set up Global configuration access
dotenv.config();



module.exports = async (request, response, next) => {
    try {
        //   get the token from the authorization header
        const token = await request.headers.authorization.split(" ")[1];

        let jwtSecretKey = process.env.JWT_SECRET_KEY;

        //check if the token matches the supposed origin
        const decodedToken = await jwt.verify(
            token,
            jwtSecretKey
        );

        // retrieve the user details of the logged in user
        const user = await decodedToken;

        // pass the the user down to the endpoints here
        request.user = user;

        // pass down functionality to the endpoint
        next();

    } catch (error) {
        response.status(401).json({
            error: new Error("Invalid request!"),
        });
    }
}