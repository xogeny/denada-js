import * as denada from "../lib/src/denada";
import assert from "assert";

function shouldProcess(tree, rules) {
    const issues = denada.process(tree, rules);
    for (let i = 0; i < issues.length; i++) {
        console.log("Unexpected issue: " + issues[i]);
    }
    assert.equal(issues.length, 0);
}

function shouldFail(tree, rules) {
    const issues = denada.process(tree, rules);
    assert.notEqual(issues.length, 0);
}

function ruleInfo(node, name, count) {
    assert(node.hasOwnProperty("rulename"), "Node is missing rule information");
    assert.equal(node.rulename, name);
    assert.equal(node.count, count);
}

describe("Declaration pattern handling", () => {
    it("should pass literal matches", () => {
        const tree = denada.parse("Real x;");
        const rules = denada.parse('Real x "realvar";');
        shouldProcess(tree, rules);
    });

    describe("Recursive rules", () => {
        it("should allow recursive rules", () => {
            const tree = denada.parse("X { X {} }");
            const rules = denada.parse('X "^X*" { }');
            shouldProcess(tree, rules);
        });
        it("should not allow recursive patterns if not explicitly specified", () => {
            const tree = denada.parse("X { X {} }");
            const rules = denada.parse('X "X*" { }');
            shouldFail(tree, rules);
        });
    });

    describe("Cardinality", () => {
        describe("Zero or more", () => {
            const rules = denada.parse('_ x "realvar*";');

            it("should pass for zero items and * cardinality", () => {
                const tree = denada.parse("");
                shouldProcess(tree, rules);
            });

            it("should pass for one items and * cardinality", () => {
                const tree = denada.parse("Real x;");
                shouldProcess(tree, rules);
            });

            it("should pass for two items and * cardinality", () => {
                const tree = denada.parse("Real x; Integer x;");
                shouldProcess(tree, rules);
            });
        });
        describe("One or more", () => {
            const rules = denada.parse('_ x "realvar+";');

            it("should fail for zero items and + cardinality", () => {
                const tree = denada.parse("");
                shouldFail(tree, rules);
            });

            it("should pass for one items and + cardinality", () => {
                const tree = denada.parse("Real x;");
                shouldProcess(tree, rules);
            });

            it("should pass for two items and + cardinality", () => {
                const tree = denada.parse("Real x; Integer x;");
                shouldProcess(tree, rules);
            });
        });
        describe("Optional", () => {
            const rules = denada.parse('_ x "realvar?";');

            it("should pass for zero items and ? cardinality", () => {
                const tree = denada.parse("");
                shouldProcess(tree, rules);
            });

            it("should pass for one items and ? cardinality", () => {
                const tree = denada.parse("Real x;");
                shouldProcess(tree, rules);
            });

            it("should fail for two items and ? cardinality", () => {
                const tree = denada.parse("Real x; Integer x;");
                shouldFail(tree, rules);
            });
        });
        describe("Exactly one", () => {
            const rules = denada.parse('_ x "realvar";');

            it("should fail for zero items and unit cardinality", () => {
                const tree = denada.parse("");
                shouldFail(tree, rules);
            });

            it("should pass for one item and unit cardinality", () => {
                const tree = denada.parse("Real x;");
                shouldProcess(tree, rules);
            });

            it("should fail for two items and unit cardinality", () => {
                const tree = denada.parse("Real x; Integer x;");
                shouldFail(tree, rules);
            });
        });
    });

    describe("Types", () => {
        it("should pass typename matches using wildcard", () => {
            const tree = denada.parse("Real x;");
            const rules = denada.parse('_ x "realvar";');
            shouldProcess(tree, rules);
        });

        it("should pass typename matches using regexp", () => {
            const tree = denada.parse("Real x; Rigid z; Really y;");
            const rules = denada.parse("'/^R/'" + ' _ "realvar+";');
            shouldProcess(tree, rules);
        });

        it("should fail when typenames can't match", () => {
            const tree = denada.parse("Integer y;");
            const rules = denada.parse('Real y "realvar";');
            shouldFail(tree, rules);
        });

        it("should fail when typenames patterns don't match", () => {
            const tree = denada.parse("Integer y;");
            const rules = denada.parse("'/^(Real|String)$/'" + ' y "realvar";');
            shouldFail(tree, rules);
        });
    });

    describe("Variables", () => {
        it("should pass varname matches using wildcards", () => {
            const tree = denada.parse("Real x;");
            const rules = denada.parse('Real _ "realvar";');
            shouldProcess(tree, rules);
        });
        it("should pass varname matches using patterns", () => {
            const tree = denada.parse("Real x;");
            const rules = denada.parse("Real '/^(x|y|z)$/' \"realvar\";");
            shouldProcess(tree, rules);
        });
        it("should fail when varnames can't match", () => {
            const tree = denada.parse("Real x;");
            const rules = denada.parse('Real y "realvar";');
            shouldFail(tree, rules);
        });
        it("should fail when varname patterns don't match", () => {
            const tree = denada.parse("Real x;");
            const rules = denada.parse("Real '/^(a|b|c)$/' \"realvar\";");
            shouldFail(tree, rules);
        });
    });

    describe("Values", () => {
        it("should pass value matches exactly", () => {
            const tree = denada.parse("Real x = 1;");
            const rules = denada.parse('Real x = 1 "realvar";');
            shouldProcess(tree, rules);
        });
        it("should pass value matches type", () => {
            const tree = denada.parse("Real x = 1;");
            const rules = denada.parse('Real x = "$number" "realvar";');
            shouldProcess(tree, rules);
        });
        it("should pass value matches type wildcard", () => {
            const tree = denada.parse("Real x = 1;");
            const rules = denada.parse('Real x = "$_" "realvar";');
            shouldProcess(tree, rules);
        });
        it("should pass value matches type pattern", () => {
            const tree = denada.parse("Real x = 1;");
            const rules = denada.parse('Real x = "$number|boolean" "realvar";');
            shouldProcess(tree, rules);
        });
        it("should fail when values can't match", () => {
            const tree = denada.parse("Real x = 1;");
            const rules = denada.parse('Real x = 2 "realvar";');
            shouldFail(tree, rules);
        });
        it("should fail when value patterns don't match", () => {
            const tree = denada.parse("Real x = 1;");
            const rules = denada.parse('Real x = "$boolean" "realvar";');
            shouldFail(tree, rules);
        });
    });
    describe("Qualifier", () => {
        it("should pass when qualifiers match exactly", () => {
            const tree = denada.parse("constant Real x;");
            const rules = denada.parse('constant Real x "realvar";');
            shouldProcess(tree, rules);
        });
        it("should pass when qualifiers match wildcard", () => {
            const tree = denada.parse("constant Real x; volatile discrete Real x;");
            const rules = denada.parse('_ Real x "realvar+";');
            shouldProcess(tree, rules);
        });
        it("should pass when qualifiers match patterns", () => {
            const tree = denada.parse("constant Real x; volatile discrete Real x;");
            const rules = denada.parse("'/^(constant|volatile|discrete)$/' Real x \"realvar+\";");
            shouldProcess(tree, rules);
        });
        it("should fail when qualifiers don't match exactly", () => {
            const tree = denada.parse("constant Real x;");
            const rules = denada.parse('parameter Real x "realvar";');
            shouldFail(tree, rules);
        });
        it("should pass when qualifiers don't match patterns", () => {
            const tree = denada.parse("continuous Real x; volatile discrete Real x;");
            const rules = denada.parse("'constant|volatile|discrete' Real x \"realvar+\";");
            shouldFail(tree, rules);
        });
    });
    describe("Modifications", () => {
        it("should pass when modifications match exactly", () => {
            const tree = denada.parse("Real x(y=5);");
            const rules = denada.parse('Real x(y=5) "realvar";');
            shouldProcess(tree, rules);
        });
        it("should pass when modifications match wildcards", () => {
            const tree = denada.parse("Real x(y=5);");
            const rules = denada.parse('Real x(_="$_") "realvar";');
            shouldProcess(tree, rules);
        });
        it("should pass when modifications match wildcard and patterns", () => {
            const tree = denada.parse("Real x(y=5);");
            const rules = denada.parse('Real x(_="$number") "realvar";');
            shouldProcess(tree, rules);
        });
        it("should pass when modifications match pattern and wildcard", () => {
            const tree = denada.parse("Real x(y=5);");
            const rules = denada.parse('Real x(\'/^(y|z)$/\'="$_") "realvar";');
            shouldProcess(tree, rules);
        });
        it("should pass when modifications match pattern and pattern", () => {
            const tree = denada.parse("Real x(y=5,z=true);");
            const rules = denada.parse('Real x(\'/^(y|z)$/\'="$number|boolean") "realvar";');
            shouldProcess(tree, rules);
        });
        it("should fail when modifications don't match exactly", () => {
            const tree = denada.parse("Real x(y=5);");
            const rules = denada.parse('Real x(z=5) "realvar";');
            shouldFail(tree, rules);
        });
        it("should fail when modifications value pattern doesn't match", () => {
            const tree = denada.parse("Real x(y=true);");
            const rules = denada.parse('Real x(_="$number") "realvar";');
            shouldFail(tree, rules);
        });
        it("should fail when modifications name pattern doesn't match", () => {
            const tree = denada.parse("Real x(a=5);");
            const rules = denada.parse('Real x(\'y|z\'="$_") "realvar";');
            shouldFail(tree, rules);
        });
    });

    describe("Special string pattern handling", () => {
        it("should pass if string value matches literal", () => {
            const tree = denada.parse('String z = "hello";');
            const rules = denada.parse('String z = "hello" "strvar*";');
            shouldProcess(tree, rules);
        });
        it("should pass if string value matches wildcard", () => {
            const tree = denada.parse('String z = "hello";');
            const rules = denada.parse('String z = "_" "strvar*";');
            shouldProcess(tree, rules);
        });
        it("should pass if string value matches pattern", () => {
            const tree = denada.parse('String z = "foo";');
            const rules = denada.parse('String z = "foo|bar" "strvar*";');
            shouldProcess(tree, rules);
        });
        it("should fail if string value doesn't matches literal", () => {
            const tree = denada.parse('String z = "hello";');
            const rules = denada.parse('String y = "hello" "strvar*";');
            shouldFail(tree, rules);
        });
        it("should pass if string value matches pattern", () => {
            const tree = denada.parse('String z = "fuz";');
            const rules = denada.parse('String z = "foo|bar" "strvar*";');
            shouldFail(tree, rules);
        });
    });
});

