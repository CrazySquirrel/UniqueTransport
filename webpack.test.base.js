"use strict";

const StringReplacePlugin = require("string-replace-webpack-plugin");

const WebpackNotifierPlugin = require("webpack-notifier");

const path = require("path");

const webpack = require("webpack");

const fs = require("fs");

const crypto = require("crypto");

const packagenpm = require("./package.json");

const ExtractTextPlugin = require("extract-text-webpack-plugin");

let extractHTML = new ExtractTextPlugin("[name].html");

/**
 * Plugins list
 */
let arrPlugins = [
  new WebpackNotifierPlugin(),
  new StringReplacePlugin(),
  extractHTML
];
/**
 * Add uglifyer for production mode
 */
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
/**
 * Add additional plugins
 */
arrPlugins.push(
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": "test"
    })
);

let replacements = StringReplacePlugin.replace({
  replacements: [
    {
      pattern: /#HASH#/gi,
      replacement: () => {
        return crypto.createHash("md5").update(
            (new Date()).getTime().toString()).digest("hex");
      }
    },
    {
      pattern: /#PACKAGE_NAME#/gi,
      replacement: () => {
        return packagenpm.name;
      }
    },
    {
      pattern: /#PACKAGE_VERSION#/gi,
      replacement: () => {
        return packagenpm.version;
      }
    },
    {
      pattern: /require\(\"..\/html\/index.html\"\);/ig,
      replacement: () => {
        let js = fs.readFileSync("./dist/js/Anti-AdBlock.js", "utf-8");
        let html = fs.readFileSync("./src/html/index.html", "utf-8");
        html = html.replace("{{Anti-AdBlock}}", js);
        fs.writeFileSync("./dist/index.html", html);
        return "";
      }
    }
  ]
});

module.exports = {
  output: {
    filename: "[name].js",
    library: "UniqueTransport",
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  externals: {
    "UniqueTransport": "UniqueTransport"
  },
  devtool: "inline-source-map",
  plugins: arrPlugins,
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },
  resolveLoader: {
    extensions: [".js", ".ts", ".jsx", ".tsx"]
  },
  module: {
    loaders: [
      {
        test: /\.ts(x?)$/,
        include: [
          path.resolve(__dirname, "lib")
        ],
        use: [
          {
            loader: replacements
          },
          {
            loader: "babel-loader",
            options: {
              presets: ["es2015"],
              plugins: ["istanbul"]
            }
          },
          {
            loader: "ts-loader"
          }
        ]
      },
      {
        test: /\.ts(x?)$/,
        exclude: [
          path.resolve(__dirname, "lib")
        ],
        use: [
          {
            loader: replacements
          },
          {
            loader: "babel-loader",
            options: {
              presets: ["es2015"]
            }
          },
          {
            loader: "ts-loader"
          }
        ]
      },
      {
        test: /\.png/,
        use: path.join(__dirname,
            "./src/loaders/base64-loader.js?type=image/png")
      },
      {
        test: /\.jpg/,
        use: path.join(__dirname,
            "./src/loaders/base64-loader.js?type=image/jpeg")
      },
      {
        test: /\.gif/,
        use: path.join(__dirname,
            "./src/loaders/base64-loader.js?type=image/gif")
      },
      {
        test: /\.json$/,
        use: 'json-loader'
      }
    ]
  }
};