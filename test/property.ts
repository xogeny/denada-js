import * as denada from "../lib/src/denada";
import assert from "assert";

describe("Property example", () => {
    it("Example code should parse", () => {
        const tree = denada.parseFileSync("test/samples/property.dnd");
        assert.equal(tree.length, 4);
    });
    it("Grammar should parse", () => {
        const rules = denada.parseFileSync("test/samples/propertyGrammar.dnd");
        assert.equal(rules.length, 3);
    });
    it("Example code should follow grammar", () => {
        const tree = denada.parseFileSync("test/samples/property.dnd");
        const rules = denada.parseFileSync("test/samples/propertyGrammar.dnd");
        const issues = denada.process(tree, rules);

        for (let i = 0; i < issues.length; i++) console.log("Unexpected issue: " + issues[i]);
        assert.equal(issues.length, 0);
    });
});
