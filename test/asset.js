var denada = require('../denada');
var assert = require('assert');

describe("Asset example", function() {
    it("Example code should parse", function (done) {
	var tree = denada.parseFileSync("test/samples/assets.dnd");
	assert.equal(tree.length, 3);
	done();
    });
    it("Grammar should parse", function (done) {
	var rules = denada.parseFileSync("test/samples/assetGrammar.dnd");
	assert.equal(rules.length, 3);
	done();
    });
    it("Example code should follow grammar", function (done) {
	var tree = denada.parseFileSync("test/samples/assets.dnd");
	var rules = denada.parseFileSync("test/samples/assetGrammar.dnd");
	var issues = denada.process(tree, rules);

	for(var i=0;i<issues.length;i++) console.log("Unexpected issue: "+issues[i]);
	assert.equal(issues.length, 0);
	done();
    });
});

describe("Asset errors", function() {
    it("should detect non-matching definitions", function(done) {
	var tree = denada.parseFileSync("test/samples/asset_error1.dnd");
	var rules = denada.parseFileSync("test/samples/assetGrammar.dnd");
	var issues = denada.process(tree, rules);

	assert.equal(issues.length, 1);
	done();
    });
    it("should detect mismatched assignment types", function(done) {
	var tree = denada.parseFileSync("test/samples/asset_error2.dnd");
	var rules = denada.parseFileSync("test/samples/assetGrammar.dnd");
	var issues = denada.process(tree, rules);

	assert.equal(issues.length, 2);
	done();
    });
    it("should detect invalid inner elements", function(done) {
	var tree = denada.parseFileSync("test/samples/asset_error3.dnd");
	var rules = denada.parseFileSync("test/samples/assetGrammar.dnd");
	var issues = denada.process(tree, rules);

	assert.equal(issues.length, 1);
	done();
    });
});
