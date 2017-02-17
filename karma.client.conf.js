"use strict";

let webpackConfig = require('./webpack.config.karma.client');
webpackConfig.entry = {};

let karmaConfig = require('./karma.base.conf');

karmaConfig.frameworks = ['jasmine', 'jasmine-matchers', 'source-map-support'];

karmaConfig.webpack = {
  module: webpackConfig.module,
  resolve: webpackConfig.resolve
};

karmaConfig.files = [
  "./spec/client.spec.ts"
];

module.exports = function (config) {
  karmaConfig.logLevel = config.LOG_INFO;

  config.set(karmaConfig)
};
