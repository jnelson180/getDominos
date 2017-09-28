var colors = require('colors/safe');

module.exports = {
    error: function(input) { return colors.red(input) },
    warn: function(input) { return colors.yellow(input) },
    success: function(input) { return colors.green(input) },
    info: function(input) { return colors.cyan(input) },
    debug: function(input) { return colors.blue(input) },
    funky: function(input) { return colors.rainbow(input) },
    ask: function(input) { return colors.gray(input) },
}