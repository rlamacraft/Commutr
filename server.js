'use strict';

// setting up required dependencies, assigning them to objects
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var passport = require('passport');
var path = require('path');
var logger = require('./public/js/logger');
var app = express();

// setting up the Express application object
app
    .use(bodyParser.json()) // Parses the incoming requests text as JSON and exposes the resulting object on req.body.
    .use(cookieParser()) // read cookies (needed for auth)
    .use(morgan('dev')) // log every request to the console

    .use(express.static('../public')) // expose all files under '../public' statically, so they can all be accessed through the proper URL
    .use('/vendor', express.static(__dirname + '/node_modules')) // replace the '../node_modules' exposed route with '/vendor'
    .use('/scripts', express.static(__dirname + '/public/js')) // replase the '../public/js' exposed route with '/scripts'
    .use('/views', express.static(__dirname + '/public/views'))

    // route that sends the index.html file for any other URL not corresponding to the ones defined above
    .get('*', function (req, res) {
        res
            .status(200)
            .set({'content-type': 'text/html; charset=utf-8'})
            .sendFile('/public/views/index.html', {root: path.resolve(__dirname, './')});
    })
    .on('error', function (error) {
        logger.log('Error: \n' + error.message);
        console.log(error.stack);
    });

app.listen(8080);