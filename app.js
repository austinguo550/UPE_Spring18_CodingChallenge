const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// load environment variables
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const User = require('./models/user');
// connect to mongodb
mongoose.connect('mongodb://localhost/test');
//mongoose.connect(process.env.MONGODB_URI); // for when fully deployed to heroku
mongoose.connection
  .once('open', function () {
    console.log('Mongoose successfully connected to Mongo')
  })
  .on('error', function (error) {
    console.error('Mongoose/ Mongo connection error:', error)
  })

const entry = require('./routes/entry');
const mongo = require('./routes/mongo');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', entry);    // give entry point for backend
app.use('/mongo', mongo);    // misc functions mongo

app.use("*", function(req, res) {
    res.status(404).send('404');
});

module.exports = app;