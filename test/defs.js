/* Test some simple sample source */
var denada = require('../denada');
var assert = require('assert');

describe("Checking definition syntax", function() {
    it("should parse qualified empty definitions", function(done) {
	var ast = denada.parse("@class X {}");
	assert.equal(ast.element, "definition");
	assert.deepEqual(ast.qualifiers, ["class"]);
	assert.equal(ast.name, "X");
	assert.equal(ast.definition, null);
	done();
    });

    it("should parse unqualified empty definitions", function(done) {
	var ast = denada.parse("start {}");
	assert.equal(ast.element, "definition");
	assert.deepEqual(ast.qualifiers, []);
	assert.equal(ast.name, "start");
	assert.equal(ast.definition, null);
	done();
    });

    it("should parse documented definitions", function(done) {
	var ast = denada.parse("start $comment$ { }");
	assert.equal(ast.element, "definition");
	assert.deepEqual(ast.qualifiers, []);
	assert.equal(ast.name, "start");
	assert.equal(ast.definition, "comment");
	done();
    });
});
