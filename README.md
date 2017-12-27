# README

## UPE Spring 2018 Coding Challenge

### Task Description:

### Routes:
Below the routes are listed with example responses
```
GET /ACCESS_TOKEN
    Response will be the state of the hangman phrase generated with the start of this new game, as well as the status of the person and how many remaining guesses the game has.

Response:
{
    "state"     : "___ ___ -_______",
    "status"    : "ALIVE",
    "remaining_guesses" : 3
}

POST /ACCESS_TOKEN
    Response will be the updated state of the hangman phrase based on the guess, as well as the new gameplay status, remaining guesses, and win rate. The guess should be a single character only.

Post Data:
{
    "guess" : "a"
}
Response:
{
    "state"     : "_a_ _ __a_ ____",
    "status"    : "DEAD",
    "remaining_guesses" : 0,
    "win_rate"  : 0.25
}

POST /ACCESS_TOKEN/reset
    Response will be true if win count and game count has been reset for the user with ACCESS_TOKEN and email

Post Data:
{
    "email" : "chancellor@conet.ucla.edu"
}
Response:
{
    "success" : true
}
```