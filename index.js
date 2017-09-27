var express = require('express');
var app = express();
var prompt = require('prompt');
var colors = require('colors/safe');
var myCard = require('./myCard');
var myAddress = require('./myAddress');
var myDetails = require('./myDetails');

var api = "pizzapi"; // set api version either 'dominos' (real) or 'pizzapi (dev)
console.log(api === "pizzapi" ? "Running development api (no transactions)... \n" :
    colors.red("Running production api (transactions enabled) \n"));
var pizzapi = require(api); // or with payment option use require('dominos');

var error = colors.red;
var warn = colors.yellow;
var success = colors.green;
var info = colors.cyan;
var debug = colors.blue;
var funky = colors.rainbow;
var ask = colors.gray;

var myStore;
const homeAddress = new pizzapi.Address(myAddress);

// console.log(homeAddress);
// console.log(myCard);
// console.log(myDetails);

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
var availableCouponCodes = []; // four digit codes, strings
var selectedCouponCodes = [];
var order;

console.log(warn('What is your zip code?'));
prompt.get(['zipCode'], function (err, result) {

    var myStoreNumber;

    pizzapi.Util.findNearbyStores(result.zipCode, 'Delivery',
        function (storeData) {
            myStoreData = storeData.result.Stores[0];
            myStoreNumber = myStoreData.StoreID;
            console.log(myStoreData);
            var myStoreInfo = {
                storeNumber: myStoreNumber,
                address: myStoreData.AddressDescription.split('\n').slice(0, 2).join(", "),
                phone: myStoreData.Phone,
                carryoutHours: myStoreData.ServiceHoursDescription.Carryout.split("\n").join(", "),
                deliveryHours: myStoreData.ServiceHoursDescription.Delivery.split("\n").join(", "),
                carryoutOpen: myStoreData.ServiceIsOpen.Carryout && myStoreData.AllowCarryoutOrders && myStoreData.IsOnlineCapable,
                deliveryOpen: myStoreData.ServiceIsOpen.Delivery && myStoreData.AllowDeliveryOrders && myStoreData.IsOnlineCapable
            }
            console.log(info("\nSelected store is: \n"), myStoreInfo, info("\n"));
            myStore = new pizzapi.Store({ ID: myStoreNumber });

            if (!myStoreData.IsOpen || !myStoreData.IsOnlineNow) {
                console.log(error("Looks like you can't place an order right now. Lucky you!\n\n"));
                return;
            } else {
                order = new pizzapi.Order({
                    customer: myDetails,
                    storeId: myStore.ID,
                    deliveryMethod: 'Delivery',
                    currency: 'USD',
                });
                myStore.getMenu(
                    function (menu) {
                        if (menu.result.Coupons) {
                            var coupons = menu.result.Coupons;
                            console.log(funky('Delivery Deals of the Day:\n'));
                            // console.log(coupons);

                            for (var item in coupons) {
                                if (coupons[item].Name.indexOf('Carryout') === -1) {
                                    availableCouponCodes.push(coupons[item].Code);
                                    console.log(info(
                                        coupons[item].Code, ":",
                                        coupons[item].Price,
                                        coupons[item].Name, "\n"
                                    ));
                                }
                            }

                            // ask if user wants to apply a coupon
                            console.log(warn('Would you like to add a coupon code?'));
                            prompt.get(['couponCode'], function (err, result) {
                                if (availableCouponCodes.indexOf(String(result.couponCode)) > -1) {
                                    selectedCouponCodes.push({ "Code": result.couponCode, "Qty": 1 });
                                    console.log('Coupon code', result.couponCode, "added.\n");
                                } else if (result.couponCode !== "n" && result.couponCode !== "no") {
                                    console.log(error('\nInvalid coupon code entered. Please continue with your order.'));
                                }

                                myStore.getFriendlyNames(
                                    function (menuData) {
                                        if (menuData.success) {
                                            // console.log(menuData);
                                            for (var item in menuData.result) {
                                                // console.log(menuData.result[item][Object.keys(menuData.result[item])].Name,
                                                // menuData.result[item][Object.keys(menuData.result[item])].Code);
                                            }
                                        }
                                    }
                                );
                                startOrder();
                            });
                        }
                    }
                );
            }
        }
    );
});

