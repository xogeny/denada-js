/* This code is for testing the rule parser */

var ruleGrammar = require("../lib/src/ruleGrammar");
var assert = require("assert");

describe("Test rule parsing", function() {
    it("should recognize plain rules", function(done) {
        var result = ruleGrammar.parse("name");
        assert.equal(result.recursive, false);
        assert.equal(result.name, "name");
        assert.equal(result.min, 1);
        assert.equal(result.max, 1);
        done();
    });
    it("should recognize recursive rules", function(done) {
        var result = ruleGrammar.parse("^xyz");
        assert.equal(result.recursive, true);
        assert.equal(result.name, "xyz");
        assert.equal(result.min, 1);
        assert.equal(result.max, 1);
        done();
    });
    it("should recognize optional rules", function(done) {
        var result = ruleGrammar.parse("xyz?");
        assert.equal(result.recursive, false);
        assert.equal(result.name, "xyz");
        assert.equal(result.min, 0);
        assert.equal(result.max, 1);
        done();
    });
    it("should recognize *-rules", function(done) {
        var result = ruleGrammar.parse("xyz*");
        assert.equal(result.recursive, false);
        assert.equal(result.name, "xyz");
        assert.equal(result.min, 0);
        assert.equal(result.max, undefined);
        done();
    });
    it("should recognize +-rules", function(done) {
        var result = ruleGrammar.parse("xyz+");
        assert.equal(result.recursive, false);
        assert.equal(result.name, "xyz");
        assert.equal(result.min, 1);
        assert.equal(result.max, undefined);
        done();
    });
});
