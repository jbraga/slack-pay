'use strict'

// Utility Modules
const Constants = require('../utils/constants');
const CommonUtils = require('../utils/common-utils');
// Dependence Injector Container
const container = require('../../container');
// Singleton instance of Locale Service
const localeService = container.resolve('localeService');

/**
 * Terminal Setup Dialog
 * @see terminal-ctrl#openTerminalSetupDialog
 */
exports.terminalSetupDialog = {
  "callback_id": Constants.TERMINAL_SETUP,
  "title": localeService.i18n('dialogs.terminal_setup.title'),
  "submit_label": localeService.i18n('buttons.save'),
  "elements": [
    {
      "label": localeService.i18n('dialogs.terminal_setup.terminal_number'),
      "name": "terminal_number",
      "type": "text"
    },
    {
      "label": localeService.i18n('dialogs.terminal_setup.display_name'),
      "name": "display_name",
      "type": "text"
    },
    {
      "label": localeService.i18n('dialogs.terminal_setup.terminal_secret'),
      "name": "terminal_secret",
      "type": "text"
    }
  ]
}

/**
 * Create Payment Request Dialog
 * @see payments-ctrl#openCreatePaymentRequestDialog
 */
exports.createPaymentRequestDialog = (terminals) => {
  return {
    "callback_id": Constants.CREATE_PAYMENT_REQUEST,
    "title": localeService.i18n('dialogs.payment_request.title'),
    "submit_label": localeService.i18n('buttons.charge'),
    "elements": [
      {
        "label": localeService.i18n('dialogs.payment_request.terminal'),
        "type": "select",
        "name": "terminal_number",
        "value": terminals[0].terminalNumber,
        "options": CommonUtils.buildTerminalSelectOptions(terminals)
      },
      {
        "label": localeService.i18n('dialogs.payment_request.amount'),
        "type": "text",
        "subtype": "number",
        "name": "txn_amount",
        "placeholder": "0.00"
      },
      {
        "label": localeService.i18n('dialogs.payment_request.description'),
        "type": "textarea", "max_length": 255,
        "name": "txn_description"
      }
    ]
  }
}

/**
 * Payment Details Dialog
 * @see payments-ctrl#openCardDetailsDialog
 */
exports.cardDetailsDialog = (paymentRequest) => {
  return {
    "callback_id": `${Constants.PAY_NOW}|${paymentRequest}`,
    "title": localeService.i18n('dialogs.payment_details.title'),
    "submit_label": localeService.i18n('buttons.pay'),
    "notify_on_cancel" : true,
    "elements": [
      {
        "label": localeService.i18n('dialogs.payment_details.card_type'),
        "name": "card_type",
        "type": "select",
        "data_source": "external",
        "min_query_length": 0
      },
      {
        "label": localeService.i18n('dialogs.payment_details.card_number'),
        "type": "text", "min_length": 16, "max_length": 19,
        "subtype": "number",
        "name": "card_number"
      },
      {
        "label": localeService.i18n('dialogs.payment_details.cardholder_name'),
        "type": "text",
        "name": "cardholder_name"
      },
      {
        "label":localeService.i18n('dialogs.payment_details.expiry_date'),
        "type": "text", "min_length": 5, "max_length": 5,
        "placeholder": "MM/YY",
        "name": "expiry_date"
      },
      {
        "label": localeService.i18n('dialogs.payment_details.cvv'),
        "type": "text", "min_length": 3, "max_length": 4,
        "subtype": "number",
        "name": "cvv"
      }
    ]
  }
}

