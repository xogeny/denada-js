import * as denada from "../lib/src/denada";
import assert from "assert";

describe("Typed property example", () => {
    it("Example code should parse", () => {
        const tree = denada.parseFileSync("test/samples/typedProperty.dnd");
        assert.equal(tree.length, 4);
    });
    it("Grammar should parse", () => {
        const rules = denada.parseFileSync("test/samples/typedPropertyGrammar.dnd");
        assert.equal(rules.length, 11);
    });
    it("Example code should follow grammar", () => {
        const tree = denada.parseFileSync("test/samples/typedProperty.dnd");
        const rules = denada.parseFileSync("test/samples/typedPropertyGrammar.dnd");
        const issues = denada.process(tree, rules);

        for (let i = 0; i < issues.length; i++) console.log("Unexpected issue: " + issues[i]);
        assert.equal(issues.length, 0);
    });
});
