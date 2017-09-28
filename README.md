# getDominos

## Order Dominos pizza from your terminal!

### Please be aware that this is in development.

#### You can currently place an order, but the nearest Dominos to your zip code (entered on npm start) is the one that is selected (and the only usable one) by default. You will need to verify that this is, in fact, correct.

#### You will be asked if the price is OK (and prompted the amount), then upon entering "true", your order will be placed (when not in the dev environment / using pizzapi module).

#### I assume no responsibility and/or liability for your willing use of this tool.


### In order to use this yourself, you will need to create a few files in your project directory (where index.js is):
###### OR you can run "npm config" in your terminal and it will walk you through the data entry and create these files for you.

##### myAddress.js
module.exports = {
	Street: 'Your address',
	City: 'City',
	Region: 'Two Letter State Code',
	PostalCode: '44444'
}

##### myDetails.js
var homeAddress = require('./myAddress');
module.exports = {
	address: homeAddress,
	firstName: 'First',
	lastName: 'Name',
	phone: '123-456-7890',
	email: 'email@email.com'
}

##### myCard.js
module.exports = {
	cardNumber: '1111111111111111',
	expiration: '2222',
	securityCode: '333',
	postalCode: '44444'
}