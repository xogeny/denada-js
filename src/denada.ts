import * as grammar from "./grammar";
import * as ruleGrammar from "./ruleGrammar";
import { Node, AST, DeclarationNode, DefinitionNode, Modifiers } from "./ast";
import { RuleData } from "./rule";
import Ajv from "ajv";

import fs from "fs";

// NB - Not sure what this did?!?
// function addNamed(d: Node) {
//     if (d.element == "declaration") return;
//     if (!d.hasOwnProperty("decl")) d["decl"] = {};
//     if (!d.hasOwnProperty("def")) d["def"] = {};
//     for (var i = 0; i < d.contents.length; i++) {
//         var elem = d.contents[i];
//         if (elem.element === "definition") d["def"][elem.name] = elem;
//         if (elem.element === "declaration") d["decl"][elem.varname] = elem;
//     }
// }

type Schema = object;

export function parse(s: string, options?: grammar.IParseOptions, filename?: string) {
    options = options || {};
    try {
        const ast = grammar.parse(s, options);
        if (ast == null || ast === undefined) {
            // throw new Error("Parse failed to return a valid tree: " + args.tree);
            throw new Error("Parse failed to return a valid tree");
        }
        // visit(ast, addNamed);
        return ast;
    } catch (e) {
        console.log("e = ", e);
        if (filename) {
            throw new Error(
                `${e.name} on line ${e.location.start.line} (column ${e.location.start.column}) of ${filename}: ${
                    e.message
                }`,
            );
        } else if (e.file) {
            throw new Error(
                `${e.name} on line ${e.location.start.line} (column ${e.location.start.column}) of ${e.file}: ${
                    e.message
                }`,
            );
        } else {
            throw new Error(
                `${e.name} on line ${e.location.start.line} (column ${e.location.start.column}): ${e.message}`,
            );
        }
    }
}

export function parseFileSync(s: string, options?: grammar.IParseOptions) {
    const contents = fs.readFileSync(s, "utf8");
    return parse(contents, options, s);
}

export function parseFile(s: string, callback: (err: Error | null, ast?: AST) => void) {
    fs.readFile(s, "utf8", (err, res) => {
        if (err) callback(err);
        try {
            const ast = parse(res, {}, s);
            callback(null, ast);
        } catch (e) {
            callback(e);
        }
    });
}

function matchIdentifier(id: string, pattern: string) {
    // If the pattern is '_' then it always matches
    if (pattern === "_") return true;
    // If the pattern starts and ends with "/", treat it as a RegExp
    if (pattern[0] === "/" && pattern[pattern.length - 1] === "/") {
        const re = new RegExp(pattern.slice(1, -1));
        return re.test(id);
    }
    // Otherwise, just check for exactly equality
    return pattern === id;
}

export function matchValue(val: any, schema: object) {
    if (schema === null) return val === schema;
    if (typeof schema !== "object") {
        console.warn(`Expected schema to be an object, but got ${typeof schema} instead`);
        return false;
    }

    const validator = new Ajv();
    validator.validateSchema(schema);
    const result = validator.validate(schema, val);
    if (result === true) {
        return true;
    } else if (result === false) {
        return false;
    } else {
        throw new Error("Validation required a schema with $ref...only synchronous validation is supported");
    }
}

export function matchValue2(val: any, pattern: any) {
    // If the pattern is a string then we must handle some special cases
    if (typeof pattern === "string") {
        // If the pattern starts with $, the rest is a pattern to match against
        // the type of the value
        if (pattern[0] === "$") {
            const vtype = typeof val;
            const pat = pattern.slice(1);
            if (pat === "_") return true;
            if (vtype.match(pat) != null) return true;
            return false;
        } else if (typeof val === "string") {
            // If the value is a string, then we treat the pattern
            // as a regexp or wildcard
            if (pattern === "_") return true;
            if (val.match(pattern) != null) return true;
            return false;
        } else {
            // We get here if the pattern is a string but the value
            // is not.  In that case, no match is possible
            return false;
        }
    } else if (typeof pattern === "object" && pattern !== null) {
        return matchValue(val, pattern);
    } else {
        // If pattern isn't a string or an object, then just check for literal equality
        return val === pattern;
    }
}

