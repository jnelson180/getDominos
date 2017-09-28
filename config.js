var configureAddress = require('./configureAddress');
var configureDetails = require('./configureDetails');
var configureCard = require('./configureCard');

new Promise(function(resolve, reject) {
    configureAddress(resolve);
}).then(function(result, resolve) {
    return new Promise(function(resolve, reject) {
        configureDetails(result, resolve);
    })
        .then(function(result, resolve) {
            configureCard(result, resolve);
        }).catch(function(err) {
            console.log(err);
        });
}).catch(function(error) {
    console.log(error);
})