const Joi = require('joi');
const mongoose = require('mongoose');
const PasswordComplexity = require("joi-password-complexity");


const User = mongoose.model('User', new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    last_name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    username: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    }
}));


function validateUser(user) {
    const schema = Joi.object({
        first_name: Joi.string().min(1).max(50).required(),
        last_name: Joi.string().min(1).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        username: Joi.string().min(5).max(255).required(),
        password:  new PasswordComplexity({
            min: 8,
            max: 25,
            lowerCase: 1,
            upperCase: 1,
            numeric: 1,
            symbol: 1,
            requirementCount: 4
        })
    });
    return schema.validate(user);
}


exports.User = User;
exports.validate = validateUser;