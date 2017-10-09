const api = "pizzapi"; // set api version either 'dominos' (real) or 'pizzapi (dev)
const myAddress = require('./customer/myAddress');
const myDetails = require('./customer/myDetails');
const myCard = require('./customer/myCard');
const items = require('./data/items');
const strip = require('stripmargin').stripMargin;
const colors = require('./colors');
const prompt = require('prompt');
const pizzapi = require(api);

const homeAddress = new pizzapi.Address(myAddress);
const myInfo = new pizzapi.Customer(myDetails);
const success = colors.success;
const funky = colors.funky;
const error = colors.error;
const warn = colors.warn;
const info = colors.info;
const ask = colors.ask;

let availableCouponCodes = []; // four digit codes, strings
let selectedCouponCodes = [];
let myStoreData;
let myStore;
let order;

// welcome user to app
console.log(api === "pizzapi" ? "Running development api (no transactions)... \n" :
    colors.error("Running production api (transactions enabled) \n"));

console.log(funky('Hi ' + myDetails.firstName + "! Welcome to the unofficial Dominos terminal script!"));

prompt.start();

module.exports = {
    createOrder: function () {
        let myStoreNumber;
        function getStoreInfo() {
            pizzapi.Util.findNearbyStores(myAddress.PostalCode, 'Delivery',
                function (storeData) {
                    myStoreData = storeData.result.Stores[0];
                    myStoreNumber = myStoreData.StoreID;
                    let myStoreInfo = {
                        storeNumber: myStoreNumber,
                        address: myStoreData.AddressDescription.split('\n').slice(0, 2).join(", "),
                        phone: myStoreData.Phone,
                        carryoutHours: myStoreData.ServiceHoursDescription.Carryout.split("\n").join(", "),
                        deliveryHours: myStoreData.ServiceHoursDescription.Delivery.split("\n").join(", "),
                        carryoutOpen: myStoreData.ServiceIsOpen.Carryout && myStoreData.AllowCarryoutOrders && myStoreData.IsOnlineCapable,
                        deliveryOpen: myStoreData.ServiceIsOpen.Delivery && myStoreData.AllowDeliveryOrders && myStoreData.IsOnlineCapable
                    }
                    console.log(info("\nSelected store is: \n"), myStoreInfo, info("\n\n"));
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
                                    const coupons = menu.result.Coupons;
                                    console.log(funky('Delivery Deals of the Day:\n'));
                                    // console.log(coupons);

                                    for (var item in coupons) {
                                        if (coupons[item].Name.indexOf('Carryout') === -1) {
                                            availableCouponCodes.push(coupons[item].Code);
                                            console.log(info(
                                                coupons[item].Code + ": " +
                                                coupons[item].Price + "- " +
                                                coupons[item].Name + "\n"
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
        }

        function pizzaFactory(callback) {
            let crust = null;
            let sauce = null;
            console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
            const crustSchema = {
                description: warn('What crust would you like? (enter codes only, spaces separating) \n' +
                    '\n0 - 10" Thin Crust \n1 - 12" Thin Crust \n2 - 14" Thin Crust' +
                    '\n3 - 10" Hand Tossed \n4 - 12" Hand Tossed \n5 - 14" Hand Tossed' +
                    '\n6 - 12" Pan Pizza \n7 - 14" Brooklyn Style Pizza' +
                    '\n8 - 16" Brooklyn Style Pizza \n9 - 10" Gluten Free\n\n'),
                type: 'number',
                pattern: /[0-9]{0-9}/,
                message: colors.error('You must choose a crust to order.'),
                hidden: false,
                required: true
            }

            const possibleCrust = ["10THIN", "12THIN", "14THIN", "10SCREEN", "12SCREEN", "14SCREEN",
                "P12IPAZA", "PBKIREZA", "P16IBKZA", "P10IGFZA"];

            prompt.get(crustSchema, function (err, res) {
                crust = possibleCrust[Number(res.question)];
                console.log('Crust:', crust + '\n');
                getSauce();
            });

            function getSauce() {
                console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
                const sauceSchema = {
                    description: warn('What sauce would you like? (enter code only) \n' +
                        '\n0 - Original / Robust Inspired Tomato Sauce \n1 - Hearty Marinara ' +
                        '\n2 - Barbeque Sauce \n3 - Garlic Parmesan White Sauce \n4 - Alfredo Sauce\n\n'),
                    type: 'number',
                    pattern: /[0-9]{0-9}/,
                    message: colors.error('You must choose a sauce to order.'),
                    hidden: false,
                    required: true
                }

                const possibleSauce = ["X", "Xm", "Bq", "Xw", "Xf"];

                prompt.get(sauceSchema, function (err, res) {
                    sauce = possibleSauce[Number(res.question)];
                    console.log('Sauce:', sauce + '\n');
                    getToppings();
                });
            }

            function getToppings() {
                console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
                const toppingsSchema = {
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
                    message: colors.error('You must choose options to order.'),
                    hidden: false,
                    required: true
                }

                let toppings = [];
                const possibleToppings = ["B", "C", "Du", "H", "K", "P", "Pm", "S", "Sa", "Si", "Ht",
                    "E", "Cs", "Z", "V", "J", "N", "Rr", "Td", "Fe", "Cp", "R", "G", "M", "O"]

                prompt.get(toppingsSchema, function (err, res) {
                    const options = res.question.toString().split(' ');
                    options.forEach((o) => {
                        if (possibleToppings.indexOf(o) > -1) {
                            toppings.push(o);
                        }
                    });

                    console.log('Topping codes:', toppings + '\n');
                    makePizza(crust, sauce, toppings, callback);
                });
            }
        }

        function makePizza(code, sauce, toppings, callback) {
            let pizza = {};

            pizza.Code = code;
            pizza.Options = {
                C: { "1/1": "1" }
            };
            pizza.Qty = 1;

            toppings.forEach((o) => {
                pizza.Options[o] = { "1/1": "1" };
            });

            pizza.Options[sauce] = { "1/1": "1" };


            console.log(pizza.Options);
            // order.addItem(pizza);
            order.Products.push(pizza);
            callback();
        }

        function startOrder() {
            order.Coupons = selectedCouponCodes;

            if (!order.Currency) {
                order.Currency = "USD";
            }

            if (!order.StoreID) {
                order.StoreID = myStore.ID;
            }

            promptForOrder();

            function promptForOrder() {
                console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n' + 
                    'Current order is:', order.Products.filter((i) => { return i; }).map((p) => {
                        return p.Code;
                    }), '\n');
                const schema = {
                    description: warn(strip(`What option would you like? (enter number only)

                        1: WI Six Cheese pizza
                        2: Pacific Veggie Pizza
                        3: 8 hot wings
                        4: Coke
                        5: 8 Piece Cinnamon Bread Twists
                        6. 2 Piece Chocolate Crunch Lava Cakes
                        7. Marbled Cookie Brownie
                        8. Chocolate Dipped Chocolate Chip Cookie
                        90: Make your own pizza
                        99: Price Order / Check Out 
                        
                        \n\n`)),
                    type: 'number',
                    pattern: /[0-9]+/,
                    message: colors.error('You must choose an option to order.\n\n'),
                    hidden: false,
                    required: true
                }

                var creatingPizzaFlag = false;

                prompt.get(schema, function (err, res) {
                    var option = res.question.toString().split(' ')[0];
                        switch (option) {
                            case "1":
                                order.addItem(items.chz);
                                promptForOrder();
                                break;
                            case "2":
                                order.addItem(items.veg);
                                promptForOrder();
                                break;
                            case "3":
                                order.addItem(items.hotWings);
                                promptForOrder();
                                break;
                            case "4":
                                order.addItem(items.coke);
                                promptForOrder();
                                break;
                            case "5":
                                order.addItem(items.cinnaBread);
                                promptForOrder();
                                break;
                            case "6":
                                order.addItem(items.crunchCakes);
                                promptForOrder();
                                break;
                            case "7":
                                order.addItem(items.marbleBrownie);
                                promptForOrder();
                                break;
                            case "8":
                                order.addItem(items.chocDippedCookie);
                                promptForOrder();
                                break;                                                                
                            case "90":
                                order.addItem(pizzaFactory(promptForOrder));
                                break;
                            case "99":
                                validateOrder(order);
                                return;
                            default:
                                promptForOrder();
                                return;
                        }
                });
            }
        }

        function validateOrder(order) {
            order.validate(function (result) {
                if (result.success) {
                    // console.log(order);
                    console.log(success('Order validated successfully. \n'));
                    priceOrder(order);
                } else {
                    console.log(error("There was a problem with your order! Aborting! \n"));
                }
            });
        }

        function priceOrder(validatedOrder) {
            let price = undefined;
            let pricedOrder;
            validatedOrder.price(function (result) {
                if (result.success) {
                    pricedOrder = result;
                    // console.log(result);
                    price = result.result.Order.Amounts.Customer;
                    waitTime = result.result.Order.EstimatedWaitMinutes;
                    const schema = {
                        description: warn('The price of this order will be ' + price +
                            ' and the estimated wait is ' + waitTime + ' minutes. OK to place order? (Enter yes or no) \n'),
                        type: 'string',
                        pattern: /^(y|yes|n|no)$/,
                        message: error('Must enter yes or no!'),
                        required: true
                    }
                    prompt.get(schema, function (err, res) {
                        const opt = res.question;
                        if (opt === "yes") {
                            if (api === "pizzapi") {
                                console.log(error("Development api does not support placing order. Please switch to dominos api to place a real order. Ending program. \n\n"));
                                return;
                            }
                            placeOrder(validatedOrder);
                        } else {
                            console.log(error("Aborting. \n"));
                        }
                    });
                } else {
                    console.log(error("There was a problem pricing your order! Aborting! \n"));
                }
            });
        }

        function placeOrder(order) {
            let cardInfo = new order.PaymentObject();
            const cardNumber = myCard.cardNumber;

            cardInfo.Expiration = myCard.expiration;//  01/15 just the numbers "01/15".replace(/\D/g,'');
            cardInfo.SecurityCode = myCard.securityCode;
            cardInfo.PostalCode = myCard.postalCode; // Billing Zipcode
            cardInfo.Amount = order.Amounts.Customer;
            cardInfo.Number = cardNumber;
            cardInfo.CardType = order.validateCC(cardNumber);

            console.log(funky('Placing order...\n\n'));
            order.place(
                function (result) {
                    console.log(funky('Now slow your roll and wait for the pizza! \n\n'));
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

        getStoreInfo();
    }
}