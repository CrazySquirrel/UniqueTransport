"use strict";

let webpack = require("./webpack.test.base");

webpack.entry = {
  "./spec/Server.spec": ["./spec/Server.spec.ts"]
};

webpack.target = "node";

module.exports = webpack;
