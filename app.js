const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

var info = require('./routes/info');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/vehicles', info);	// vehicle info

module.exports = app;