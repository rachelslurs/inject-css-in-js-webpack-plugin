import { Compiler, Configuration } from 'webpack';

type File = {
    [key: string]: string
};

type Asset = {
    source(): string
    size(): number
};

interface Compilation {
    assets: { [key: string]: Asset }
}

interface ReplaceConfig {
    fileTarget?: string
    target?: string
}

interface Config {
    filter?(filename: string): boolean
    replace?: ReplaceConfig
}

const DEFAULT_REPLACE_CONFIG: ReplaceConfig = {
    target: '/* Replace this comment */',
    fileTarget: 'bundle.js'
};

export default class Plugin {
    static addStyle(js: string, style: string, replaceConfig: ReplaceConfig) {
        const styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        const styleString = styleTag.appendChild(document.createTextNode(style));
        
        const replaceValues = [styleString, replaceConfig.target];

        // if (replaceConfig.position === 'after') {
        //     replaceValues.reverse()
        // }

        return js.replace(replaceConfig.target, replaceValues.join(''));
    }

    static cleanUp(js: string, replaceConfig: ReplaceConfig) {
        return js;
    }

    private css: File = {};

    private js: File = {};

    constructor(private readonly config: Config = {}) { }

    private filter(filename: string): boolean {
        if (typeof this.config.filter === 'function') {
            return this.config.filter(filename);
        } else {
            return true;
        }
    }

    private prepare({ assets }: Compilation) {
        const isCSS = is('css');
        const isJS = is('js');

        Object.keys(assets).forEach((filename) => {
            if (isCSS(filename)) {
                console.log(filename, 'css')
                const doesCurrentFileNeedToBeAddedToJs = this.filter(filename);
                if (doesCurrentFileNeedToBeAddedToJs) {
                    this.css[filename] = assets[filename].source();
                    delete assets[filename];
                }
            } else if (isJS(filename)) {
                console.log(filename, 'js')
                this.js[filename] = assets[filename].source();
            }
        });
    }

    private process({ assets }: Compilation, { output }: Configuration) {
        const publicPath = (output && output.publicPath) || '';
        console.log(publicPath)
        const { replace: replaceConfig = DEFAULT_REPLACE_CONFIG } = this.config;

        Object.keys(this.js).forEach((jsFileName) => {
            let js = this.js[jsFileName];

            Object.keys(this.css).forEach((key) => {
                js = Plugin.addStyle(js, this.css[key], replaceConfig);
            });

            js = Plugin.cleanUp(js, replaceConfig);

            assets[jsFileName] = {
                source() { return js },
                size() { return js.length },
            };
        });
    }

    apply(compiler: Compiler) {
        compiler.hooks.emit.tapAsync('inject-css-in-js-webpack-plugin', (compilation: Compilation, callback: () => void) => {
            this.prepare(compilation);
            this.process(compilation, compiler.options);
            callback();
        });
    }
}

function is(filenameExtension: string) {
    const reg = new RegExp(`\.${filenameExtension}$`);
    return (filename: string) => reg.test(filename);
}
