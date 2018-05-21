import * as denada from "../lib/src/denada";

describe("Asset example", () => {
    it("Example code should parse", () => {
        const tree = denada.parseFileSync("test/samples/assets.dnd");
        expect(tree.length).toBe(3);
        expect(tree).toMatchSnapshot();
    });
    it("Grammar should parse", () => {
        const rules = denada.parseFileSync("test/samples/assetGrammar.dnd");
        expect(rules.length).toBe(3);
        expect(rules).toMatchSnapshot();
    });
    it("Example code should follow grammar", () => {
        const tree = denada.parseFileSync("test/samples/assets.dnd");
        const rules = denada.parseFileSync("test/samples/assetGrammar.dnd");
        const issues = denada.process(tree, rules);

        expect(issues).toEqual([]);
    });
});

describe("Asset errors", () => {
    it("should detect non-matching definitions", () => {
        const tree = denada.parseFileSync("test/samples/asset_error1.dnd");
        const rules = denada.parseFileSync("test/samples/assetGrammar.dnd");
        const issues = denada.process(tree, rules);

        expect(issues.length).toBe(1);
        expect(issues).toMatchSnapshot();
    });
    it("should detect mismatched assignment types", () => {
        const tree = denada.parseFileSync("test/samples/asset_error2.dnd");
        const rules = denada.parseFileSync("test/samples/assetGrammar.dnd");
        const issues = denada.process(tree, rules);

        expect(issues.length).toBe(2);
        expect(issues).toMatchSnapshot();
    });
    it("should detect invalid inner elements", () => {
        const tree = denada.parseFileSync("test/samples/asset_error3.dnd");
        const rules = denada.parseFileSync("test/samples/assetGrammar.dnd");
        const issues = denada.process(tree, rules);

        expect(issues.length).toBe(1);
        expect(issues).toMatchSnapshot();
    });
});
