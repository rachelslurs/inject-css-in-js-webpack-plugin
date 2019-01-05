(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEFAULT_REPLACE_CONFIG = {
        target: '/* Replace this comment */',
        fileTarget: 'bundle.js'
    };
    var Plugin = /** @class */ (function () {
        function Plugin(config) {
            if (config === void 0) { config = {}; }
            this.config = config;
            this.css = {};
            this.js = {};
        }
        Plugin.addStyle = function (js, style, replaceConfig) {
            var styleString = "var styleTag = document.createElement('style'); styleTag.type = 'text/css'; styleTag.appendChild(document.createTextNode(" + style + ")); var headTag=(document.getElementsByTagName('head'); headTag.appendChild(styleTag); ";
            var replaceValues = [styleString, replaceConfig.target];
            console.log(js.replace(replaceConfig.target, replaceValues.join('')));
            return js.replace(replaceConfig.target, replaceValues.join(''));
        };
        Plugin.cleanUp = function (js, replaceConfig) {
            // console.log(js, 'js')
            return js;
        };
        Plugin.prototype.filter = function (filename) {
            // console.log(filename, 'filename')
            if (typeof this.config.filter === 'function') {
                return this.config.filter(filename);
            }
            else {
                return true;
            }
        };
        Plugin.prototype.prepare = function (_a) {
            var _this = this;
            var assets = _a.assets;
            var isCSS = is('css');
            var isJS = is('js');
            // console.log(assets, 'assets')
            Object.keys(assets).forEach(function (filename) {
                // console.log(filename, 'filename')
                if (isCSS(filename)) {
                    var doesCurrentFileNeedToBeAddedToJs = _this.filter(filename);
                    if (doesCurrentFileNeedToBeAddedToJs) {
                        _this.css[filename] = assets[filename].source();
                        delete assets[filename];
                    }
                }
                else if (isJS(filename)) {
                    _this.js[filename] = assets[filename].source();
                }
            });
        };
        Plugin.prototype.process = function (_a, _b) {
            var _this = this;
            var assets = _a.assets;
            var output = _b.output;
            var publicPath = (output && output.publicPath) || '';
            console.log(publicPath, 'publicPath');
            // console.log(assets, 'assets')
            console.log(output, 'output');
            var _c = this.config.replace, replaceConfig = _c === void 0 ? DEFAULT_REPLACE_CONFIG : _c;
            Object.keys(this.js).forEach(function (jsFileName) {
                var js = _this.js[jsFileName];
                Object.keys(_this.css).forEach(function (key) {
                    // console.log('thiscsskey', this.css[key])
                    js = Plugin.addStyle(js, _this.css[key], replaceConfig);
                });
                js = Plugin.cleanUp(js, replaceConfig);
                // console.log('final!!', js)
                assets[jsFileName] = {
                    source: function () { return js; },
                    size: function () { return js.length; },
                };
            });
        };
        Plugin.prototype.apply = function (compiler) {
            var _this = this;
            compiler.hooks.emit.tapAsync('inject-css-in-js-webpack-plugin', function (compilation, callback) {
                _this.prepare(compilation);
                _this.process(compilation, compiler.options);
                callback();
            });
        };
        return Plugin;
    }());
    exports.default = Plugin;
    function is(filenameExtension) {
        var reg = new RegExp("." + filenameExtension + "$");
        return function (filename) { return reg.test(filename); };
    }
});
//# sourceMappingURL=index.js.map