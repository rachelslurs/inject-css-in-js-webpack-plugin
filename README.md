# inject-css-in-js-webpack-plugin
A webpack plugin to convert an external stylesheet to an embedded stylesheet in JS

# html-inline-css-webpack-plugin
<!--[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/rachelslurs/inject-css-in-js-webpack-plugin/pulls)
 [![npm version](https://badge.fury.io/js/html-inline-css-webpack-plugin.svg)](https://badge.fury.io/js/html-inline-css-webpack-plugin)

A webpack plugin to convert an external stylesheet to an embedded stylesheet in JS. Heavily inspired by [HtmlInlineCSSWebpackPlugin](https://github.com/Runjuu/html-inline-css-webpack-plugin) which is for making CSS internal in HTML files as opposed to JS files.

```
<link rel="stylesheet" /> => document.createTextNode(document.createElement('style'))
```

Requires [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)
If you are using [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin), whatever CSS bundle you want needs to have `inject: false` for the HtmlWebpackPlugin for that chunk.

## Install
#### NPM
```bash
npm i inject-css-in-js-webpack-plugin -D
```
#### Yarn
```bash
yarn add inject-css-in-js-webpack-plugin -D
```

## Example
```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InjectCssInJsWebpackPlugin = require("inject-css-in-js-webpack-plugin").default;

module.exports = {
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
        }),
        new HtmlWebpackPlugin({
            inject: false
        }),
        new InjectCssInJsWebpackPlugin( new HTMLInlineCSSWebpackPlugin({
            filter(filename) {
                return filename.includes('bundle'); // use filter if you only want to inline css from the CSS file with bundle in the filename
            },
            replace: {
                fileTarget: 'bundle', // this is the built file we'll look for the target to replace with the style tag
                target: '<span data-css="true"></span>' // this will be replaced with the style tag
            }
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            }
        ]
    }
}
```

## Config
```typescript
interface Config {
    filter?(filename: string): boolean
    replace?: {
        fileTarget?: string
        target: string
    }
}
```

### filter(optional)
```typescript
filter?(filename: string): boolean
```
Return `true` to make current file internal, otherwise ignore current file.

##### example
```javascript
  new InjectCssInJsWebpackPlugin({
    filter(filename) {
      return filename.includes('bundle')
    }
  })
```

### replace(optional)
```typescript
replace?: {
    fileTarget?: string
    target?: string
}
```

#### fileTarget
A file to search for the target ie bundle.js
#### target
A target in the generated Javascript for adding the internal stylesheet

##### example
```javascript
ReactDOM.render(
    <React.Fragment>
        {/* Replace this comment */ }
        <h1>I'm getting styles nearby</h1>
    </React.Fragment>,
    document.getElementById('root')
)
```

```typescript
...
  new InjectCssInJsWebpackPlugin({
    filter(filename) {
        return filename.includes('bundle')
    },
    replace: {
      fileTarget: 'bundle.js',
      target: '/* Replace this comment */',
    },
  }),
...
```
###### Output:
```javascript
```
 -->
 
 Work in progress!
