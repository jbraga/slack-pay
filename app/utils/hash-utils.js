'use strict'
const crypto = require('crypto');

const HASH_SEPARTOR = ':';

exports.hexDigest = (stringsToHash) => {
    console.log("[String to Hash] %s", stringsToHash.join(':'));
    return crypto.createHash('sha512').update(stringsToHash.join(':')).digest('hex');
}