/* Since declarations cover all the possible patterns
   needed by declarations (i.e. qualifiers and identifiers),
   those don't need to be tested again here.  Instead, we'll
   focus on handling of nested contents. */
describe("Definition pattern handling", () => {
    it("should pass if nested contents validate", () => {
        const tree = denada.parse("X { Real x; }");
        const rules = denada.parse('X "X" { Real x "realvar"; }');
        shouldProcess(tree, rules);
    });
    it("should check nested contents (and identify nested issues)", () => {
        const tree = denada.parse("X { Real y; }");
        const rules = denada.parse('X "X" { Real x "realvar"; }');
        shouldFail(tree, rules);
    });
    it("should fail if definition qualifiers don't match", () => {
        const tree = denada.parse("foo X { Real y; }");
        const rules = denada.parse('X "X" { Real x "realvar"; }');
        shouldFail(tree, rules);
    });
    it("should fail if definition names don't match", () => {
        const tree = denada.parse("Y { Real x; }");
        const rules = denada.parse('X "X" { Real x "realvar"; }');
        shouldFail(tree, rules);
    });
    it("should fail if cardinality doesn't match", () => {
        const tree = denada.parse("X { Real x; } X { Real x; }");
        const rules = denada.parse('X "X" { Real x "realvar"; }');
        shouldFail(tree, rules);
    });
});

