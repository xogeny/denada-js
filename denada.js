var grammar = require('./grammar');
var fs = require('fs');

exports.parse = function(s) {
    try {
	return grammar.parse(s);
    } catch(e) {
	throw {
	    message: "Syntax error on line "+e.line+" (column "+e.column+"): "+e.message
	};
    }
}

exports.parseFileSync = function(s) {
    var contents;
    contents = fs.readFileSync(s, 'utf8');
    return grammar.parse(contents);
}

exports.parseFile = function(s, callback) {
    fs.readFile(s, 'utf8', function(err, res) {
	var ast;
	if (err) callback(err);
	try {
	    ast = grammar.parse(res);
	    callback(undefined, ast);
	} catch(e) {
	    callback(e);
	}
    });
}
