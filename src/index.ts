import { Compiler, Configuration } from 'webpack';
import addStyles from './lib/addStyles'

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
    target: string
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
        const styleString = `var styleTag = document.createElement('style'); styleTag.type = 'text/css'; styleTag.appendChild(document.createTextNode(${style})); var headTag=(document.getElementsByTagName('head'); headTag.appendChild(styleTag); `;
        const replaceValues = [styleString, replaceConfig.target];
        console.log(js.replace(replaceConfig.target, replaceValues.join('')))
        return js.replace(replaceConfig.target, replaceValues.join(''));
    }

    static cleanUp(js: string, replaceConfig: ReplaceConfig) {
        // console.log(js, 'js')
        return js;
    }

    private css: File = {};

    private js: File = {};

    constructor(private readonly config: Config = {}) { }

    private filter(filename: string): boolean {
        // console.log(filename, 'filename')
        if (typeof this.config.filter === 'function') {
            return this.config.filter(filename);
        } else {
            return true;
        }
    }

    private prepare({ assets }: Compilation) {
        const isCSS = is('css');
        const isJS = is('js');

        // console.log(assets, 'assets')

        Object.keys(assets).forEach((filename) => {
            // console.log(filename, 'filename')
            if (isCSS(filename)) {
                const doesCurrentFileNeedToBeAddedToJs = this.filter(filename);
                if (doesCurrentFileNeedToBeAddedToJs) {
                    this.css[filename] = assets[filename].source();
                    delete assets[filename];
                }
            } else if (isJS(filename)) {
                this.js[filename] = assets[filename].source();
            }
        });
    }

    private process({ assets }: Compilation, { output }: Configuration) {
        const publicPath = (output && output.publicPath) || '';
        console.log(publicPath, 'publicPath')
        // console.log(assets, 'assets')
        console.log(output, 'output')
        const { replace: replaceConfig = DEFAULT_REPLACE_CONFIG } = this.config;

        Object.keys(this.js).forEach((jsFileName) => {
            let js = this.js[jsFileName];

            Object.keys(this.css).forEach((key) => {
                // console.log('thiscsskey', this.css[key])
                js = Plugin.addStyle(js, this.css[key], replaceConfig);
            });

            js = Plugin.cleanUp(js, replaceConfig);
            // console.log('final!!', js)

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
