## UPE Spring 2018 Coding Challenge

### Objective:
The year is 2069 and you've just discovered that you're trapped in the 420th iteration of the Matrix. You are working together with a friend named Neo to escape, but unfortunately the agents from HKN and TBP replaced Neo's blue pill with a NyQuil and he has been suspended in an infinite state of sleep, in which his only dreams are Professor David Smallberg's lectures. This would not normally be a bad thing, but you only have a quarter to escape the Matrix and induct in UPE in the real world.

Luckily, it turns out Professor Smallberg is the Oracle, and he knows a secret way out of the Matrix that involves outsmarting the agents by playing Hangman (https://en.wikipedia.org/wiki/Hangman_(game)). Professor Smallberg has informed Neo of this phenomenon, so Neo is prepared to brainstorm fresh Hangman games for you, which you have to help him win by suggesting guesses 1 letter at a time.

In order to communicate to Neo in his state of sleep, you must send HTTP requests to his brain. We have developed an API that you can use to easily access Neo's brain. In order to escape the Matrix, you must help Neo achieve a minimum win rate of 20% over a span of a minimum of 100 games of Hangman. Clearly, software development skills are of paramount importance in order to defeat the agents: write a program interfacing with Neo's brain API to get as high of a win rate as possible.

Your program should run in a loop from the command line, automatically starting a new game after one is finished, until terminated by the user.

We expect this problem to take 6 hours or less to solve, but you will have the entire quarter until Friday of Week 9 to complete the task.


Feel free to ask your Byte for help or guidance on the task -- they are here to help you grow as a developer and follow an agile development process -- but do not work with other inducting bits, as **the Byte-bit group with the highest win rate will each receive awards, such as Amazon Echos.**


### Technical Details
The Hangman web service is at http://localhost:8080/[access-token]. Calling this endpoint will start a game and return a JSON object. But first you'll need to register an access-token to your email address. To do so, scroll down to the bottom of this page and enter the email address through which you are receiving the link to this site.

The JSON object returned by calling the endpoint will contain **state**, **status**, and **remaining_guesses** fields. **state** shows the phrase you need to guess, and will be filled in with underscores for letters not yet guessed, and actual letters where you've already guessed matches. **status** will show the status of Neo in the current game (ALIVE, DEAD, FREE). **remaining_guesses** will show how many wrong guesses you have left before you lose the game.

Follow up calls in the same game should be made to http://localhost:8080/[access-token] as well, but will POST a guess, while returning the same **state**, **status**, and **remaining_guesses**, but also having fields showing the current **win_rate** you have and the number of **games** you've played, which is the official win rate and number of games we will be using to assess whether or not you have passed the challenge or not.

You may reset your number of games and your win rate by calling http://localhost:8080/[access-token]/reset as described in the API below.

More details on the API are below.


### Notes
- Only the letters A through Z should be guessed - punctuation and spaces are already filled in.
- You should try to figure out an algorithm that will get you as high a win rate as you can, but please try to make your code as maintainable and readable as possible.
- Please don't hit Neo's brain endpoint too hard, for fear of giving him an aneurysm. Try not to make more than a single request per second.
- The service only supports playing one game at a time, so don't GET http://localhost:8080/[access-token] until you're sure you're ready to move on.
- Games and wins won't be counted until Neo is either DEAD or FREE in a given instance of a game.
- The service will only allow you to connect with the email address at which you received the challenge into.


### API:
Below the API endpoints are listed with example responses
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
    Response will be the updated state of the hangman phrase based on the guess, as well as the new gameplay status, remaining guesses, and win rate. The guess should be a single character only. The lyrics field will only appear when the returning status is "DEAD" or "FREE".

Post Data:
{
    "guess" : "a"
}
Response:
{
    "state"     : "_a_ _ __a_ ____",
    "status"    : "DEAD",
    "remaining_guesses" : 0,
    "win_rate"  : 0.25,
    "games"     : 101,
    "lyrics"    : "mad I shat like"
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


### Submitting Your Solution
When you are done, email a link to your GitHub repository containing your solution code to **austinguo550@ucla.edu**. Your submission time will be based on this email, though you may continue fixing up your code and making it more maintainable. Your win rate and number of games played will be read from the server for grading at some arbitrary time after **Friday of 9th week at 11:55:00 pm PST**, so reset your score or play more games at your own risk.

Please also include sufficient documentation on how to build and run your submission in a README file in your repository.
