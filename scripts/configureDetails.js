// configure personal details
var fs = require('fs');
var prompt = require('prompt');
prompt.start();

module.exports = function (address, resolve) {
    var details = {
        address: address,
        firstName: "",
        lastName: "",
        phone: "",
        email: ""
    }

    function getFirstName() {
        prompt.get(['What is your first name?\n'], function (err, result) {
            details.firstName = String(Object.values(result));
            getLastName();
        });
    }

    function getLastName() {
        prompt.get(['What is your last name?\n'], function (err, result) {
            details.lastName = String(Object.values(result));
            getPhone();
        });
    }

    function getPhone() {
        prompt.get(['What is your phone number?\n'], function (err, result) {
            details.phone = String(Object.values(result)).toUpperCase();
            getEmail();
        });
    }

    function getEmail() {
        prompt.get(['What is your email address?\n'], function (err, result) {
            details.email = Number(Object.values(result));
            writeFile();
        });
    }

    function writeFile() {
        fs.writeFile("./customer/myDetails.js", ("module.exports = " + JSON.stringify(details)), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("\nDetails file saved to './customer/myDetails.js'!\n\n");
            resolve();
        });
    }

    getFirstName();
}

