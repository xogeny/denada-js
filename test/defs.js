/* Test some simple sample source */
var denada = require("../lib/src/denada");
var assert = require("assert");

describe("Checking definition syntax", function() {
    it("should parse qualified empty definitions", function(done) {
        var ast = denada.parse("class X {}")[0];
        assert.equal(ast.element, "definition");
        assert.deepEqual(ast.qualifiers, ["class"]);
        assert.equal(ast.name, "X");
        assert.equal(ast.description, null);
        done();
    });

    it("should parse unqualified empty definitions", function(done) {
        var ast = denada.parse("start {}")[0];
        assert.equal(ast.element, "definition");
        assert.deepEqual(ast.qualifiers, []);
        assert.equal(ast.name, "start");
        assert.equal(ast.description, null);
        done();
    });

    it("should parse documented definitions", function(done) {
        var ast = denada.parse('start "comment" { }')[0];
        assert.equal(ast.element, "definition");
        assert.deepEqual(ast.qualifiers, []);
        assert.equal(ast.name, "start");
        assert.equal(ast.description, "comment");
        done();
    });
});
