const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const userRouter = require('./router/UserRouter');
const express = require('express');
const Authentication = require("./router/AuthenticationRouter");
const app = express();
const dotenv = require('dotenv');
dotenv.config();
var cors = require('cors')





// Mongo DB connection
const database = process.env.MONGOLAB_URI;
mongoose.connect(database, {useUnifiedTopology:true, useNewUrlParser: true})
    .then(() => console.log('e don connect'))
    .catch(err => console.log(err));



app.use(express.json());
app.use('/api', userRouter);
app.use('/api', Authentication);

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port ${port}...`));