var denada = require('../denada');
var assert = require('assert');

describe("Complex example", function() {
    it("should be able to parse complex example from a file, synchronously", function(done) {
	var contents = denada.parseFileSync('test/samples/complex.dnd');
	var X = contents[0];
	assert.equal(X.element, "definition");
	assert.equal(X.name, "X");
	assert.equal(X.description, null);
	assert.equal(X.contents.length, 1);
	done();
    });
});
