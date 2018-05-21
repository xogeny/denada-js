/* This code is for testing the rule parser */

import * as ruleGrammar from "../lib/src/ruleGrammar";
import assert from "assert";

describe("Test rule parsing", () => {
    it("should recognize plain rules", () => {
        const result = ruleGrammar.parse("name", {});
        assert.equal(result.recursive, false);
        assert.equal(result.name, "name");
        assert.equal(result.min, 1);
        assert.equal(result.max, 1);
    });
    it("should recognize recursive rules", () => {
        const result = ruleGrammar.parse("^xyz", {});
        assert.equal(result.recursive, true);
        assert.equal(result.name, "xyz");
        assert.equal(result.min, 1);
        assert.equal(result.max, 1);
    });
    it("should recognize optional rules", () => {
        const result = ruleGrammar.parse("xyz?", {});
        assert.equal(result.recursive, false);
        assert.equal(result.name, "xyz");
        assert.equal(result.min, 0);
        assert.equal(result.max, 1);
    });
    it("should recognize *-rules", () => {
        const result = ruleGrammar.parse("xyz*", {});
        assert.equal(result.recursive, false);
        assert.equal(result.name, "xyz");
        assert.equal(result.min, 0);
        assert.equal(result.max, undefined);
    });
    it("should recognize +-rules", () => {
        const result = ruleGrammar.parse("xyz+", {});
        assert.equal(result.recursive, false);
        assert.equal(result.name, "xyz");
        assert.equal(result.min, 1);
        assert.equal(result.max, undefined);
    });
});
