const mongoose = require('mongoose');

const terminalSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    terminalNumber: String,
    displayName: String,
    terminalSecret: String,
    showCvv: Boolean,
    currency: String,
    slackToken: String
});

module.exports = 
    mongoose.model('Terminal', terminalSchema);