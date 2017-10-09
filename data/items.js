const pizzapi = require('pizzapi');

// preconfigured orders/items

module.exports = {
    veg: new pizzapi.Item({
        code: 'P14ITHPV',
        options: [],
        quantity: 1
    }),

    chz: new pizzapi.Item({
        code: 'P14ITHCR',
        options: [],
        quantity: 1
    }),

    gButter: new pizzapi.Item({
        code: 'GARBUTTER',
        options: [],
        quantity: 1
    }),

    ranch: new pizzapi.Item({
        code: 'RANCH',
        options: [],
        quantity: 1
    }),

    hotWings: new pizzapi.Item({
        code: 'W08PHOTW',
        options: [],
        quantity: 1
    }),

    coke: new pizzapi.Item({
        code: '20BCOKE',
        options: [],
        quantity: 1
    }),

    cinnaBread: new pizzapi.Item({
        code: 'B8PCCT',
        options: [],
        quantity: 1
    }),
    crunchCakes: new pizzapi.Item({
        code: 'B2PCLAVA',
        options: [],
        quantity: 1
    }),
    marbleBrownie: new pizzapi.Item({
        code: 'MARBRWNE',
        options: [],
        quantity: 1
    }),
    chocDippedCookie: new pizzapi.Item({
        code: 'REACCK',
        options: [],
        quantity: 1
    })
}