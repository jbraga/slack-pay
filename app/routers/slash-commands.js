'use strict'
const request = require("request");
const express = require('express');
const router = express.Router();

/**
 * Controllers
 */
const terminalCtrl = require('../controllers/terminal-ctrl');
const paymentsCtrl = require('../controllers/payments-ctrl');
/**
 * Dialogs
 */
const dialogs = require('../views/slack-dialogs');

/**
 * [POST] Endpoint called upon slash command '/charge'
 */
router.post('/onCharge', (req, res) => {
    console.log('[/charge] %s ', req.body);

    terminalCtrl.getTerminalBySlackToken(req.body.token)
        .then(terminals => {
            if (terminals && terminals.length > 0) {
                console.log("%s terminal(s) found, sending payment request...", terminals.length);
                paymentsCtrl.openCreatePaymentRequestDialog(req, res, terminals);                
            } else {
                console.log("None terminals found, opening terminal setup dialog...");
                terminalCtrl.openTerminalSetupDialog(req, res);
            }
        });
});

module.exports = router;