function matchModifiers(obj: Modifiers, patterns: Modifiers) {
    for (const op in obj) {
        let matched = false;
        for (const pp in patterns) {
            const imatch = matchIdentifier(op, pp);
            const vmatch = matchValue(obj[op], patterns[pp]);
            if (imatch && vmatch) {
                matched = true;
                break;
            }
        }
        if (!matched) return false;
    }
    return true;
}

function matchQualifiers(quals: string[], patterns: string[], reasons: string[]) {
    const required = [];
    const count = [];
    const pats = [];
    let matched = false;
    let pat: string | undefined;
    for (let j = 0; j < patterns.length; j++) {
        if (patterns[j].slice(-1) === "?") {
            pat = patterns[j].substr(0, patterns[j].length - 1);
            required.push(false);
        } else {
            pat = patterns[j];
            required.push(true);
        }
        pats.push(pat);
        count.push(0);
    }
    for (let i = 0; i < quals.length; i++) {
        matched = false;
        for (let j = 0; j < patterns.length; j++) {
            if (matchIdentifier(quals[i], pats[j])) {
                matched = true;
                count[j]++;
                break;
            }
        }
        if (!matched) return false;
    }
    for (let j = 0; j < patterns.length; j++) {
        if (required[j] && count[j] === 0) {
            reasons.push("missing required qualifier " + pats[j]);
            return false;
        }
    }
    return true;
}

function matchDeclaration(elem: DeclarationNode, rule: DeclarationNode, data: RuleData, reasons: string[]) {
    if (!matchIdentifier(elem.typename, rule.typename)) {
        reasons.push(
            "Type name " + elem.typename + " didn't match name pattern " + rule.typename + " for rule " + data.rulename,
        );
        return false;
    }
    if (!matchIdentifier(elem.varname, rule.varname)) {
        reasons.push(
            "Variable name " +
                elem.varname +
                " didn't match name pattern " +
                rule.varname +
                " for rule " +
                data.rulename,
        );
        return false;
    }
    if (!matchValue(elem.value, rule.value)) {
        reasons.push(
            "Assigned value " + elem.value + " didn't match value pattern " + rule.value + " for rule " + data.rulename,
        );
        return false;
    }
    if (!matchModifiers(elem.modifiers, rule.modifiers)) {
        reasons.push("Modifications didn't match set of potential modifications " + " for rule " + data.rulename);
        return false;
    }
    if (!matchQualifiers(elem.qualifiers, rule.qualifiers, reasons)) {
        reasons.push(
            elem.qualifiers.toString() +
                " didn't match set of potential qualifiers " +
                rule.qualifiers.toString() +
                " for rule " +
                data.rulename,
        );
        return false;
    }
    return true;
}

function matchDefinition(
    elem: DefinitionNode,
    rule: DefinitionNode,
    data: RuleData,
    context: Node[] | null,
    issues: string[],
    reasons: string[],
) {
    if (!matchIdentifier(elem.name, rule.name)) {
        reasons.push("Name " + elem.name + " didn't match name pattern " + rule.name + " for rule " + data.rulename);
        return false;
    }
    if (!matchQualifiers(elem.qualifiers, rule.qualifiers, reasons)) {
        reasons.push(
            elem.qualifiers.toString() +
                " didn't match set of potential qualifiers " +
                rule.qualifiers.toString() +
                " for rule " +
                data.rulename,
        );
        return false;
    }
    if (!matchModifiers(elem.modifiers, rule.modifiers)) {
        reasons.push("Modifications didn't match set of potential modifications " + " for rule " + data.rulename);
        return false;
    }
    const subissues = checkContents(elem.contents, context || rule.contents);
    for (let i = 0; i < subissues.length; i++) issues.push(subissues[i]);
    return true;
}

function matchElement(
    elem: Node,
    rule: Node,
    data: RuleData,
    context: Node[] | null,
    issues: string[],
    reasons: string[],
) {
    // If these aren't even the same type of element, they don't match
    if (elem.element === "declaration" && rule.element === "declaration")
        return matchDeclaration(elem, rule, data, reasons);
    if (elem.element === "definition" && rule.element === "definition")
        return matchDefinition(elem, rule, data, context, issues, reasons);
    if (elem.element !== rule.element) return false;
    throw new Error("Unexpected element type: " + elem.element);
}

/*
 * This function checks a given ast, tree, against another ast, rules, that
 * that represents the patterns in the AST that are allowed.
 */
