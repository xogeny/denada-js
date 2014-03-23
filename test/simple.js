/* Test some simple sample source */
var denada = require('../denada');
var assert = require('assert');

describe("Checking basic syntax", function() {
    it("should parse normal declarations", function(done) {
	var ast = denada.parse("Real x;")[0];
	assert.equal(ast.element, "declaration");
	assert.deepEqual(ast.qualifiers, []);
	assert.equal(ast.typename, "Real");
	assert.equal(ast.varname, "x");
	assert.equal(ast.description, undefined);
	done();
    });
    it("should parse qualified declarations", function(done) {
	var ast = denada.parse("@foo @'bar' Real x;")[0];
	assert.equal(ast.element, "declaration");
	assert.deepEqual(ast.qualifiers, ["foo", "bar"]);
	assert.equal(ast.typename, "Real");
	assert.equal(ast.varname, "x");
	assert.equal(ast.description, undefined);
	done();
    });
    it("should parse quoted types", function(done) {
	var ast = denada.parse("'Real' x;")[0];
	assert.equal(ast.element, "declaration");
	assert.deepEqual(ast.qualifiers, []);
	assert.equal(ast.typename, "Real");
	assert.equal(ast.varname, "x");
	assert.equal(ast.description, undefined);
	done();
    });
    it("should parse quoted variable names", function(done) {
	var ast = denada.parse("Real 'x';")[0];
	assert.equal(ast.element, "declaration");
	assert.deepEqual(ast.qualifiers, []);
	assert.equal(ast.typename, "Real");
	assert.equal(ast.varname, "x");
	assert.equal(ast.description, undefined);
	done();
    });
    it("should parse descriptive strings", function(done) {
	var ast = denada.parse('Real x "This is the variable x";')[0];
	assert.equal(ast.element, "declaration");
	assert.deepEqual(ast.qualifiers, []);
	assert.equal(ast.typename, "Real");
	assert.equal(ast.varname, "x");
	assert.equal(ast.description, "This is the variable x");
	done();
    });
});
