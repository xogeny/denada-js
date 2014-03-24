/* Test some simple sample source */
var denada = require('../denada');
var assert = require('assert');

describe("Grammar", function() {
    it("should be able to parse a grammar declaration", function(done) {
	var ast = denada.parse('parameter ".*" "p_nohints*";')[0];
	assert.equal(ast.element, "declaration");
	done();
    });
    it("should be able to parse a grammar declaration w/assignment", function(done) {
	var ast = denada.parse('parameter ".*" = {"label": "string"} "p_hints*";')[0];
	assert.equal(ast.element, "declaration");
	done();
    });
    it("should be able to parse interface definition", function(done) {
	var ast = denada.parse('interface "interface*" { Real x; }')[0];
	assert.equal(ast.element, "definition");
	done();
    });
    it("should be able to parse panel definition", function(done) {
	var ast = denada.parse('panel "panel*" { Real x; }')[0];
	assert.equal(ast.element, "definition");
	done();
    });
    it("should be able to parse a grammar", function(done) {
	var ast = denada.parse('\
interface "interface*" {\
  panel "panel*" {\
    parameter ".*" "p_nohints*";\
    parameter ".*" = {"label": "string"} "p_hints*";\
  }\
}\
')[0];
	assert.equal(ast.element, "definition");
	assert.deepEqual(ast.qualifiers, []);
	assert.equal(ast.name, "interface");
	assert.equal(ast.description, "interface*");
	done();
    });
});
