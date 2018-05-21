var denada = require("../lib/src/denada");
var assert = require("assert");

describe("Property example", function() {
    it("Example code should parse", function(done) {
        var tree = denada.parseFileSync("test/samples/property.dnd");
        assert.equal(tree.length, 4);
        done();
    });
    it("Grammar should parse", function(done) {
        var rules = denada.parseFileSync("test/samples/propertyGrammar.dnd");
        assert.equal(rules.length, 3);
        done();
    });
    it("Example code should follow grammar", function(done) {
        var tree = denada.parseFileSync("test/samples/property.dnd");
        var rules = denada.parseFileSync("test/samples/propertyGrammar.dnd");
        var issues = denada.process(tree, rules);

        for (var i = 0; i < issues.length; i++) console.log("Unexpected issue: " + issues[i]);
        assert.equal(issues.length, 0);
        done();
    });
});
