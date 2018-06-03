'use strict'
const request = require("request");
const rp = require("request-promise");
const mongoose = require('mongoose');

// Terminal Configuration Request XML Bind
const TerminalConfiguration = require('../payment-provider/xml-bind/TerminalConfiguration');
// Terminal Mongo Schema
const Terminal = require('../models/Terminal');
// Payment Controller
const paymentsCtrl = require('./payments-ctrl');
// Utility Modules
const Constants = require('../utils/constants');
const CommonUtils = require('../utils/common-utils');
// Slack Dialogs & Interative Messages
const dialogs = require('../views/slack-dialogs');
const messages = require('../views/slack-messages');
// Dependence Injector Container
const container = require('../../container');
// Singleton instance of Locale Service
const localeService = container.resolve('localeService');

/**
 * Find processing terminals by slack token
 * @param {String} slackToken 
 */
exports.getTerminalBySlackToken = async (slackToken) => {
    //Terminal.remove({}, () => {});

    try {
        return Terminal.find({ 'slackToken': slackToken })
            .exec()
            .then(terminal => {
                console.log(terminal);
                return terminal;
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    } catch (error) {
        console.log(error);
    }
}

exports.getTerminalSecret = async (terminalNumber) => {
    try {
        return Terminal.findOne({ 'terminalNumber': terminalNumber })
            .exec()
            .then(terminal => {
                console.log(terminal);
                return terminal.terminalSecret;
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    } catch (error) {
        console.log(error);
    }
}

/**
 * When the user does not have a terminal configured yet, 
 * this function will be called in order to open the terminal setup dialog.
 * 
 * @param {HttpRequest} req 
 * @param {HttpResponse} res 
 */
exports.openTerminalSetupDialog = (req, res) => {
    console.log("[openTerminalSetupDialog] " + JSON.stringify(req.body));
    try {
        request.post({
            "headers": {
                "Content-type": "application/json; charset=utf-8",
                "Authorization": Constants.TOKEN_BEARER
            },
            "url": Constants.OPEN_SLACK_DIALOG_URL,
            "body": JSON.stringify({
                "dialog": dialogs.terminalSetupDialog,
                "trigger_id": req.body.trigger_id
            })

        }, (error, response, body) => {
            console.log("ok: " + JSON.parse(body).ok);
            if (error || !JSON.parse(body).ok) {
                return console.dir(error + "ok: " + JSON.parse(body).ok);
            }
            console.dir(JSON.parse(body));
            res.send("Please, setup your Worldnet account.");
        });
    } catch (error) {
        console.log(error);
        res.send(localeService.i18n("errors.generic"));
    }
}

/**
 * This is the callback of openTerminalSetupDialog function.
 * It uses terminal number and secret informed by the user to
 * request the terminal configurations via Worldnet XML Gateway. 
 * 
 * If terminal is valid, it gets stored in database.
 * 
 * @param {HttpRequest} req 
 * @param {HttpResponse} res
 * @param {JSON} payload 
 */
exports.terminalSetupDialogCallback = (req, res, payload) => {
    console.log("[terminalSetupDialogCallback] payload=%s", JSON.stringify(payload));

    // Loading terminal configurations (Asyncronous)
    this.getTerminalConfiguration(payload.submission.terminal_number, payload.submission.terminal_secret)
        .then(terminalConfiguration => {
            
            // Parse XML into javascript Object
            let obj = CommonUtils.parseXml(terminalConfiguration);

            if (this.isValidTerminal(res, obj)) {
                try {
                    const terminal = Terminal({
                        _id: new mongoose.Types.ObjectId(),
                        terminalNumber: payload.submission.terminal_number,
                        displayName: payload.submission.display_name,
                        terminalSecret: payload.submission.terminal_secret,
                        showCvv: obj.TERMINAL_CONFIGURATION_RESPONSE.SECURITY_FRAUD.SHOW_CVV,
                        currency: obj.TERMINAL_CONFIGURATION_RESPONSE.BANK_SETTINGS.CURRENCY,
                        slackToken: payload.token
                    });

                    terminal.save().then(result => {
                        console.log("[Terminal Created] terminal=%s", result);

                        /**
                         * Following up after terminal setup to send 
                         * a payment request confirmation back to the caller.
                         */
                        request.post({
                            "url": payload.response_url,
                            "body": JSON.stringify(messages
                                .firstPaymentRequest(CommonUtils.terminalToJSON(result)))

                        }, (error, response, body) => {
                            console.log("ok: " + JSON.parse(body).ok);
                            if (error || !JSON.parse(body).ok) {
                                return console.dir(error + "ok: " + JSON.parse(body).ok);
                            }
                            res.send();
                        });

                    }).catch(err => {
                        console.log(err);
                        res.send(localeService.i18n("errors.generic"));
                    });
                } catch (error) {
                    console.log(error);
                    res.send(localeService.i18n("errors.generic"));
                }
            }
        });
}

/**
 * This method loads terminal configurations 
 * using Worldnet's XML Gateway.
 * 
 * @param {String} terminalNumber 
 * @param {String} terminalSecret 
 */
exports.getTerminalConfiguration = async (terminalNumber, terminalSecret) => {
    const xmlRequest = new TerminalConfiguration(terminalNumber, terminalSecret).xml();
    console.log("[TERMINAL CONFIGURATION REQUEST] %s", xmlRequest);

    return rp({       
        method: 'POST',
        uri: Constants.WORLDNET_GATEWAY_ENDPOINT,
        body: xmlRequest
    }).then(function (parsedBody) {
        console.log("[TERMINAL CONFIGURATION RESPONSE] %s", parsedBody);
        return parsedBody;
    }).catch(function (err) {
        return console.dir(err);
    });
}

/**
 * 
 * @param {HttpResponse} res 
 * @param {Object} terminalConfiguration 
 */
exports.isValidTerminal = (res, terminalConfiguration) => {
    if(terminalConfiguration.ERROR) {
        res.send(terminalConfiguration.ERROR.ERRORSTRING);
        return false;
    } else {
        let bankSettings = terminalConfiguration
            .TERMINAL_CONFIGURATION_RESPONSE.BANK_SETTINGS;

        if(!bankSettings.ALLOW_INTERNET) {
            console.log("Terminal doesn't support Internet transactions.");
            res.send("Terminal doesn't support Internet transactions.");
            return false;
        }
    }

    return true;
}