'use strict'

const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();


const xml2js = require('xml2js');

/**
 * Terminal Mongo Schema
 */
const Terminal = require('../models/Terminal');

const Payment = require('../payment-provider/xml-bind/Payment');

router.post('/', function(req, res) {
    var builder = new xml2js.Builder({rootName: 'PAYMENT'});

    let obj = new Payment();

    var xml = builder.buildObject(obj);

    console.log(xml);
    
    // const terminal = Terminal({
    //     _id: new mongoose.Types.ObjectId(),
    //     terminalNumber: req.body.terminalNumber,
    //     slackToken: req.body.slackToken
    // });
    
    // terminal.save().then(result => {
    //     console.log(result);
        
    //     res.status(201).json({
    //         message: "Terminal created!",
    //         terminal: result
    //     });

    // }).catch(err => {
    //     console.log(err);
    //     res.status(500).json({error: err});
    // });
});

router.get('/:terminalNumber', (req, res, next) => {
    console.log('Retrieving terminal...');
    const terminalNumber = req.params.terminalNumber;
    
    Terminal.findOne({'terminalNumber':terminalNumber})
        .exec()
        .then(doc => {
            console.log(doc);
            if(doc) {
                res.status(200).json({doc});
            } else {
                res.status(404).json({message: 'No valid entry found for provided terminal number'});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

module.exports = router;