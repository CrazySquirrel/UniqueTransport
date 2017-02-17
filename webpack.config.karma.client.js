"use strict";

let webpack = require("./webpack.config.karma.base");

webpack.entry = {
  "./lib/js/client": ["./lib/ts/client.ts"],
  "./dist/js/client": ["./src/ts/client.ts"]
};

webpack.target = "web";

module.exports = webpack;