function pizzaFactory() {
    var crust = null;
    
    var crustSchema = {
        description: warn('What topping(s) would you like? (enter codes only, spaces separating) \n' +
            '\n0 - 10" Thin Crust \n1 - 12" Thin Crust \n2 - 14" Thin Crust' +
            '\n3 - 10" Hand Tossed \n4 - 12" Hand Tossed \n5 - 14" Hand Tossed' +
            '\n6 - 12" Pan Pizza \n7 - 14" Brooklyn Style Pizza' +
            '\n8 - 16" Brooklyn Style Pizza \n9 - 10" Gluten Free\n\n'),
        type: 'number',
        pattern: /[0-9]{0-9}/,
        message: colors.red.underline('You must choose a crust to order.'),
        hidden: false,
        required: true
    }

    var crust = null;
    var possibleCrust = ["10THIN", "12THIN", "14THIN", "10SCREEN", "12SCREEN", "14SCREEN",
        "P12IPAZA", "PBKIREZA", "P16IBKZA", "P10IGFZA"];

    prompt.get(crustSchema, function (err, res) {
        // res = { question: value }
        crust = possibleCrust[Number(res.question)];

        console.log('Crust:', crust);
        getToppings();
    });

    function getToppings() {
        var toppingsSchema = {
            description: warn('What topping(s) would you like? (enter codes only, spaces separating) \n' +
                '\nB - Beef \nDu - Chicken \nH - Ham \nK - Bacon \n P - Pepperoni \n' +
                'Pm - Philly cheese steak\n S - Italian Sausage \nSa - Salami\n' +
                'E - Cheddar Cheese \nCs - Parmesan Asiago \nZ - Banana Peppers \n' +
                'V - Green Olives \nJ - Jalapenos \nN - Pineapple (a terrible idea) \n' +
                'Rr - Roasted Red Peppers \nTd - Diced Tomatoes \nFe - Feta Cheese \n' +
                'Cp - Provolone \nR - Black Olives \nG - Green Peppers \nM - Mushrooms \n' +
                'O - Onions \nSi - Spinach \nHt - Hot Sauce\n\n'),
            type: 'string',
            // pattern: /[1-9]{1-9}/,
            message: colors.red.underline('You must choose options to order.'),
            hidden: false,
            required: true
        }

        var toppings = [];
        var possibleToppings = ["B", "C", "Du", "H", "K", "P", "Pm", "S", "Sa", "Si", "Ht",
            "E", "Cs", "Z", "V", "J", "N", "Rr", "Td", "Fe", "Cp", "R", "G", "M", "O"]

        prompt.get(toppingsSchema, function (err, res) {
            // res = { question: value }
            var opt = res.question.toString();
            // console.log(opt, typeof(opt));
            var options = opt.split(' ');
            options.forEach((o) => {
                if (possibleToppings.indexOf(o) > -1) {
                    toppings.push(o);
                }
            });

            console.log('Topping codes:', toppings);
            makePizza(crust, toppings);
        });
    }
}

function makePizza(code, options) {
    // var pizza = new pizzapi.Item({});
    var pizza = {};
    
    pizza.Code = code;
    pizza.Options = {
        C: { "1/1": "1" },
        X: { "1/1": "1" }
    };
    pizza.Qty = 1;

    options.forEach((o) => {
        pizza.Options[o] = { "1/1": "1" };
    });

    console.log(pizza);
    // order.addItem(pizza);
    order.Products.push(pizza);
    validateOrder(order);
}

function startOrder() {
    order.Coupons = selectedCouponCodes;

    promptForOrder();

    function promptForOrder() {
        var schema = {
            description: warn('What option(s) would you like? (enter numbers only, multiple OK) \n' +
                '\n1: WI Six Cheese pizza \n2: Pacific Veggie Pizza \n3: 8 hot wings \n4: Coke\n' +
                '5: Make your own pizza\n\n'),
            type: 'number',
            pattern: /[1-9]{1-9}/,
            message: colors.red.underline('You must choose options to order.'),
            hidden: false,
            required: true
        }

        var creatingPizzaFlag = false;

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
                    case "5":
                        creatingPizzaFlag = true;
                        order.addItem(pizzaFactory());
                        break;
                    default:
                        return;
                }
            });
            // order.addItem(gButter);
            // console.log('order before validate:');
            if (!order.Currency) {
                order.Currency = "USD";
            }

            if (!order.StoreID) {
                order.StoreID = myStore.ID;
            }

            // console.log(order);
            if (!creatingPizzaFlag) {
                validateOrder(order);
            }
        });
    }
}

function validateOrder(order) {
    order.validate(function (result) {
        if (result.success) {
            console.log(success('Order validated.'));
            console.log(order);
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
                description: warn('The price of this order will be ' + price +
                    '. OK to place order? (Enter yes or no)'),
                type: 'string',
                pattern: /^(y|yes|n|no)$/,
                message: error('Must enter yes or no!'),
                required: true
            }
            prompt.get(schema, function (err, res) {
                var opt = res.question;
                if (opt === "yes") {
                    if (api === "pizzapi") {
                        console.log(error("Development api does not support placing order. Please switch to dominos api to place a real order. Ending program."));
                        return;
                    }
                    placeOrder(validatedOrder);
                } else {
                    console.log(error("Aborting."));
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
    console.log(funky('Placing order...'));
    order.place(
        function (result) {
            console.log(funky('Now slow your roll and wait for the pizza!'));
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
