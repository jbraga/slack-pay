const BaseEntity = require('./BaseEntity');
const CommonUtils = require('../../utils/common-utils');

/**
 * Payment XML Request
 * 
  <xs:element name="PAYMENT">
    <xs:complexType>
      <xs:sequence>
        <xs:element ref="ORDERID" />
        <xs:element ref="TERMINALID" />
        <xs:element ref="AMOUNT" />
        <xs:element ref="DATETIME" />
        <xs:choice minOccurs="1" maxOccurs="1">
            <xs:element ref="TRACKDATA" />
            <xs:element ref="CARDNUMBER" />
            <xs:element ref="DUKPTCARDDETAILS"/>
            <xs:element ref="APPLEPAYLOAD"/>
            <xs:element ref="ANDROIDPAYLOAD"/>
            <xs:element ref="GOOGLEPAYLOAD"/>
            <xs:element ref="ENCRYPTEDPAYLOAD"/>
        </xs:choice>
        <xs:element ref="CARDTYPE" />
        <xs:element ref="CARDEXPIRY" minOccurs="0" />
        <xs:element ref="CARDHOLDERNAME" minOccurs="0" />
        <xs:element ref="HASH" />
        <xs:element ref="CURRENCY" />
        <xs:element ref="FOREIGNCURRENCYINFORMATION" minOccurs="0" />
        <xs:element ref="TERMINALTYPE" />
        <xs:element ref="TRANSACTIONTYPE" />
        <xs:element ref="AUTOREADY" minOccurs="0" />
        <xs:element ref="EMAIL" minOccurs="0" />
        <xs:element ref="CVV" minOccurs="0" />
        <xs:element ref="ISSUENO" minOccurs="0" />
        <xs:element ref="ADDRESS1" minOccurs="0" />
        <xs:element ref="ADDRESS2" minOccurs="0" />
        <xs:element ref="POSTCODE" minOccurs="0" />
        <xs:element ref="BILLTOFIRSTNAME" minOccurs="0" maxOccurs="1"/>
        <xs:element ref="BILLTOLASTNAME" minOccurs="0" maxOccurs="1"/>
        <xs:element ref="AVSONLY" minOccurs="0" />
        <xs:element ref="DESCRIPTION" minOccurs="0" />
        <xs:element ref="XID" minOccurs="0" />
        <xs:element ref="CAVV" minOccurs="0" />
        <xs:element ref="MPIREF" minOccurs="0"/>
        <xs:element ref="MOBILENUMBER" minOccurs="0"/>
        <xs:element ref="DEVICEID" minOccurs="0"/>
        <xs:element ref="PHONE" minOccurs="0"/>
        <xs:element ref="CITY" minOccurs="0"/>
        <xs:element ref="REGION" minOccurs="0"/>
        <xs:element ref="COUNTRY" minOccurs="0"/>
        <xs:element ref="IPADDRESS" minOccurs="0"/>
        <xs:element ref="SIGNATURE" minOccurs="0"/>
        <xs:element ref="CUSTOMFIELD" minOccurs="0" maxOccurs="30"/>
        <xs:element name="RECURRINGTXNREF" type="UID" minOccurs="0" maxOccurs="1"/>
        <xs:element ref="LEVEL_2_DATA" minOccurs="0" maxOccurs="1" />
        <xs:element ref="FRAUDREVIEWSESSIONID" minOccurs="0" maxOccurs="1" />
      </xs:sequence>
    </xs:complexType>
  </xs:element>
 */
module.exports = class Payment extends BaseEntity {
    
    constructor(ORDERID, TERMINALID, AMOUNT, CARDNUMBER, CARDTYPE,
          CARDEXPIRY, CARDHOLDERNAME, CURRENCY, CVV, DESCRIPTION, SECRET) {
        super();
        this.ORDERID = ORDERID;
        this.TERMINALID = TERMINALID;
        this.AMOUNT = AMOUNT;
        this.DATETIME = CommonUtils.formatDateTime(new Date());
        this.CARDNUMBER = CARDNUMBER;
        this.CARDTYPE = CARDTYPE;
        this.CARDEXPIRY = CARDEXPIRY.replace("/", "");
        this.CARDHOLDERNAME = CARDHOLDERNAME;
        this.HASH = this.buildDigest(SECRET);
        this.CURRENCY = CURRENCY;
        this.TERMINALTYPE = 1;    // 
        this.TRANSACTIONTYPE = 7; // Internet
        this.CVV = CVV;
        this.DESCRIPTION = DESCRIPTION;
    }
    
    _getRootName() {
        return "PAYMENT";
    }

    _getStringsToHash(SECRET) {
        return [this.TERMINALID, this.ORDERID, this.AMOUNT, this.DATETIME, SECRET];
    }
}