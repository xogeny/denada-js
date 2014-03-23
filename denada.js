var grammar = require('./grammar');

exports.parse = function(s) {
    return grammar.parse(s);
};

