const BaseEntity = require('./BaseEntity');
const CommonUtils = require('../../utils/common-utils');

/**
 * Terminal Configuration Request
 */
module.exports = class TerminalConfiguration extends BaseEntity {

    constructor(TERMINALID, SECRET) {
        super();
        this.TERMINALID = TERMINALID;
        this.DATETIME = CommonUtils.formatDateTime(new Date());
        this.HASH = this.buildDigest(SECRET);
    }

    _getRootName() {
        return "TERMINAL_CONFIGURATION";
    }

    _getStringsToHash(SECRET) {
        return [this.TERMINALID, this.DATETIME, SECRET];
    }
}