describe("Grammar 1", () => {
    const rules = denada.parseFileSync("test/samples/grammar1.dnd");
    it("should not find any issues", () => {
        const tree = denada.parseFileSync("test/samples/g1_test1.dnd");
        shouldProcess(tree, rules);
    });
    it("should correctly annotate x", () => {
        const tree = denada.parseFileSync("test/samples/g1_test1.dnd");
        denada.process(tree, rules);

        const x = tree[0];
        expect(x.element).toBe("declaration");
        if (x.element === "declaration") {
            assert.equal(x.varname, "x");
            ruleInfo(x, "realvar", 0);
        }
    });
    it("should correctly annotate y", () => {
        const tree = denada.parseFileSync("test/samples/g1_test1.dnd");
        denada.process(tree, rules);

        const y = tree[1];
        expect(y.element).toBe("declaration");

        if (y.element === "declaration") {
            assert.equal(y.varname, "y");
            ruleInfo(y, "realvar", 1);
        }
    });

    it("should correctly annotate a_b", () => {
        const tree = denada.parseFileSync("test/samples/g1_test1.dnd");
        denada.process(tree, rules);

        const ab = tree[2];
        expect(ab.element).toBe("declaration");

        if (ab.element === "declaration") {
            assert.equal(ab.varname, "a.b");
            ruleInfo(ab, "intvar", 0);
        }
    });

    it("should correctly annotate c", () => {
        const tree = denada.parseFileSync("test/samples/g1_test1.dnd");
        denada.process(tree, rules);

        const c = tree[3];
        expect(c.element).toBe("declaration");

        if (c.element === "declaration") {
            assert.equal(c.varname, "correct");
            ruleInfo(c, "boolvar", 0);
        }
    });

    it("should correctly annotate opt", () => {
        const tree = denada.parseFileSync("test/samples/g1_test1.dnd");
        denada.process(tree, rules);

        const opt = tree[4];
        expect(opt.element).toBe("declaration");

        if (opt.element === "declaration") {
            assert.equal(opt.varname, "opt");
            ruleInfo(opt, "strvar", 0);
        }
    });
});
