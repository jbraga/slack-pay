'use strict'
const msgBuilder = require('slack-message-builder');

// Utility Modules
const Constants = require('../utils/constants');
const CommonUtils = require('../utils/common-utils');
// Dependence Injector Container
const container = require('../../container');
// Singleton instance of Locale Service
const localeService = container.resolve('localeService');

/**
 * 
 * @param {JSON} terminalJSON 
 */
exports.firstPaymentRequest = (terminalJSON) => {

    return msgBuilder()
        .text(localeService.i18n("messages.first_payment.title"))
        .attachment()
            .text(localeService.i18n("messages.first_payment.attachment"))
            .fallback(localeService.i18n("errors.generic"))
            .callbackId(Constants.FIRST_PAY_REQ_CONFIRMATION)
            .color(Constants.ATTACHMENT_COLOR)

            .button()
                .name(terminalJSON)
                .text(localeService.i18n("buttons.polite_yes") + " :money_mouth_face: ")
                .style("primary")
                .type("button")
                .value("YES")
            .end()

            .button()
                .name("No")
                .text(localeService.i18n("buttons.polite_no"))
                .type("button")
                .value("NO")
            .end()

        .end()
    .json();
}

/**
 * 
 * 
 * @param {JSON} payload 
 * @param {JSON} paymentRequest 
 */
exports.paymentConfirmation = (payload, paymentRequest) => {
    console.log(payload);

    let merchantUserId = `<@${payload.user.id}>`;

    return msgBuilder()
        .channel(payload.channel.id)
        .text(localeService.i18n("messages.payment_confirmation.title", merchantUserId))
        .attachment()
            .text(localeService.i18n("messages.payment_confirmation.attachment"))
            .fallback(localeService.i18n("errors.generic"))
            .callbackId(Constants.ACCEPT_CHARGE)
            .color(Constants.ATTACHMENT_COLOR)

            .fields([{},
                {
                    "title" : "Amount Due:",
                    "value" : CommonUtils.formatAmount(paymentRequest.txnAmount, paymentRequest.txnCurrency),
                    "short" : true
                },
                {
                    "title" : "Description:",
                    "value" : paymentRequest.description,
                    "short" : false
                }
            ])

            .button()
                .name(JSON.stringify(paymentRequest))
                .text(localeService.i18n("buttons.accept"))
                .style("primary")
                .type("button")
                .value("ACCEPT")
            .end()

            .button()
                .name("Decline")
                .text(localeService.i18n("buttons.decline"))
                .type("button")
                .value("DECLINE")
            .end()

            //.imageUrl("https://worldnettps.com/wp-content/uploads/worldnet_logo.svg")
            //.thumbUrl("https://worldnettps.com/wp-content/uploads/worldnet_logo.svg")
            .footer("Powered by *Worldnet TPS*")
            .footerIcon("https://worldnettps.com/wp-content/uploads/favicon.png")
        .end()
    .json();
}