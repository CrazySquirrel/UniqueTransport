"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";

const MODE = NODE_ENV.split(":")[0];

const MODE_2 = NODE_ENV.split(":")[1];

let webpack = require("./webpack.build.base");

webpack.entry = {
  "./lib/js/client": ["./lib/ts/client.ts"]
};

if (MODE_2 !== "stat") {
  webpack.entry = Object.assign(
      webpack.entry,
      {
        "./dist/js/client": ["./src/ts/client.ts"]
      }
  );
}

webpack.target = "web";

module.exports = webpack;
