import { Compiler } from 'webpack';
interface ReplaceConfig {
    fileTarget?: string;
    target: string;
}
interface Config {
    filter?(filename: string): boolean;
    replace?: ReplaceConfig;
}
export default class Plugin {
    private readonly config;
    static addStyle(js: string, style: string, replaceConfig: ReplaceConfig): string;
    static cleanUp(js: string, replaceConfig: ReplaceConfig): string;
    private css;
    private js;
    constructor(config?: Config);
    private filter;
    private prepare;
    private process;
    apply(compiler: Compiler): void;
}
export {};
