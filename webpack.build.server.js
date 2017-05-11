"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";

const MODE = NODE_ENV.split(":")[0];

const MODE_2 = NODE_ENV.split(":")[1];

let webpack = require("./webpack.build.base");

webpack.entry = {
  "./lib/js/server": ["./lib/ts/server.ts"]
};

if (MODE_2 !== "stat") {
  webpack.entry = Object.assign(
      webpack.entry,
      {
        "./dist/js/server": ["./src/ts/server.ts"]
      }
  );
}

webpack.target = "node";

module.exports = webpack;
