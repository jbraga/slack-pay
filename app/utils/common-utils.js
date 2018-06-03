'use strict'
const crypto = require('crypto');
const xmlParser = require('fast-xml-parser');
const dateFormatter = require('date-pattern');

const ORDERID_PREFIX = 'SLK_';
const DATE_TIME_FORMAT = "dd-MM-yyyy:HH:mm:ss:SSS";

/**
 * Generates Order ID as follows:
 * 
 * Prefix: SLK_
 * Body  : Current date time in millis
 * Suffix: 2-digits random cryptografic value
 */
exports.generateOrderId = () => {
    const cryptoSuffix = crypto.randomFillSync(new Uint8Array(1)).toString('hex');
    const orderId = `${ORDERID_PREFIX}${Date.now()}${cryptoSuffix}`;
    console.log("[GENERATED ORDER ID] %s", orderId);
    return orderId;
}

/**
 * It parses XML String to JS Object.
 * @param {String} xmlData
 */
exports.parseXml = (xmlData) => {
    return xmlParser.parse(xmlData);
}

/**
 * It builds terminal dropdown options
 * for payment request dialog.
 * @param {Array} terminals 
 */
exports.buildTerminalSelectOptions = (terminals) => {
    let options = [];
    
    terminals.forEach(terminal => {
        options.push({
            "label": this.terminalToString(terminal),
            "value": terminal.terminalNumber
        });
    });

    return options;
}

/**
 * Returns a friendly description of a terminal that 
 * contains terminal number, currency and display name.
 * 
 * @param {Object} terminal 
 */
exports.terminalToString = (terminal) => {
    return `${terminal.terminalNumber} ( ${terminal.currency} ) ${terminal.displayName}`
}

/**
 * Creates a stringfied-json representation of a terminal 
 * without any sensitive information.
 * 
 * @param {Object} terminal 
 */
exports.terminalToJSON = (terminal) => {
    return JSON.stringify({
        "terminalNumber": terminal.terminalNumber,
        "displayName": terminal.displayName,
        "currency": terminal.currency
    });
}

/**
 * TODO - dinamic locale
 * https://api.slack.com/changelog/2017-09-locale-locale-locale
 * 
 * @param {String} amount 
 * @param {String} currencyCode 
 */
exports.formatAmount = (amount, currencyCode) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
}

/**
 * Returns date in following format: dd-MM-yyyy:HH:mm:ss:SSS
 * @param {Date} dateTime 
 */
exports.formatDateTime = (dateTime) => {
    return dateFormatter.format(dateTime, DATE_TIME_FORMAT);
}
