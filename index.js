var express = require('express');
var app = express();
var prompt = require('prompt');
var colors = require('./colors');
var myCard = require('./data/myCard');
var myDetails = require('./data/myDetails');
var createOrder = require('./createOrder').createOrder;
var api = "pizzapi"; // set api version either 'dominos' (real) or 'pizzapi (dev)
console.log(api === "pizzapi" ? "Running development api (no transactions)... \n" :
    colors.red("Running production api (transactions enabled) \n"));
var pizzapi = require(api); // or with payment option use require('dominos');

createOrder();