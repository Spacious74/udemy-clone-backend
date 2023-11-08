const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const bcrypt = require("bcryptjs");
const User = require("../models/User");

const getUserById = async (req,res) =>{

}

const createUser = async (req,res) =>{
    const userbody = req.body;
    try {
        const userCreated = await User.create({
            username : userbody.username, 
            email : userbody.email,
            password : bcrypt.hashSync(userbody.password, 10),
            profilePicture : {
                public_id : "sampleId",
                url : "sampleUrl"
            }
        });
        res.status(200).send({
            message : "User registered successfully.",
            userCreated
        });
    } catch (error) {
        res.status(400).send({
            message : "An error occurred while registering : " + error.message
        });
        console.log(error.message);
    }
}

const deleteUser = async (req,res) =>{

}

module.exports = {
    getUserById,
    createUser,
    deleteUser
}