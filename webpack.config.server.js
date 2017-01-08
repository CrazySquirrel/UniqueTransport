"use strict";

var webpack = require("./webpack.config.base");

webpack.entry = {
    "./lib/js/server": ["./lib/ts/server.ts"],
    "./dist/js/server": ["./src/ts/server.ts"]
};

webpack.target = "node";

module.exports = webpack;