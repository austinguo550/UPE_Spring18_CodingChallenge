const express = require('express');
const router = express.Router();
const path = require('path');
const request = require('request');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const emails = require('./emails'); // only returns one array (not json obj)

var User = require('../models/user');
var Song = require('../models/song');


// update access token
router.post('/update_token', function(req, res) {
    console.log("hit update token");

    console.log(emails);

    if (emails.indexOf(req.body.email) === -1) {
        res.send(400).status("Email does not exist");
        return;
    }

    function makeid() {
        var token = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      
        for (var i = 0; i < 5; i++)
            token += possible.charAt(Math.floor(Math.random() * possible.length));

        User.count( {token:token}, function(err, count) {
            if (err) throw err;
    
            if (count > 0) {
                // token already exists, generate another one
                makeid();
                return;
            }
        });
      
        console.log("token is ", token);

        // found an unused token
        // try to find user in mongo db database
        User.count( {email:req.body.email}, function(err, count) {
            if (err) throw err;

            console.log("request is", req.body.email);
            console.log("no error");
            if (count > 0) {
                User.findOneAndUpdate( {email: req.body.email}, {token:token}, function(errno, user) {
                    if (errno) throw errno;

                    console.log("user exists");
                    console.log(user);

                    res.send({token: token});
                });
            }
            else {
                console.log("need to create user");
                // need to create new user
                let newUser = User({
                    email: req.body.email,
                    token: token,
                    data: {
                        games: 0,
                        won: 0
                    }
                });

                console.log("creating new user");
                newUser.save(function(err3) {
                    if (err3) throw err3;

                    console.log("User created!");
                    res.send({token: token});
                })
            }
            
        });
    }

    makeid();
})


module.exports = router;
