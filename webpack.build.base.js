"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";

const MODE = NODE_ENV.split(":")[0];

const MODE_2 = NODE_ENV.split(":")[1];

const StringReplacePlugin = require("string-replace-webpack-plugin");

const WebpackNotifierPlugin = require("webpack-notifier");

const BrowserSyncPlugin = require("browser-sync-webpack-plugin");

const path = require("path");

const webpack = require("webpack");

const fs = require("fs");

const crypto = require("crypto");

const compress = require("compression");

const packagenpm = require("./package.json");

const ExtractTextPlugin = require("extract-text-webpack-plugin");

const BundleAnalyzerPlugin = require(
    "webpack-bundle-analyzer"
).BundleAnalyzerPlugin;

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
 * Add BrowserSync for development mode
 */
if (MODE_2 === "stat") {
  arrPlugins.push(
      new BundleAnalyzerPlugin()
  );
}
/**
 * Add BrowserSync for development mode
 */
if (MODE_2 === "watch") {
  arrPlugins.push(
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
      })
  );
}
/**
 * Add uglifyer for production mode
 */
if (MODE === "production" || MODE === "testing") {
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
/**
 * Add additional plugins
 */
arrPlugins.push(
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(MODE)
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
  entry: {},
  output: {
    filename: MODE === "production" ? "[name].js" : "[name].js",
    library: "UniqueTransport",
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  externals: {
    "UniqueTransport": "UniqueTransport"
  },
  devtool: (
      MODE === "development" ? "inline-source-map" : (
          MODE === "testing" ? "inline-source-map" : ""
      )
  ),
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