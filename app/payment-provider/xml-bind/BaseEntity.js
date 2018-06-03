const xml2js = require('xml2js');
const HashUtils = require('../../utils/hash-utils');

module.exports = class BaseEntity {

    constructor() {}

    buildDigest(secret) {
        return HashUtils.hexDigest(this._getStringsToHash(secret));
    }

    xml() {
        return new xml2js
            .Builder({rootName: this._getRootName()})
            .buildObject(this);
    }
}