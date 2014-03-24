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
	assert.equal(rules.length, 2);
	done();
    });
    it("Example code should follow grammar", function (done) {
	var tree = denada.parseFileSync("test/samples/assets.dnd");
	var rules = denada.parseFileSync("test/samples/assetGrammar.dnd");
	var issues = denada.process(tree, rules);

	console.log(JSON.stringify(tree, undefined, 2));
	for(var i=0;i<issues.length;i++) console.log("Unexpected issue: "+issues[i]);
	assert.equal(issues.length, 0);
	done();
    });
});