function checkContents(tree: Node[], rules: Node[]) {
    const issues: string[] = []; // List of issues found (initially empty)
    let subissues: string[] = []; // Used to record nested issues
    const ruledata: { [name: string]: RuleData } = {}; // Collection of rules found in the rules ast

    /* We start by looping over the rules and processing each rule we
       find to collect information for the `ruledata` collection. */
    for (let i = 0; i < rules.length; i++) {
        /* Assume there are no min or max matches required, in general */
        let min: number | undefined;
        let max: number | undefined;
        /* Extract the specific element for this rule */
        const rule = rules[i];
        /* Extract the description for the rule.  The description contains
	   the name of the rule and indicates its cardinality. */
        const desc = rule.description;
        if (desc) {
            try {
                const pdata = ruleGrammar.parse(desc, {});
                const recursive = pdata.recursive;
                const rulename = pdata.name;
                min = pdata.min;
                max = pdata.max;

                // Check to see if we already have a rule with this name...
                if (ruledata.hasOwnProperty(rulename)) {
                    // ...if so, make sure cardinality matches...
                    if (ruledata[rulename].desc !== desc) {
                        throw new Error(
                            "Rule " +
                                rulename +
                                " has mismatched cardinality: " +
                                ruledata[rulename].desc +
                                " vs. " +
                                desc,
                        );
                    }
                    // ...and then add the current rule as a potential match
                    ruledata[rulename].matches.push(rule);
                } else {
                    // ...if not, initialize the rule data for this rule
                    ruledata[rulename] = {
                        matches: [rule],
                        recursive: recursive,
                        rulename: rulename,
                        count: 0,
                        desc: desc,
                        min: min,
                        max: max,
                    };
                }
                // Add the rule data to the rule
                rule.ruledata = {
                    matches: [],
                    recursive: recursive,
                    rulename: rulename,
                    desc: desc,
                    count: 0,
                    min: min,
                    max: max,
                };
            } catch (e) {
                throw new Error("Unable to parse rule '" + desc + "'");
            }
        } else {
            // Found an element in the rule tree with no rule name or cardinality information
            issues.push("Rule without rulename: " + rule);
        }
    }

    // Now that we have all the rule data collected...

    // ...we loop through the elements in `tree`...
    for (let i = 0; i < tree.length; i++) {
        const elem = tree[i];
        let matched = false;
        // ..and then we loop through the rules to see if this element
        // matches any of the rules.
        const reasons: string[] = [];
        for (const j in ruledata) {
            const data = ruledata[j];
            for (let k = 0; k < data.matches.length; k++) {
                const rule = data.matches[k];
                subissues = [];
                const result = matchElement(elem, rule, data, data.recursive ? rules : null, subissues, reasons);

                // No match found, continue searching
                if (result === false) continue;

                // If we get here, we have a match.  But, `result` is a list
                // of any issues encountered deeper down in the hierarchy.  So
                // we need to indicate we found a match and include any issues
                // that were identified...

                // Indicate we found a match
                matched = true;
                // Annotate the tree with information about which rule it matched
                elem.rulename = data.rulename;
                elem.count = data.count;
                // Record the fact that we found another match for this rule
                data.count = data.count + 1;
                // Append any issues we found deeper in the tree hierarchy
                subissues.forEach(x => issues.push(x));
                // issues = issues.concat(subissues);
                // Indicate we're done searching
                break;
            }
            // If we've found a match, we can stop searching for one
            if (matched) break;
        }
        // If we get here and no match was found, report it.
        if (!matched) {
            const location = elem.location
                ? `Line ${elem.location.start.line}, column ${elem.location.start.column}`
                : `Unknown location`;
            issues.push(
                location +
                    (elem.file == null ? "" : "of " + elem.file) +
                    ": Unable to find a matching rule for element: " +
                    unparse(elem, true) +
                    " because\n  " +
                    reasons.join("\n  "),
            );
        }
    }

    // Now that we've checked each element in `tree` to see if it has a match,
    // let's check to make sure that each rule had the appropriate number of
    // matches.
    for (const j in ruledata) {
        const data = ruledata[j];
        // If a minimum was specified, make sure we met it.
        if (data.min && data.count < data.min) {
            issues.push(
                "Expected at least " + data.min + " matches for rule " + data.rulename + " but found " + data.count,
            );
        }
        // If a maximum was specified, make sure we didn't exceed it.
        if (data.max && data.count > data.max) {
            issues.push(
                "Expected at most " + data.max + " matches for rule " + data.rulename + " but found " + data.count,
            );
        }
    }

    // Return any issues we found.
    return issues;
}

