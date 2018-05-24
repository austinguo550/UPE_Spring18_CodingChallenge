const express = require('express');
const router = express.Router();
const path = require('path');
const request = require('request');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var User = require('../models/user');

let PASSWORD = process.env.ADMIN_PASSWORD;

// grab users that passed
router.post('/passed', function(req, res) {
    console.log('hit grab users that passed the challenge');
    
    let password = req.body.password;
    if (password === PASSWORD) {
        User.find({}, function(err, users) {
            if (err) throw err;
    
            console.log("all users", users);    // debug purposes only
            let passing_users = [];
            // find users that meet requirements:
                // played over 100 games
                // 20% win rate
            for (i = 0; i < users.length; i++) {
                if (users[i].data.games > 100 && users[i].data.won/users[i].data.games > 0.20) {
                    console.log(users[i]);
                    passing_users.push(users[i]);
                }
            }

            res.send(passing_users);
        });
    }
    else {
        res.status(401).send('You must be a UPE officer to access inductee data');
    }

});


router.post('/winners', function(req, res) {
    console.log("getting the top 3 scoring winners who passed the challenge");

    let password = req.body.password;
    if (password === PASSWORD) {
        User.find({}, function(err, users) {
            if (err) throw err;
    
            console.log("all users", users);    // debug purposes only
            let passing_users = [];
            // find users that meet requirements:
                // played over 100 games
                // 20% win rate
            for (i = 0; i < users.length; i++) {
                if (users[i].data.games > 100 && users[i].data.won/users[i].data.games > 0.20) {
                    console.log(users[i]);
                    passing_users.push(users[i]);
                }
            }

            passing_users.sort(predicateBy("score"));

            res.send(passing_users.slice(0,3));
        });
    }
    else {
        res.status(401).send('You must be a UPE officer to access inductee data');
    }
});


function predicateBy(prop) {
    return function(a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        }
        else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}

module.exports = router;