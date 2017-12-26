const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

// load environment variables
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
  }

const entry = require('./routes/entry');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', entry);    // give entry point for backend

app.use("*", function(req, res) {
    res.status(404).send('404');
});

module.exports = app;