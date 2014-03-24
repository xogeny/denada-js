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

function ruleInfo(node, name, count) {
    assert(node.hasOwnProperty("match"), "Node is missing match information");
    assert.equal(node.match.rulename, name);
    assert.equal(node.match.count, count);
}

describe("Declaration pattern handling", function() {
    it("should pass literal matches", function (done) {
	var tree = denada.parse("Real x;");
	var rules = denada.parse('Real x "realvar";');
	shouldProcess(tree, rules);
	done();
    });

    describe("Recursive rules", function() {
	it("should allow recursive rules", function(done) {
	    var tree = denada.parse("X { X {} }");
	    var rules = denada.parse('X "^X*" { }');
	    shouldProcess(tree, rules);
	    done();
	});
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
	it("should pass varname matches using wildcards", function (done) {
	    var tree = denada.parse("Real x;");
	    var rules = denada.parse('Real _ "realvar";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should pass varname matches using patterns", function (done) {
	    var tree = denada.parse("Real x;");
	    var rules = denada.parse('Real \'x|y|z\' "realvar";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should fail when varnames can't match", function (done) {
	    var tree = denada.parse("Real x;");
	    var rules = denada.parse('Real y "realvar";');
	    shouldFail(tree, rules);
	    done();
	});
	it("should fail when varname patterns don't match", function (done) {
	    var tree = denada.parse("Real x;");
	    var rules = denada.parse('Real \'a|b|c\' "realvar";');
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
	it("should pass value matches type", function (done) {
	    var tree = denada.parse("Real x = 1;");
	    var rules = denada.parse('Real x = \"$number\" "realvar";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should pass value matches type wildcard", function (done) {
	    var tree = denada.parse("Real x = 1;");
	    var rules = denada.parse('Real x = \"$_\" "realvar";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should pass value matches type pattern", function (done) {
	    var tree = denada.parse("Real x = 1;");
	    var rules = denada.parse('Real x = \"$number|boolean\" "realvar";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should fail when values can't match", function (done) {
	    var tree = denada.parse("Real x = 1;");
	    var rules = denada.parse('Real x = 2 "realvar";');
	    shouldFail(tree, rules);
	    done();
	});
	it("should fail when value patterns don't match", function (done) {
	    var tree = denada.parse("Real x = 1;");
	    var rules = denada.parse('Real x = \"$boolean\" "realvar";');
	    shouldFail(tree, rules);
	    done();
	});
    });
    describe("Qualifier", function() {
	it("should pass when qualifiers match exactly", function(done) {
	    var tree = denada.parse("@constant Real x;");
	    var rules = denada.parse('@constant Real x "realvar";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should pass when qualifiers match wildcard", function(done) {
	    var tree = denada.parse("@constant Real x; @volatile @discrete Real x;");
	    var rules = denada.parse('@_ Real x "realvar+";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should pass when qualifiers match patterns", function(done) {
	    var tree = denada.parse("@constant Real x; @volatile @discrete Real x;");
	    var rules = denada.parse('@\'constant|volatile|discrete\' Real x "realvar+";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should fail when qualifiers don't match exactly", function(done) {
	    var tree = denada.parse("@constant Real x;");
	    var rules = denada.parse('@parameter Real x "realvar";');
	    shouldFail(tree, rules);
	    done();
	});
	it("should pass when qualifiers don't match patterns", function(done) {
	    var tree = denada.parse("@continuous Real x; @volatile @discrete Real x;");
	    var rules = denada.parse('@\'constant|volatile|discrete\' Real x "realvar+";');
	    shouldFail(tree, rules);
	    done();
	});
    });
    describe("Modifications", function() {
	it("should pass when modifications match exactly", function(done) {
	    var tree = denada.parse("Real x(y=5);");
	    var rules = denada.parse('Real x(y=5) "realvar";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should pass when modifications match wildcards", function(done) {
	    var tree = denada.parse("Real x(y=5);");
	    var rules = denada.parse('Real x(_=\"$_\") "realvar";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should pass when modifications match wildcard and patterns", function(done) {
	    var tree = denada.parse("Real x(y=5);");
	    var rules = denada.parse('Real x(_=\"$number\") "realvar";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should pass when modifications match pattern and wildcard", function(done) {
	    var tree = denada.parse("Real x(y=5);");
	    var rules = denada.parse('Real x(\'y|z\'=\"$_\") "realvar";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should pass when modifications match pattern and pattern", function(done) {
	    var tree = denada.parse("Real x(y=5,z=true);");
	    var rules = denada.parse('Real x(\'y|z\'=\"$number|boolean\") "realvar";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should fail when modifications don't match exactly", function(done) {
	    var tree = denada.parse("Real x(y=5);");
	    var rules = denada.parse('Real x(z=5) "realvar";');
	    shouldFail(tree, rules);
	    done();
	});
	it("should fail when modifications value pattern doesn't match", function(done) {
	    var tree = denada.parse("Real x(y=true);");
	    var rules = denada.parse('Real x(_=\"$number\") "realvar";');
	    shouldFail(tree, rules);
	    done();
	});
	it("should fail when modifications name pattern doesn't match", function(done) {
	    var tree = denada.parse("Real x(a=5);");
	    var rules = denada.parse('Real x(\'y|z\'=\"$_\") "realvar";');
	    shouldFail(tree, rules);
	    done();
	});
    });

    describe("Special string pattern handling", function() {
	it("should pass if string value matches literal", function(done) {
	    var tree = denada.parse('String z = "hello";');
	    var rules = denada.parse('String z = "hello" "strvar*";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should pass if string value matches wildcard", function(done) {
	    var tree = denada.parse('String z = "hello";');
	    var rules = denada.parse('String z = "_" "strvar*";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should pass if string value matches pattern", function(done) {
	    var tree = denada.parse('String z = "foo";');
	    var rules = denada.parse('String z = "foo|bar" "strvar*";');
	    shouldProcess(tree, rules);
	    done();
	});
	it("should fail if string value doesn't matches literal", function(done) {
	    var tree = denada.parse('String z = "hello";');
	    var rules = denada.parse('String y = "hello" "strvar*";');
	    shouldFail(tree, rules);
	    done();
	});
	it("should pass if string value matches pattern", function(done) {
	    var tree = denada.parse('String z = "fuz";');
	    var rules = denada.parse('String z = "foo|bar" "strvar*";');
	    shouldFail(tree, rules);
	    done();
	});
    });
});

/* Since declarations cover all the possible patterns
   needed by declarations (i.e. qualifiers and identifiers),
   those don't need to be tested again here.  Instead, we'll
   focus on handling of nested contents. */
describe("Definition pattern handling", function() {
    it("should pass if nested contents validate", function(done) {
	var tree = denada.parse("X { Real x; }");
	var rules = denada.parse('X "X" { Real x "realvar"; }');
	shouldProcess(tree, rules);
	done();
    });
    it("should check nested contents (and identify nested issues)", function(done) {
	var tree = denada.parse("X { Real y; }");
	var rules = denada.parse('X "X" { Real x "realvar"; }');
	shouldFail(tree, rules);
	done();
    });
    it("should fail if definition qualifiers don't match", function(done) {
	var tree = denada.parse("@foo X { Real y; }");
	var rules = denada.parse('X "X" { Real x "realvar"; }');
	shouldFail(tree, rules);
	done();
    });
    it("should fail if definition names don't match", function(done) {
	var tree = denada.parse("Y { Real x; }");
	var rules = denada.parse('X "X" { Real x "realvar"; }');
	shouldFail(tree, rules);
	done();
    });
    it("should fail if cardinality doesn't match", function(done) {
	var tree = denada.parse("X { Real x; } X { Real x; }");
	var rules = denada.parse('X "X" { Real x "realvar"; }');
	shouldFail(tree, rules);
	done();
    });
});

describe("Grammar 1", function() {
    var rules = denada.parseFileSync("test/samples/grammar1.dnd");
    it("should not find any issues", function(done) {
	var tree = denada.parseFileSync("test/samples/g1_test1.dnd");
	shouldProcess(tree, rules);
	done();
    });
    it("should correctly annotate x", function(done) {
	var tree = denada.parseFileSync("test/samples/g1_test1.dnd");
	denada.process(tree, rules);

	var x = tree[0];
	assert.equal(x.varname, "x");
	ruleInfo(x, "realvar", 0);
	done();
    });
    it("should correctly annotate y", function(done) {
	var tree = denada.parseFileSync("test/samples/g1_test1.dnd");
	denada.process(tree, rules);

	var y = tree[1];
	assert.equal(y.varname, "y");
	ruleInfo(y, "realvar", 1);
	done();
    });

    it("should correctly annotate a_b", function(done) {
	var tree = denada.parseFileSync("test/samples/g1_test1.dnd");
	denada.process(tree, rules);

	var a_b = tree[2];
	assert.equal(a_b.varname, "a.b");
	ruleInfo(a_b, "intvar", 0);
	done();
    });

    it("should correctly annotate c", function(done) {
	var tree = denada.parseFileSync("test/samples/g1_test1.dnd");
	denada.process(tree, rules);

	var c = tree[3];
	assert.equal(c.varname, "correct");
	ruleInfo(c, "boolvar", 0);
	done();
    });

    it("should correctly annotate opt", function(done) {
	var tree = denada.parseFileSync("test/samples/g1_test1.dnd");
	denada.process(tree, rules);

	var opt = tree[4];
	assert.equal(opt.varname, "opt");
	ruleInfo(opt, "strvar", 0);
	done();
    });
});
