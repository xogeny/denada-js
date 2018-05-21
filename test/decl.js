/* Test some simple sample source */
var denada = require("../lib/src/denada");
var assert = require("assert");

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
    it("should parse declarations with empty modifiers", function(done) {
        var ast = denada.parse("Real x();")[0];
        assert.equal(ast.element, "declaration");
        assert.deepEqual(ast.qualifiers, []);
        assert.deepEqual(ast.modifiers, {});
        assert.equal(ast.typename, "Real");
        assert.equal(ast.varname, "x");
        assert.equal(ast.description, undefined);
        done();
    });
    it("should parse declarations with modifiers", function(done) {
        var ast = denada.parse("Real x(y=5,z=true);")[0];
        assert.equal(ast.element, "declaration");
        assert.deepEqual(ast.qualifiers, []);
        assert.deepEqual(ast.modifiers, { y: 5, z: true });
        assert.equal(ast.typename, "Real");
        assert.equal(ast.varname, "x");
        assert.equal(ast.description, undefined);
        done();
    });
    it("should parse declarations with modifiers with strings", function(done) {
        var ast = denada.parse('Real x(y=5,z="true");')[0];
        assert.equal(ast.element, "declaration");
        assert.deepEqual(ast.qualifiers, []);
        assert.deepEqual(ast.modifiers, { y: 5, z: "true" });
        assert.equal(ast.typename, "Real");
        assert.equal(ast.varname, "x");
        assert.equal(ast.description, undefined);
        done();
    });
    it("should parse declarations with assignment", function(done) {
        var ast = denada.parse("Real x = 5;")[0];
        assert.equal(ast.element, "declaration");
        assert.deepEqual(ast.qualifiers, []);
        assert.equal(ast.typename, "Real");
        assert.equal(ast.varname, "x");
        assert.equal(ast.value, 5);
        assert.equal(ast.description, undefined);
        done();
    });
    it("should parse declarations with object assignment", function(done) {
        var ast = denada.parse('Real x = {"z": 5};')[0];
        assert.equal(ast.element, "declaration");
        assert.deepEqual(ast.qualifiers, []);
        assert.equal(ast.typename, "Real");
        assert.equal(ast.varname, "x");
        assert.deepEqual(ast.value, { z: 5 });
        assert.equal(ast.description, undefined);
        done();
    });
    it("should parse qualified declarations", function(done) {
        var ast = denada.parse("foo 'bar' Real x;")[0];
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
