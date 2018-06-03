'use strict'
const request = require("request");
const rp = require("request-promise");
const mongoose = require('mongoose');

// Payment Request XML Bind
const Payment = require('../payment-provider/xml-bind/Payment');
// PaymentRequest Mongo Schema
const PaymentRequest = require('../models/PaymentRequest');
// Terminal Controller
const terminalCtrl = require('./terminal-ctrl');
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
 * 
 * @param {HttpRequest} req 
 * @param {HttpResponse} res 
 * @param {JSON} payload 
 */
exports.openCardDetailsDialog = (req, res, payload) => {

    const paymentRequest = payload.actions[0].name;
    console.log(paymentRequest);

    try {
        request.post({
            "headers": {
                "Content-type": "application/json; charset=utf-8",
                "Authorization": Constants.TOKEN_BEARER
            },
            "url": Constants.OPEN_SLACK_DIALOG_URL,
            "body": JSON.stringify({
                "dialog": dialogs.cardDetailsDialog(paymentRequest),
                "trigger_id": payload.trigger_id
            })

        }, (error, response, body) => {
            console.log("ok: " + JSON.parse(body).ok);
            if (error || !JSON.parse(body).ok) {
                return console.dir("error: " + error + " body: " + body);
            }
            console.dir(JSON.parse(body));
            res.send(localeService.i18n("messages.enter_card_details"));
        });
    } catch (error) {
        console.log(error);
    }
}

/**
 * This is the callback of openCardDetailsDialog function.
 * 
 * @param {HttpRequest} req 
 * @param {HttpResponse} res 
 * @param {JSON} payload 
 * @param {String} callbackPayload
 */
exports.payment = (req, res, payload, callbackPayload) => {
    console.log("[payment] %s", payload);

    const paymentRequest = JSON.parse(callbackPayload);

    // Retrieve terminal's secret which is necessary to generate the request's digest
    terminalCtrl.getTerminalSecret(paymentRequest.terminalNumber).then(terminalSecret => {

        const xmlRequest = new Payment(
            paymentRequest.orderId,
            paymentRequest.terminalNumber,
            paymentRequest.txnAmount,
            payload.submission.card_number,
            payload.submission.card_type,
            payload.submission.expiry_date,
            payload.submission.cardholder_name,
            paymentRequest.txnCurrency,
            payload.submission.cvv,
            paymentRequest.description,
            terminalSecret).xml();

        console.log("[PAYMENT] %s", xmlRequest);

        return rp({
            method: 'POST',
            uri: Constants.WORLDNET_GATEWAY_ENDPOINT,
            body: xmlRequest
        }).then(function (parsedBody) {
            console.log("[PAYMENT RESPONSE] %s", parsedBody);
            this.handlePaymentResponse(paymentRequest, parsedBody);
        }).catch(function (err) {
            console.error(err);
            res.send(localeService.i18n("errors.generic"));
        });
    });
}

/**
 * When /charge is called and the caller has a configured terminal,
 * this function is called to generate the dialog where the payment request details will be filled in. 
 * 
 * @param {HttpRequest} req 
 * @param {HttpResponse} res 
 */
exports.openCreatePaymentRequestDialog = (req, res, terminals) => {
    console.log("[openCreatePaymentRequestDialog] body=%s" + JSON.stringify(req.body));

    let trigger_id = req.body.trigger_id
        // From slash command
        ? req.body.trigger_id
        // From interactive component
        : JSON.parse(req.body.payload).trigger_id;

    try {
        request.post({
            "headers": {
                "Content-type": "application/json; charset=utf-8",
                "Authorization": Constants.TOKEN_BEARER
            },
            "url": Constants.OPEN_SLACK_DIALOG_URL,
            "body": JSON.stringify({
                "dialog": dialogs.createPaymentRequestDialog(terminals),
                "trigger_id": trigger_id
            })

        }, (error, response, body) => {
            console.log("ok: " + JSON.parse(body).ok);
            if (error || !JSON.parse(body).ok) {
                return console.dir("error: " + error + " body: " + body);
            }
            console.dir(JSON.parse(body));
            res.send(localeService.i18n("messages.enter_payment_details"));
        });
    } catch (error) {
        console.error(error);
        res.send(localeService.i18n("errors.generic"));
    }
}

/**
 * This is the callback of openCreatePaymentRequestDialog function.
 * It uses the charging details informed to send a payment confirmation.
 * 
 * @param {HttpRequest} req 
 * @param {HttpResponse} res
 * @param {JSON} payload 
 */
exports.createPaymentRequestDialogCallback = (req, res, payload) => {
    console.log("[createPaymentRequestDialogCallback] %s", JSON.stringify(payload));

    try {
        const terminalNumber = payload.submission.terminal_number;

        // Retrieve terminal's secret necessary to generate request's digest
        terminalCtrl.getTerminalSecret(terminalNumber).then(terminalSecret => {
            console.log(terminalSecret);

            // Retrieve terminal configuration from Worldnet's XML Gateway API
            terminalCtrl.getTerminalConfiguration(terminalNumber, terminalSecret)
                .then(xmlResponse => {

                    // Parse response into a JS Object
                    let terminalConfiguration = CommonUtils.parseXml(xmlResponse);

                    /**
                     * If terminal is valid:
                     *  1. Persist payment request;
                     *  2. Send payment confirmation to customer.
                     */
                    if (terminalCtrl.isValidTerminal(res, terminalConfiguration)) {
                        this.savePaymentRequest(payload, terminalConfiguration)
                            .then(paymentRequest => {
                                this.sendPaymentConfirmation(res, payload, paymentRequest);
                            }).catch(err => {
                                console.error(err);
                                res.send(localeService.i18n("errors.generic"));
                            });
                    }
                });
        });

    } catch (error) {
        console.error(error);
        res.send(localeService.i18n("errors.generic"));
    }
}

/**
 * Create & Persist a Payment Request
 */
exports.savePaymentRequest = (payload, terminalConfiguration) => {

    const terminalCurrency = terminalConfiguration
        .TERMINAL_CONFIGURATION_RESPONSE.BANK_SETTINGS.CURRENCY;

    const paymentRequest = PaymentRequest({
        _id: new mongoose.Types.ObjectId(),
        orderId: CommonUtils.generateOrderId(),
        terminalNumber: payload.submission.terminal_number,
        description: payload.submission.txn_description,
        txnAmount: payload.submission.txn_amount,
        txnCurrency: terminalCurrency
    });

    return paymentRequest.save();
}

exports.handlePaymentResponse = (paymentRequest, xmlResponse) => {
    // Parse XML into javascript Object
    let response = CommonUtils.parseXml(terminalConfiguration);

    if(response.PAYMENTRESPONSE.RESPONSECODE == 'A') {

    } else {

    }
}

/**
 * Send payment confirmation.
 */
exports.sendPaymentConfirmation = (res, payload, paymentRequest) => {
    console.log("[Payment Request Created] paymentRequest=%s", paymentRequest);

    request.post({
        "headers": {
            "Content-type": "application/json; charset=utf-8",
            "Authorization": Constants.TOKEN_BEARER
        },
        "url": Constants.POST_SLACK_MESSAGE_URL,
        "body": JSON.stringify(messages.paymentConfirmation(payload, paymentRequest))

    }, (error, response, body) => {
        console.log("RESPONSE: " + body);
        if (error || !JSON.parse(body).ok) {
            return console.dir(error + " ok: " + JSON.parse(body).ok);
        }
        res.send();
    });
}