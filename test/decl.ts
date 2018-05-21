/* Test some simple sample source */
import * as denada from "../lib/src/denada";
import assert from "assert";

describe("Checking basic syntax", () => {
    it("should parse normal declarations", () => {
        const ast = denada.parse("Real x;")[0];
        assert.equal(ast.element, "declaration");
        assert.deepEqual(ast.qualifiers, []);
        assert.equal(ast.description, undefined);
        if (ast.element === "declaration") {
            assert.equal(ast.typename, "Real");
            assert.equal(ast.varname, "x");
        }
    });
    it("should parse declarations with empty modifiers", () => {
        const ast = denada.parse("Real x();")[0];
        assert.equal(ast.element, "declaration");
        assert.deepEqual(ast.qualifiers, []);
        assert.deepEqual(ast.modifiers, {});
        assert.equal(ast.description, undefined);
        if (ast.element === "declaration") {
            assert.equal(ast.typename, "Real");
            assert.equal(ast.varname, "x");
        }
    });
    it("should parse declarations with modifiers", () => {
        const ast = denada.parse("Real x(y=5,z=true);")[0];
        assert.equal(ast.element, "declaration");
        assert.deepEqual(ast.qualifiers, []);
        assert.deepEqual(ast.modifiers, { y: 5, z: true });
        assert.equal(ast.description, undefined);
        if (ast.element === "declaration") {
            assert.equal(ast.typename, "Real");
            assert.equal(ast.varname, "x");
        }
    });
    it("should parse declarations with modifiers with strings", () => {
        const ast = denada.parse('Real x(y=5,z="true");')[0];
        assert.equal(ast.element, "declaration");
        assert.deepEqual(ast.qualifiers, []);
        assert.deepEqual(ast.modifiers, { y: 5, z: "true" });
        assert.equal(ast.description, undefined);
        if (ast.element === "declaration") {
            assert.equal(ast.typename, "Real");
            assert.equal(ast.varname, "x");
        }
    });
    it("should parse declarations with assignment", () => {
        const ast = denada.parse("Real x = 5;")[0];
        assert.equal(ast.element, "declaration");
        assert.deepEqual(ast.qualifiers, []);
        assert.equal(ast.description, undefined);
        if (ast.element === "declaration") {
            assert.equal(ast.typename, "Real");
            assert.equal(ast.varname, "x");
            assert.equal(ast.value, 5);
        }
    });
    it("should parse declarations with object assignment", () => {
        const ast = denada.parse('Real x = {"z": 5};')[0];
        assert.equal(ast.element, "declaration");
        assert.deepEqual(ast.qualifiers, []);
        assert.equal(ast.description, undefined);
        if (ast.element === "declaration") {
            assert.equal(ast.typename, "Real");
            assert.equal(ast.varname, "x");
            assert.deepEqual(ast.value, { z: 5 });
        }
    });
    it("should parse qualified declarations", () => {
        const ast = denada.parse("foo 'bar' Real x;")[0];
        assert.equal(ast.element, "declaration");
        assert.deepEqual(ast.qualifiers, ["foo", "bar"]);
        assert.equal(ast.description, undefined);
        if (ast.element === "declaration") {
            assert.equal(ast.typename, "Real");
            assert.equal(ast.varname, "x");
        }
    });
    it("should parse quoted types", () => {
        const ast = denada.parse("'Real' x;")[0];
        assert.equal(ast.element, "declaration");
        assert.deepEqual(ast.qualifiers, []);
        assert.equal(ast.description, undefined);
        if (ast.element === "declaration") {
            assert.equal(ast.typename, "Real");
            assert.equal(ast.varname, "x");
        }
    });
    it("should parse quoted constiable names", () => {
        const ast = denada.parse("Real 'x';")[0];
        assert.equal(ast.element, "declaration");
        assert.deepEqual(ast.qualifiers, []);
        assert.equal(ast.description, undefined);
        if (ast.element === "declaration") {
            assert.equal(ast.typename, "Real");
            assert.equal(ast.varname, "x");
        }
    });
    it("should parse descriptive strings", () => {
        const ast = denada.parse('Real x "This is the constiable x";')[0];
        assert.equal(ast.element, "declaration");
        assert.deepEqual(ast.qualifiers, []);
        assert.equal(ast.description, "This is the constiable x");
        if (ast.element === "declaration") {
            assert.equal(ast.typename, "Real");
            assert.equal(ast.varname, "x");
        }
    });
});
