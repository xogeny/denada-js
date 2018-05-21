/* Test some simple sample source */
import * as denada from "../lib/src/denada";
import assert from "assert";

describe("Checking definition syntax", () => {
    it("should parse qualified empty definitions", () => {
        const ast = denada.parse("class X {}")[0];
        assert.equal(ast.element, "definition");
        assert.deepEqual(ast.qualifiers, ["class"]);
        assert.equal(ast.description, null);
        if (ast.element === "definition") {
            assert.equal(ast.name, "X");
        }
    });

    it("should parse unqualified empty definitions", () => {
        const ast = denada.parse("start {}")[0];
        assert.equal(ast.element, "definition");
        assert.deepEqual(ast.qualifiers, []);
        assert.equal(ast.description, null);
        if (ast.element === "definition") {
            assert.equal(ast.name, "start");
        }
    });

    it("should parse documented definitions", () => {
        const ast = denada.parse('start "comment" { }')[0];
        assert.equal(ast.element, "definition");
        assert.deepEqual(ast.qualifiers, []);
        assert.equal(ast.description, "comment");
        if (ast.element === "definition") {
            assert.equal(ast.name, "start");
        }
    });
});
