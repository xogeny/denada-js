import { Node } from "./ast";

export interface RuleDescription {
    recursive: boolean;
    name: string;
    min: number;
    max: number;
}

export interface RuleData {
    matches: Node[];
    recursive: boolean;
    rulename: string;
    desc: string;
    count: number;
    min: number;
    max: number;
}
