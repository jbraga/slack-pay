'use strict'
// *************************************************** //
//                      BASE SETUP                     //
// *************************************************** //

// call the packages we need
const express    = require('express');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');

// Init application
const app = express();

/**
 * Configuring app to use bodyParser()
 * This will let us get the data from a POST
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * Database Configuration
 * https://cloud.mongodb.com/v2/5ae21c03df9db17ddb07369f#clusters
 */
mongoose.connect('mongodb+srv://mongodb-admin:' + 
    process.env.MONGO_ATLAS_PW + '@worldnet-slack-app-3mgdz.mongodb.net/test');

// set our port
var port = process.env.PORT || 8080;        

// *************************************************** //
//                          ROUTES                     //
// *************************************************** //

// Registering Middleware
app.use(function(req, res, next) {
    console.log('Something is happening.');
    next();
});

/**
 * Home Route
 * http://localhost:8080/api
 */
app.get('/', function(req, res) {
    res.json({ message: "Server's up!" });   
});

/**
 * Slash Command Routes
 */
const slashCommands = require('./app/routers/slash-commands');
app.use('/slash-commands', slashCommands);

/**
 * Interactive Components Routes
 */
const interactiveComponents = require('./app/routers/interactive-componenents');
app.use('/interactive-components', interactiveComponents);

/**
 * Terminal Routes
 */
const terminals = require('./app/routers/terminals');
app.use('/terminals', terminals);

// *************************************************** //
//                     START SERVER                    //
// *************************************************** //

app.listen(port);
console.log('Listening on port ' + port);