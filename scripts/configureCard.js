// configure card details
var fs = require('fs');
var prompt = require('prompt');
prompt.start();

module.exports = function (resolve) {
    var card = {
        cardNumber: "",
        expiration: "",
        securityCode: "",
        postalCode: ""
    }

    function getCardNumber() {
        prompt.get(['What is your card number (Visa, Mastercard, American Express, Discover)?\n'], function (err, result) {
            card.cardNumber = String(Object.values(result));
            getExpiration();
        });
    }

    function getExpiration() {
        prompt.get(['What is your card expiration date (MMYY, no slashes)?\n'], function (err, result) {
            card.expiration = String(Object.values(result));
            getSecurityCode();
        });
    }

    function getSecurityCode() {
        prompt.get(['What is the security code (3-4 digits on the back of the card)?\n'], function (err, result) {
            card.securityCode = String(Object.values(result)).toUpperCase();
            getPostalCode();
        });
    }

    function getPostalCode() {
        prompt.get(['What is your billing postal code?\n'], function (err, result) {
            card.postalCode = Number(Object.values(result));
            writeFile();
        });
    }

    function writeFile() {
        fs.writeFile("./customer/myCard.js", ("module.exports = " + JSON.stringify(card)), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("\nCard details file saved to './customer/myCard.js'!\n\n");
        });
    }

    getCardNumber();
}

