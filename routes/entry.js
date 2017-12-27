/* TODO: cache data in hashmap (prob should limit to around 100 MB)
    token: {
        games,
        won
    }
    (4B + 3B + 3B = 10B each person, max 1000B in memory at a time)
*/

const express = require('express');
const router = express.Router();
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var User = require('../models/user');

const genius_base = "http://api.genius.com";

router.param('id', function(req, res, next, id) {
    console.log("user validation route: " + id);
    
    // try to find user in mongo db database
    User.count( {token:id}, function(err, count) {
        if (err) throw err;
        if (count > 0) {
            User.findOne( {token: id} ).then(function(user) {
                // just log the user for now: probably don't need any more authentication
                res.locals.id = id;
                res.locals.user = user;
                next();
            });
        }
        else {
            res.send("Error: access token does not exist. Create a new one and try again");
        }
        
    });
});

// GET /ACCESS_TOKEN
router.get('/:id', function(req, res) {
    console.log("reset game");
    var api_path = "";

    let state = "";     // populate it as lyric with replaced characters
    let status = "ALIVE";
    let remaining_guesses = 3;

    // enclosed function
    function findValidSongID() {
        let songID = Math.ceil(Math.random() * 700,000); // num from 1 - 50,000
        options = {
            url: genius_base + '/songs/' + songID,
            headers: {'Authorization' : 'Bearer ' + process.env.ACCESS_TOKEN},
            json: true
        }
        // get api_path
        request.get(options, function(error, response, body) {
            if (body.meta.status === 200) {
                console.log('api_path', body.response.song.api_path);
                console.log('song_name', body.response.song.full_title);
                api_path = body.response.song.api_path;

                // retrieved api_path: extract lyrics
                // extract lyrics
                request.get('http://genius.com' + api_path, function(error2, response2, body2) {
                    const $ = cheerio.load(body2);
                    let lyrics_body = $('p', '.lyrics').text().trim().replace(/\[[^\]]*\]/gm, "").replace(/^\s*[\r\n]/gm, "").split("\n");

                    // process random lyric
                    let line_id = Math.floor(Math.random() * (lyrics_body.length - 1)); // num from 1 - 50,000
                    let lyrics = lyrics_body.slice(line_id, line_id + 1).toString().replace(/\\/igm, "").toLowerCase();
                    if (lyrics.length > 25) {
                        lyrics = lyrics.split(" ");
                        lyrics = lyrics.slice(0, lyrics.length - lyrics.length/3).join(" ");
                    }
                    let state = lyrics.replace(/[a-z]/ig, "_");

                    // store values in db
                    User.findOneAndUpdate( {token: res.locals.id}, 
                        {lyrics: lyrics, state: state, status: status, remaining_guesses: remaining_guesses},
                    function(errno, user) {
                        if (errno) throw errno;

                        // otherwise update was successful
                    });

                    res.send({
                        "lyrics" : lyrics,  // will remove later
                        "state" : state,
                        "status" : status,
                        "remaining_guesses" : remaining_guesses
                    });
                })
            }
            else {
                findValidSongID();
            }
        });
    }

    // grab random lyric
    findValidSongID();
    
});

// POST /ACCESS_TOKEN
router.post('/:id', function(req, res) {
    console.log("next guess");
    // check for valid post content
    let guess = req.body.guess;
    let remaining_guesses = res.locals.user.remaining_guesses;
    let status = res.locals.user.status;
    // if lost or won
    if (remaining_guesses <= 0 || status === "FREE" || status === "DEAD") {
        console.log("no update");
        let win_rate = res.locals.user.data.games > 0 ? res.locals.user.data.won / res.locals.user.data.games : 0;

        res.send({
            state: res.locals.user.state,
            status: status,
            remaining_guesses: remaining_guesses,
            win_rate: win_rate,
        });
    }
    else if (guess !== undefined && guess.length == 1 && guess.match(/[a-z]/gi)) {
        guess = guess.toLowerCase().charAt(0);
        console.log("guessed", guess);
        // grab actual string, state, and remaining_guesses from database
        let lyrics = res.locals.user.lyrics;
        var lost_guess = 1;

        // process string
        // update state
        var not_guessed = 0;
        var newstate = res.locals.user.state.split("");
        for (i = 0; i < lyrics.length; i++) {
            if (lyrics.charAt(i) === guess) {
                newstate[i] = guess.toString();
                lost_guess = 0;
            }
            not_guessed = newstate[i] == "_" ? not_guessed + 1 : not_guessed;
        }
        let state = newstate.join("");

        // update remaining guesses
        remaining_guesses -= lost_guess; // either guessed correct and didn't lost guess or lost guess

        // update status
        if (remaining_guesses == 0)
            status = "DEAD";
        status = not_guessed > 0 ? status : "FREE"; // if no _, definitely FREE

        // take care of updating games counts
        let games_won = res.locals.user.data.won;
        let total_games = res.locals.user.data.games;
        if (status === "FREE")
            games_won += 1;
        if (status === "FREE" || status === "DEAD")
            total_games += 1;

        let win_rate = total_games > 0 ? games_won / total_games : 0;

        // update state in db, update remaining guesses in db
        User.findOneAndUpdate( {token: res.locals.id}, 
            {state: state, status: status, remaining_guesses: remaining_guesses, data: {won: games_won, games: total_games}},
        function(errno, user) {
            if (errno) throw errno;

            // otherwise update was successful
        });

        // send response
        res.send({
            "state" : state,
            "status" : status,
            "remaining_guesses" : remaining_guesses,
            "win_rate" : win_rate,
        });
    }
    else {
        res.status(401).send("Invalid POST request");
    }
});


// reset score
// POST /ACCESS_TOKEN/reset {email:email_address}
router.post('/:id/reset', function(req, res) {
    console.log("resetting score for user with access token", res.locals.id);
    let email = req.body.email;

    if (email === undefined) {
        res.status(401).send("Invalid POST request");
    }
    else {
        if (email !== res.locals.user.email) {
            console.log("Failed to reset score");
            res.send({status: false});
        }
        else {
            User.findOneAndUpdate( {token:res.locals.id},
            {data: {won: 0, games: 0}},
        function(errno, user) {
            if (errno) throw errno;

            // otherwise reset player's score
            console.log("Successfully reset score!");
            res.send({status: true})
        });
        }
    }

});

module.exports = router;