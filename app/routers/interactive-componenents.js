'use strict'
const mongoose = require('mongoose');
const request = require("request");
const express = require('express');
const router = express.Router();

// Constants
const Constants = require('../utils/constants');
// Dependence Injector Container
const container = require('../../container');
// Singleton instance of Locale Service
const localeService = container.resolve('localeService');

// Controllers
const terminalCtrl = require('../controllers/terminal-ctrl');
const paymentsCtrl = require('../controllers/payments-ctrl');

router.post('/', (req, res) => {
    let payload = JSON.parse(req.body.payload);
    console.log('[Interactive Components] payload=%s - callback=%s', req.body.payload, payload.callback_id);

    let callbackId;
    let callbackPayload;

    if (payload.callback_id.indexOf('|') != -1) {
        const callbackElements = payload.callback_id.split('|');
        callbackId = callbackElements[0];
        callbackPayload = callbackElements[1];
    } else {
        callbackId = payload.callback_id
    }

    console.log(callbackId);

    switch (callbackId) {
        case Constants.FIRST_PAY_REQ_CONFIRMATION:
            let selectedAction = payload.actions[0];
            if (selectedAction.value == 'YES') {
                console.log("Proceeding with payment request...");
                // Getting back terminal from action's attr name
                const terminals = [JSON.parse(selectedAction.name)];
                // Opens dialog passing recently created terminal
                paymentsCtrl.openCreatePaymentRequestDialog(req, res, terminals);
            } else {
                res.send(localeService.i18n("messages.nothing_personal") + " :wink: ");
            }
            break;
        case Constants.CREATE_PAYMENT_REQUEST:
            paymentsCtrl.createPaymentRequestDialogCallback(req, res, payload);
            break;
        case Constants.TERMINAL_SETUP:
            terminalCtrl.terminalSetupDialogCallback(req, res, payload);
            break;
        case Constants.ACCEPT_CHARGE:
            if (payload.actions[0].value == 'ACCEPT') {
                console.log("User has accepted transaction.")
                paymentsCtrl.openCardDetailsDialog(req, res, payload);
            } else {
                // TODO Decline Reason Dialog
            }
            break;
        case Constants.PAY_NOW:
            paymentsCtrl.payment(req, res, payload, callbackPayload);
            break;

        // #####################################################################
        // ########################## MESSAGE ACTIONS ##########################
        // #####################################################################

        case Constants.CHARGE:
            terminalCtrl.getTerminalBySlackToken(payload.token)
                .then(terminals => {
                    if (terminals && terminals.length > 0) {
                        console.log("%s terminal(s) found, sending payment request...", terminals.length);
                        paymentsCtrl.openCreatePaymentRequestDialog(req, res, terminals);
                    } else {
                        console.log("Terminal not found, opening terminal setup dialog...");
                        terminalCtrl.openTerminalSetupDialog(req, res);
                    }
                });
            break;
        default:
            break;
    }
});

router.post('/options', (req, res) => {
    console.log("/options payload=%s", req.body.payload);
    //let options = [];
    let payload = JSON.parse(req.body.payload);

    switch (payload.name) {
        case 'card_type':
            // Load card types supported by terminal.
            break;
        case 'currecy':
            // Load currencies supported by terminal.
            break;
        default:
            console.log("Unknown options name: " + payload.name);
            break;
    }

    let options = {
        "options": [
            {
                "label": "Visa",
                "value": "VISA"
            },
            {
                "label": "Mastercard",
                "value": "MASTERCAR"
            },
            {
                "label": "American Express",
                "value": "AMEX"
            }
        ]
    }

    res.send(options);
});


module.exports = router;