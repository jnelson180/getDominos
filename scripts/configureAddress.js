// configure address info
var fs = require('fs');
var dir = './customer';
var prompt = require('prompt');

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

prompt.start();

module.exports = function (resolve) {
    var address = {
        Street: "",
        City: "",
        Region: "",
        PostalCode: ""
    }

    function getStreet() {
        prompt.get(['What is your street address (house / apartment number and street)?\n'], function (err, result) {
            address.Street = String(Object.values(result)[0]);
            getCity();
        });
    }

    function getCity() {
        prompt.get(['What is your city name?\n'], function (err, result) {
            address.City = String(Object.values(result)[0]);
            getRegion();
        });
    }

    function getRegion() {
        prompt.get(['What is your state (two letter abbreviation)?\n'], function (err, result) {
            address.Region = String(Object.values(result)[0]).toUpperCase();
            getPostal();
        });
    }

    function getPostal() {
        prompt.get(['What is your zip code?\n'], function (err, result) {
            address.PostalCode = String(Object.values(result)[0]);
            writeFile();
        });
    }

    function writeFile() {
        fs.writeFile("./customer/myAddress.js", ("module.exports = " + JSON.stringify(address)), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("Address file saved to './customer/myAddress.js'! \n\n");
            resolve(address);
        });
    }

    getStreet();
}

