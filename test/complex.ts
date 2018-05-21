import * as denada from "../lib/src/denada";
import assert from "assert";

describe("Complex example", () => {
    it("should be able to parse complex example from a file, synchronously", () => {
        const contents = denada.parseFileSync("test/samples/complex.dnd");
        const X = contents[0];
        assert.equal(X.element, "definition");
        assert.equal(X.description, null);
        if (X.element === "definition") {
            assert.equal(X.name, "X");
            assert.equal(X.contents.length, 1);
        }
    });
});
