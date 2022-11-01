const {User, validate} = require('../models/Users');
const express = require('express')
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const router = express.Router();


router.post('/users/register', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    //First Validate The Request
    const { error } = validate(req.body);
    if (error){
        console.log(error)
        return res.status(400).send(error.details[0].message);
    }

    // check if this user already exists
    let user = await User.findOne({$or:[{ email : req.body.email }, { username : req.body.username }]})

    if(user){
        return res.status(400).send('That user already exists')
    } else{
        user = new User({
            first_name : req.body.first_name,
            last_name : req.body.last_name,
            email : req.body.email,
            username: req.body.username,
            password : bcrypt.hashSync(req.body.password, 10)
        });
        await user.save();
        res.send(user);
    }
});


router.get('/users', (req, res) =>{
    res.header("Access-Control-Allow-Origin", "*");

    User.find({}, function (error, users){
        if (error) {
            console.log(error)
            return res.status(400).send(error.details[0].message);
        }
        else {
            res.status(200).send(users);
        }
    });
});



module.exports = router;
