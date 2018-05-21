/* Test some simple sample source */
import * as denada from "../lib/src/denada";
import assert from "assert";

describe("Grammar", () => {
    it("should be able to parse a grammar declaration", () => {
        const ast = denada.parse("parameter '.*' \"p_nohints*\";")[0];
        assert.equal(ast.element, "declaration");
    });
    it("should be able to parse a grammar declaration w/assignment", () => {
        const ast = denada.parse('parameter \'.*\' = {"label": "string"} "p_hints*";')[0];
        assert.equal(ast.element, "declaration");
    });
    it("should be able to parse interface definition", () => {
        const ast = denada.parse('interface "interface*" { Real x; }')[0];
        assert.equal(ast.element, "definition");
        assert.equal(ast.description, "interface*");
        if (ast.element === "definition") {
            assert.equal(ast.name, "interface");
            assert.deepEqual(ast.contents, [
                {
                    element: "declaration",
                    qualifiers: [],
                    typename: "Real",
                    modifiers: null,
                    varname: "x",
                    value: null,
                    description: null,
                    location: {
                        start: {
                            column: 26,
                            line: 1,
                            offset: 25,
                        },
                        end: {
                            column: 34,
                            line: 1,
                            offset: 33,
                        },
                    },
                    file: null,
                },
            ]);
        }
    });
    it("should be able to parse panel definition", () => {
        const ast = denada.parse('panel "panel*" { Real x; }')[0];
        assert.equal(ast.element, "definition");
        assert.equal(ast.description, "panel*");
        if (ast.element === "definition") {
            assert.equal(ast.name, "panel");
            assert.equal(ast.contents.length, 1);
        }
    });
    it("should be able to parse panel definition from a file, synchronously", () => {
        const ast = denada.parseFileSync("test/samples/panel_def.dnd")[0];
        assert.equal(ast.element, "definition");
        assert.equal(ast.description, "panel*");
        if (ast.element === "definition") {
            assert.equal(ast.name, "panel");
            assert.equal(ast.contents.length, 1);
        }
    });
    it("should be able to parse panel definition from a file, asynchronously", () => {
        denada.parseFile("test/samples/panel_def.dnd", (err, res) => {
            if (err) throw err;
            const ast = res[0];
            assert.equal(ast.element, "definition");
            assert.equal(ast.description, "panel*");
            if (ast.element === "definition") {
                assert.equal(ast.name, "panel");
                assert.equal(ast.contents.length, 1);
            }
        });
    });
    it("should be able to parse a grammar", () => {
        const ast = denada.parse(
            '\
interface "interface*" {\
  panel "panel*" {\
    parameter \'.*\' "p_nohints*";\
    parameter \'.*\' = {"label": "string"} "p_hints*";\
  }\
}\
',
        )[0];
        assert.equal(ast.element, "definition");
        assert.deepEqual(ast.qualifiers, []);
        assert.equal(ast.description, "interface*");
        if (ast.element === "definition") {
            assert.equal(ast.name, "interface");
        }
    });
});
