var denada = require('../denada');
var assert = require('assert');

function shouldProcess(tree, rules) {
    var issues = denada.process(tree, rules);
    for(var i=0;i<issues.length; i++) {
	console.log("Unexpected issue: "+issues[i]);
    }
    assert.equal(issues.length, 0);
}

function shouldFail(tree, rules) {
    var issues = denada.process(tree, rules);
    assert.notEqual(issues.length, 0);
}

describe("Declaration failures", function() {
    it("should pass literal matches", function (done) {
	var tree = denada.parse("Real x;");
	var rules = denada.parse('Real x "realvar";');
	shouldProcess(tree, rules);
	done();
    });

    describe("Cardinality", function() {
	describe("Zero or more", function() {
	    var rules = denada.parse('_ x "realvar*";');

	    it("should pass for zero items and * cardinality", function (done) {
		var tree = denada.parse("");
		shouldProcess(tree, rules);
		done();
	    });

	    it("should pass for one items and * cardinality", function (done) {
		var tree = denada.parse("Real x;");
		shouldProcess(tree, rules);
		done();
	    });

	    it("should pass for two items and * cardinality", function (done) {
		var tree = denada.parse("Real x; Integer x;");
		shouldProcess(tree, rules);
		done();
	    });
	});
	describe("One or more", function() {
	    var rules = denada.parse('_ x "realvar+";');
	    
	    it("should fail for zero items and + cardinality", function (done) {
		var tree = denada.parse("");
		shouldFail(tree, rules);
		done();
	    });

	    it("should pass for one items and + cardinality", function (done) {
		var tree = denada.parse("Real x;");
		shouldProcess(tree, rules);
		done();
	    });

	    it("should pass for two items and + cardinality", function (done) {
		var tree = denada.parse("Real x; Integer x;");
		shouldProcess(tree, rules);
		done();
	    });
	});
	describe("Optional", function() {
	    var rules = denada.parse('_ x "realvar?";');
	    
	    it("should pass for zero items and ? cardinality", function (done) {
		var tree = denada.parse("");
		shouldProcess(tree, rules);
		done();
	    });

	    it("should pass for one items and ? cardinality", function (done) {
		var tree = denada.parse("Real x;");
		shouldProcess(tree, rules);
		done();
	    });

	    it("should fail for two items and ? cardinality", function (done) {
		var tree = denada.parse("Real x; Integer x;");
		shouldFail(tree, rules);
		done();
	    });
	});
	describe("Exactly one", function() {
	    var rules = denada.parse('_ x "realvar";');
	    
	    it("should fail for zero items and unit cardinality", function (done) {
		var tree = denada.parse("");
		shouldFail(tree, rules);
		done();
	    });

	    it("should pass for one item and unit cardinality", function (done) {
		var tree = denada.parse("Real x;");
		shouldProcess(tree, rules);
		done();
	    });

	    it("should fail for two items and unit cardinality", function (done) {
		var tree = denada.parse("Real x; Integer x;");
		shouldFail(tree, rules);
		done();
	    });
	});
    });

    describe("Types", function() {
	it("should pass typename matches using wildcard", function (done) {
	    var tree = denada.parse("Real x;");
	    var rules = denada.parse('_ x "realvar";');
	    shouldProcess(tree, rules);
	    done();
	});

	it("should pass typename matches using regexp", function (done) {
	    var tree = denada.parse("Real x; Rigid z; Really y;");
	    var rules = denada.parse("'R.*'"+' _ "realvar+";');
	    shouldProcess(tree, rules);
	    done();
	});

	it("should fail when typenames can't match", function (done) {
	    var tree = denada.parse("Integer y;");
	    var rules = denada.parse('Real y "realvar";');
	    shouldFail(tree, rules);
	    done();
	});

	it("should fail when typenames patterns don't match", function (done) {
	    var tree = denada.parse("Integer y;");
	    var rules = denada.parse("'Real|String'"+' y "realvar";');
	    shouldFail(tree, rules);
	    done();
	});
    });

    describe("Variables", function() {
	it("should pass varname matches using patterns", function (done) {
	    var tree = denada.parse("Real x;");
	    var rules = denada.parse('Real _ "realvar";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should fail when varnames can't match", function (done) {
	    var tree = denada.parse("Real x;");
	    var rules = denada.parse('Real y "realvar";');
	    shouldFail(tree, rules);
	    done();
	});
    });

    describe("Values", function() {
	it("should pass value matches exactly", function (done) {
	    var tree = denada.parse("Real x = 1;");
	    var rules = denada.parse('Real x = 1 "realvar";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should fail when values can't match", function (done) {
	    var tree = denada.parse("Real x = 1;");
	    var rules = denada.parse('Real x = 2 "realvar";');
	    shouldFail(tree, rules);
	    done();
	});
    });
});

/*
describe("Grammar 1", function() {
    it("should successfully check g1_test1", function(done) {
	var tree = denada.parseFileSync("test/samples/g1_test1.dnd");
	var rules = denada.parseFileSync("test/samples/grammar1.dnd");
	var issues = denada.process(tree, rules);

	for(var i=0;i<issues.length;i++) { console.log(issues[i]); }
	assert.deepEqual(issues, []);

	var x = ptree[0];
	console.log(x);
	assert.equal(x.varname, "x");
	assert.equal(x.match.rulename, "realvar");
	assert.equal(x.match.count, 0);

	var y = ptree[1];
	assert.equal(y.varname, "y");
	assert.equal(y.match.rulename, "realvar");
	assert.equal(y.match.count, 1);

	var a_b = ptree[2];
	assert.equal(a_b.varname, "a.b");
	assert.equal(a_b.match.rulename, "intvar");
	assert.equal(a_b.match.count, 0);

	var c = ptree[3];
	assert.equal(c.varname, "c");
	assert.equal(c.match.rulename, "boolvar");
	assert.equal(c.match.count, 0);

	var opt = ptree[4];
	assert.equal(opt.varname, "opt");
	assert.equal(opt.match.rulename, "strvar");
	assert.equal(opt.match.count, 0);
	
	done();
    });
});
*/
