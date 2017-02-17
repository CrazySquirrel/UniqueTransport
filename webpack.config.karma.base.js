"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";

const StringReplacePlugin = require("string-replace-webpack-plugin");

const WebpackNotifierPlugin = require("webpack-notifier");

const BrowserSyncPlugin = require("browser-sync-webpack-plugin");

const webpack = require("webpack");

const compress = require("compression");

const packagenpm = require("./package.json");

const path = require("path");

const fs = require("fs");

/**
 * Plugins list
 */
let arrPlugins = [
    new WebpackNotifierPlugin(),
    new StringReplacePlugin(),
    new BrowserSyncPlugin({
        host: "localhost",
        port: 8080,
        server: {
            baseDir: ["./"],
            middleware: function (req, res, next) {
                var gzip = compress();
                gzip(req, res, next);
            }
        }
    }),
    new webpack.DefinePlugin({
        "process.env": {
            NODE_ENV: JSON.stringify(NODE_ENV)
        }
    })
];

if (NODE_ENV === "production") {
    arrPlugins.push(
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            sourceMap: false,
            output: {
                comments: false
            },
            compressor: {
                warnings: false
            }
        })
    );
}

module.exports = {
    entry: {},
    output: {
        filename: "[name].js",
        library: "UniqueTransport",
        libraryTarget: "umd",
        umdNamedDefine: true
    },
    externals: {
        "UniqueTransport": "UniqueTransport"
    },
    devtool: (
        NODE_ENV === "development" ? "inline-source-map" : ""
    ),
    plugins: arrPlugins,
    node: {
        fs: "empty"
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
        alias: {
            "AnimationFrame": path.join(__dirname, "node_modules")
            + "/AnimationFrame/lib/AnimationFrame.ts"
        }
    },
    resolveLoader: {
        root: path.join(__dirname, "node_modules")
    },
    module: {
        loaders: [
            {
                test: /\.ts(x?)$/,
                loaders: [
                    StringReplacePlugin.replace({
                        replacements: [
                            {
                                pattern: /#HASH#/gi,
                                replacement: function (string, pattern1) {
                                    return crypto.createHash("md5").update(
                                        (new Date()).getTime().toString()).digest("hex");
                                }
                            },
                            {
                                pattern: /#PACKAGE_NAME#/gi,
                                replacement: function (string, pattern1) {
                                    return packagenpm.name;
                                }
                            },
                            {
                                pattern: /#PACKAGE_VERSION#/gi,
                                replacement: function (string, pattern1) {
                                    return packagenpm.version;
                                }
                            },
                            {
                                pattern: /require\(\"..\/html\/index.html\"\);/ig,
                                replacement: function (string, pattern1) {
                                    try {
                                        let js = fs.readFileSync("./dist/js/Anti-AdBlock.js",
                                            "utf-8");
                                        let html = fs.readFileSync("./src/html/index.html",
                                            "utf-8");
                                        html = html.replace("{{Anti-AdBlock}}", js);
                                        fs.writeFileSync("./dist/index.html", html);
                                    } catch (e) {

                                    }
                                    return "";
                                }
                            }
                        ]
                    }),
                    "babel-loader?presets[]=babel-preset-es2015-loose&plugins[]=istanbul",
                    "ts-loader"
                ]
            },
            {
                test: /\.png/,
                loader: path.join(__dirname,
                    "./src/loaders/base64-loader.js?type=image/png")
            },
            {
                test: /\.jpg/,
                loader: path.join(__dirname,
                    "./src/loaders/base64-loader.js?type=image/jpeg")
            },
            {
                test: /\.gif/,
                loader: path.join(__dirname,
                    "./src/loaders/base64-loader.js?type=image/gif")
            }
        ]
    }
};
