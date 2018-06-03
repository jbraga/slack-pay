const mongoose = require('mongoose');

const paymentRequestSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    orderId     : String,
    terminalNumber: String,
    description : String,
    txnAmount   : String,
    txnCurrency : String,
    responseCode: String,
    responseText: String,
    approvalCode: String
});

module.exports = 
    mongoose.model('PaymentRequest', paymentRequestSchema);