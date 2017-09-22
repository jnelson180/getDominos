var express = require('express');
var app = express();
var prompt = require('prompt');
var colors = require('colors/safe');
var myCard = require('./myCard');
var myAddress = require('./myAddress');
var myDetails = require('./myDetails');

var api = "pizzapi"; // set api version either 'dominos' (real) or 'pizzapi (dev)
console.log(api === "pizzapi" ? "Running development environment..." : colors.red("Running real-time app"));
var pizzapi = require(api); // or with payment option use require('dominos');

var error = colors.red;
var warn = colors.yellow;
var success = colors.green;
var info = colors.cyan;
var debug = colors.blue;
var funky = colors.rainbow;

var myStore;
const homeAddress = new pizzapi.Address(myAddress);

console.log(homeAddress);
console.log(myCard);
console.log(myDetails);

const myInfo = new pizzapi.Customer(myDetails);

const veg = new pizzapi.Item({
	code: 'P14ITHPV',
	options: [],
	quantity: 1
});

const chz = new pizzapi.Item({
	code: 'P14ITHCR',
	options: [],
	quantity: 1
});

const gButter = new pizzapi.Item({
	code: 'GARBUTTER',
	options: [],
	quantity: 1
});

const ranch = new pizzapi.Item({
	code: 'RANCH',
	options: [],
	quantity: 1
});

const hotWings = new pizzapi.Item({
	code: 'W08PHOTW',
	options: [],
	quantity: 1
});

const coke = new pizzapi.Item({
	code: '20BCOKE',
	options: [],
	quantity: 1
});

prompt.start();

var myStoreData;
console.log(colors.green('What is your zip code?'));
prompt.get(['zipCode'], function (err, result) {

	pizzapi.Util.findNearbyStores(result.zipCode, 'Delivery',
		function (storeData) {
			myStoreData = storeData.result.Stores[0];
			console.log(myStoreData);
			myStore = new pizzapi.Store({ ID: myStoreData.StoreID });
			console.log(info('For the record, your store number is' + myStoreData.StoreID + ". "));
			console.log(info("They are currently " + myStoreData.IsOpen && myStoreData.IsOnlineNow ? success("open and accepting orders!") : error("not available for online orders.")));
			if (!myStoreData.IsOpen || !myStoreData.IsOnlineNow) {
				console.log("Looks like you can't place an order right now. Lucky you!");
				return;
			} else {
				myStore.getFriendlyNames(
					function (menuData) {
						// if storeData.success...
						// console.log(menuData);
						// for (var item in menuData.result) {
						// console.log(menuData.result[item][Object.keys(menuData.result[item])].Name,
						// menuData.result[item][Object.keys(menuData.result[item])].Code);
						// }
					}
				);
				startOrder();
			}
		}
	);
});

function startOrder() {
	var order = new pizzapi.Order({
		customer: myDetails,
		storeId: myStore.ID,
		deliveryMethod: 'Delivery',
		currency: 'USD'
	});

	promptForOrder();

	function promptForOrder() {
		var schema = {
			description: colors.cyan('What option(s) would you like? (enter numbers only, multiple OK) ' +
				'1: WI Six Cheese pizza, 2: Pacific Veggie Pizza, 3: 8 hot wings, 4: Coke'),     // Prompt displayed to the user. If not supplied name will be used. 
			type: 'number',                 // Specify the type of input to expect. 
			pattern: /[1-9]{1-9}/,                  // Regular expression that input must be valid against. 
			message: colors.red.underline('You must choose options to order.'), // Warning message to display if validation fails. 
			hidden: false,                        // If true, characters entered will either not be output to console or will be outputed using the `replace` string. 
			required: true     // If true, value entered must be non-empty.
		}

		prompt.get(schema, function (err, res) {
			// res = { question: value }
			var opt = res.question.toString();
			// console.log(opt, typeof(opt));
			var options = opt.split('');
			options.forEach((o) => {
				switch (o) {
					case "1":
						order.addItem(chz);
						break;
					case "2":
						order.addItem(veg);
						break;
					case "3":
						order.addItem(hotWings);
						break;
					case "4":
						order.addItem(coke);
						break;
					default:
						return;
				}
			});
			order.addItem(gButter);
			// console.log('order before validate:');
			order.Currency = "USD";
			order.StoreID = myStore.ID;
				
			console.log(order);
			validateOrder(order);
		});
	}
}

function validateOrder(order) {
	order.validate(function (result) {
		if (result.success) {
			console.log(colors.cyan('Order validated.'));
			priceOrder(order);
		} else {
			console.log(error("There was a problem with your order! Aborting!"));
		}
	});
}

function priceOrder(validatedOrder) {
	var price = undefined;
	var pricedOrder;
	validatedOrder.price(function (result) {
		if (result.success) {
			pricedOrder = result;
			price = result.result.Order.Amounts.Customer;
			var schema = {
				description: colors.green('The price of this order will be ' + price +
					'. OK to place order? (Enter true or false)'),
				type: 'boolean',
				message: colors.red.underline('Must enter true or false!'),
				required: true
			}
			prompt.get(schema, function(err, res) {
				var opt = res.question;
				if (opt) {
					if (api === "pizzapi") {
						console.log(warn("Development api does not support placing order. Please switch to dominos api to place a real order. Ending program."));
						return;
					}
					placeOrder(validatedOrder);
				} else {
					console.log(warn("Aborting."));
				}
			});
		} else {
			console.log(error("There was a problem pricing your order! Aborting!"));
		}
	});
}

function placeOrder(order) {
	var cardInfo = new order.PaymentObject();
	var cardNumber = myCard.cardNumber;

	cardInfo.Expiration = myCard.expiration;//  01/15 just the numbers "01/15".replace(/\D/g,'');
	cardInfo.SecurityCode = myCard.securityCode;
	cardInfo.PostalCode = myCard.postalCode; // Billing Zipcode
	cardInfo.Amount = order.Amounts.Customer;
	cardInfo.Number = cardNumber;
	cardInfo.CardType = order.validateCC(cardNumber);

	console.log(cardInfo);
	//order.Payments.push(cardInfo);
	console.log('Placing order...');
	order.place(
		function(result) {
			console.log(colors.green('Now slow your roll and wait for the pizza!'));
			trackPizza(result.result.Order.OrderID);
		}
	);
}

function trackPizza(orderID) {
	pizzapi.Track.byId(
		myStoreData.StoreID,
		orderID,
		function (pizzaData) {
			console.log(pizzaData);
		}
	);
}
