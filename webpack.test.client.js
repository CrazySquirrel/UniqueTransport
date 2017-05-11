"use strict";

let webpack = require("./webpack.test.base");

webpack.entry = {
  "./spec/Client.spec": ["./spec/Client.spec.ts"]
};

webpack.target = "web";

module.exports = webpack;
