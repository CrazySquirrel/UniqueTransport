"use strict";

let webpackConfig = require('./webpack.test.client');
webpackConfig.entry = {};

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'jasmine-matchers', 'source-map-support'],
    files: [
      "./spec/Client.spec.ts"
    ],
    exclude: [],
    preprocessors: {
      'lib/**/*.ts': ['webpack'],
      'spec/**/*.ts': ['webpack']
    },
    webpack: {
      module: webpackConfig.module,
      resolve: webpackConfig.resolve
    },
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: './doc/report/client',
      reporters: [
        {type: 'json', subdir: '.', file: 'coverage-final.json'}
      ]
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity,
    browserDisconnectTimeout: 60000,
    browserNoActivityTimeout: 60000,
    webpackServer: {
      noInfo: true,
      stats: {
        chunks: false
      }
    },
    browsers: [
      'PhantomJS'
    ]
  })
};
