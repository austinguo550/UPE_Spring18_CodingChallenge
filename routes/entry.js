const express = require('express');
const router = express.Router();
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');

const genius_base = "http://api.genius.com";

router.param('id', function(req, res, next, id) {
    console.log("user validation route: " + id);
    next();
    // try to find user in mongo db database
    /*
    if (id != "1234" && id != "1235") {
        console.log("INVALID");
        res.send("Invalid vehicle id: vehicle id must be 1234 or 1235");
        res.send(404);
    }
    else {
        // once validation is done save the new item in the req                 
        req.id = id;
    }
    next();
    */ 
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
                    let lyrics_body = $('p', '.lyrics').text().trim().split("\n");

                    // process random lyric
                    let line_id = Math.floor(Math.random() * (lyrics_body.length - 1)); // num from 1 - 50,000
                    let lyrics = lyrics_body.slice(line_id, line_id + 1).toString().replace(/\\/ig, "");
                    let state = lyrics.replace(/[a-z]/ig, "_");

                    res.send({
                        "lyrics" : lyrics,
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

    if (guess !== undefined && guess.length == 1) {
        // grab actual string, state, and remaining_guesses from database

        let state = "";             // process string based on what the guess was
        let status = "";            // check database for stored value of status
        let remaining_guesses = 3;  // check database for stored value of remaining guesses

        // check to see if no more _ in state: if true, status = FREE and don't update remaining guesses

        // update state in db, update remaining guesses in db

        // send response
        res.send({
            "state" : state,
            "status" : status,
            "remaining_guesses" : remaining_guesses,
        });
    }
    else {
        res.status(401).send("Invalid POST request");
    }
});

module.exports = router;