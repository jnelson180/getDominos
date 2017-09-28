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
        prompt.get(['What is your first name?'], function (err, result) {
            details.firstName = String(Object.values(result)[0]);
            getLastName();
        });
    }

    function getLastName() {
        prompt.get(['What is your last name?'], function (err, result) {
            details.lastName = String(Object.values(result)[0]);
            getPhone();
        });
    }

    function getPhone() {
        prompt.get(['What is your phone number?'], function (err, result) {
            details.phone = String(Object.values(result)[0]).toUpperCase();
            getEmail();
        });
    }

    function getEmail() {
        prompt.get(['What is your email address?'], function (err, result) {
            details.email = Number(Object.values(result)[0]);
            writeFile();
        });
    }

    function writeFile() {
        fs.writeFile("./myDetails.js", ("module.exports = " + JSON.stringify(details)), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("Details file saved to './myDetails.js'!\n\n");
            resolve();
        });
    }

    getFirstName();
}

