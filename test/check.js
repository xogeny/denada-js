var denada = require('../denada');
var assert = require('assert');

describe("Grammar 1", function() {
    it("should successfully check g1_test1", function(done) {
	var tree = denada.parseFileSync("test/samples/g1_test1.dnd");
	var rules = denada.parseFileSync("test/samples/grammar1.dnd");
	var ptree = denada.process(tree, rules);
	done();
    });
});
