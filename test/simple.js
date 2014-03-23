/* Test some simple sample source */
var denada = require('../denada');

describe("Checking basic syntax", function() {
    it("should parse normal declarations", function(done) {
	var ast = denada.parse("Real x;");
	done();
    });
    it("should parse quoted types", function(done) {
	var ast = denada.parse("'Real' x;");
	done();
    });
    it("should parse quoted variable names", function(done) {
	var ast = denada.parse("Real 'x';");
	done();
    });
    it("should parse descriptive strings", function(done) {
	var ast = denada.parse('Real x "This is the variable x";');
	done();
    });
});
