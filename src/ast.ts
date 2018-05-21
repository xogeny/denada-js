import { RuleData } from "./rule";

export interface ParseRange {
    column: number;
    line: number;
    offset: number;
}

export interface ParseLocation {
    start: ParseRange;
    end: ParseRange;
}

export type Modifiers = { [key: string]: any };

export interface BaseNode {
    qualifiers: string[];
    modifiers: Modifiers;

    description: string | null;
    rulename?: string;
    count?: number;
    ruledata?: RuleData;

    location?: ParseLocation;
    file?: string;
}

export interface DefinitionNode extends BaseNode {
    element: "definition";
    name: string;
    contents: Node[];
}

export interface DeclarationNode extends BaseNode {
    element: "declaration";
    typename: string;
    varname: string;
    value: any;
}

export type Node = DefinitionNode | DeclarationNode;

export type AST = Node[];

export const sample: AST = [
    {
        element: "definition",
        qualifiers: ["printer"],
        modifiers: [],
        name: "ABC",
        contents: [
            {
                element: "declaration",
                qualifiers: [],
                typename: "set",
                modifiers: [],
                varname: "location",
                value: "By my desk",
                description: null,
                rulename: "location",
                count: 0,
            },
            {
                element: "declaration",
                qualifiers: [],
                typename: "set",
                modifiers: [],
                varname: "model",
                value: "HP 8860",
                description: null,
                rulename: "model",
                count: 0,
            },
        ],
        description: null,
        rulename: "printer",
        count: 0,
    },
    {
        element: "definition",
        qualifiers: ["printer"],
        modifiers: [],
        name: "DEF",
        contents: [
            {
                element: "declaration",
                qualifiers: [],
                typename: "set",
                modifiers: [],
                varname: "location",
                value: "By my desk",
                description: null,
                rulename: "location",
                count: 0,
            },
            {
                element: "declaration",
                qualifiers: [],
                typename: "set",
                modifiers: [],
                varname: "model",
                value: "HP 8860",
                description: null,
                rulename: "model",
                count: 0,
            },
            {
                element: "declaration",
                qualifiers: [],
                typename: "set",
                modifiers: [],
                varname: "networkName",
                value: "PrinterDEF",
                description: null,
                rulename: "name",
                count: 0,
            },
        ],
        description: null,
        rulename: "printer",
        count: 1,
    },
    {
        element: "definition",
        qualifiers: ["computer"],
        modifiers: [],
        name: "XYZ",
        contents: [
            {
                element: "declaration",
                qualifiers: [],
                typename: "set",
                modifiers: [],
                varname: "location",
                value: "On my desk",
                description: null,
                rulename: "location",
                count: 0,
            },
            {
                element: "declaration",
                qualifiers: [],
                typename: "set",
                modifiers: [],
                varname: "model",
                value: "Mac Book Air",
                description: null,
                rulename: "model",
                count: 0,
            },
        ],
        description: null,
        rulename: "computer",
        count: 0,
    },
];
