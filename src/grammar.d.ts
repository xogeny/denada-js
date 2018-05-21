export interface IParseOptions {}
import { AST } from "./ast";

export declare function parse(s: string, options: IParseOptions): AST;