export function process(tree: Node[], rules: Node[]) {
    if (tree == null || tree === undefined) {
        return ["Invalid input tree: " + tree];
    }
    /* Compare tree to rules and collect any issues found */
    const issues = checkContents(tree, rules);
    /* Return the tree and the issues */
    return issues;
}

function unparseIdentifier(id: string) {
    if (id.match("^[_a-zA-z]+$") != null) return id;
    else return "'" + id + "'";
}

function unparseQualifiers(quals: string[]) {
    return quals.join(" ") + (quals.length > 0 ? " " : "");
}

function unparseValue(val: any) {
    if (typeof val === "string") {
        return '"' + val + '"';
    }
    return val.toString();
}

function unparseModifiers(mods: Modifiers) {
    if (Object.keys(mods).length > 0) {
        mods = [];
        for (const k in mods) {
            mods.push(unparseIdentifier(k) + "=" + unparseValue(mods[k]));
        }
        return "(" + mods.join(",") + ")";
    }
    return "";
}

function stringFill3(x: string, n: number) {
    let s = "";
    for (;;) {
        if (n & 1) s += x;
        n >>= 1;
        if (n) x += x;
        else break;
    }
    return s;
}

function unparseTree(elem: Node, indent: number, recursive: boolean) {
    let ret = "";
    const mods: string[] = [];
    ret = ret + stringFill3(" ", indent);
    if (elem.element === "definition") {
        ret = ret + unparseQualifiers(elem.qualifiers);
        ret = ret + unparseIdentifier(elem.name);
        if (elem.modifiers != null) ret = ret + unparseModifiers(elem.modifiers);
        if (elem.description != null) {
            ret = ret + ' "' + elem.description + '"';
        }
        if (recursive) {
            ret = ret + " {\n";
            for (let i = 0; i < elem.contents.length; i++) {
                ret = ret + unparseTree(elem.contents[i], indent + 2, recursive);
            }
            ret = ret + stringFill3(" ", indent) + "}\n";
        } else {
            ret = ret + " { ... }";
        }
    } else if (elem.element === "declaration") {
        // Qualifiers
        ret = ret + unparseQualifiers(elem.qualifiers);
        ret = ret + unparseIdentifier(elem.typename) + " " + unparseIdentifier(elem.varname);
        if (elem.modifiers != null) ret = ret + unparseModifiers(elem.modifiers);
        if (elem.value != null) {
            ret = ret + "=" + unparseValue(elem.value);
        }
        if (elem.description != null) {
            ret = ret + ' "' + elem.description + '"';
        }
        ret = ret + ";\n";
    } else {
        throw new Error("Invalid element: " + elem);
    }
    return ret;
}

export function unparse(tree: Node[] | Node, recursive?: boolean) {
    let ret = "";
    const recurse = recursive || true;
    if (tree instanceof Array) {
        for (let i = 0; i < tree.length; i++) {
            ret = ret + unparseTree(tree[i], 0, recursive || false);
        }
    } else {
        ret = ret + unparseTree(tree, 0, recursive || false);
    }
    return ret;
}

export function visit(tree: Node[], f: (n: Node) => void) {
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        f(node);
        if (node.element === "definition") {
            visit(node.contents, f);
        }
    }
}

export function flatten(tree: AST, filter: (e: Node) => boolean) {
    const elems: Node[] = [];
    visit(tree, (e: Node) => {
        if (filter) {
            if (filter(e)) elems.push(e);
        } else elems.push(e);
    });
    return elems;
}

/* Some useful predicates that can be used for filtering */
export const pred = {
    isDefinition: (d: Node) => {
        return d.element === "definition";
    },
    matchesRule: (pat: string) => {
        return (d: Node) => {
            if (d.rulename) {
                return d.rulename.match(pat) != null;
            }
            return false;
        };
    },
    hasQualifier: (qual: string) => {
        return (d: Node) => {
            for (let i = 0; i < d.qualifiers.length; i++) {
                if (d.qualifiers[i] === qual) return true;
            }
            return false;
        };
    },
};
