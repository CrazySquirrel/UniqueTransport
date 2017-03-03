"use strict";

module.exports = {
  basePath: '',
  exclude: [],
  preprocessors: {
    'lib/**/*.ts': ['webpack'],
    'spec/**/*.ts': ['webpack']
  },
  reporters: ['progress', 'coverage'],
  coverageReporter: {
    dir: './doc/coverage',
    reporters: [
      {type: 'html', subdir: 'report-html'},
      {type: 'lcov', subdir: 'report-lcov'},
      {type: 'cobertura', subdir: '.', file: 'cobertura.txt'},
      {type: 'lcovonly', subdir: '.', file: 'report-lcovonly.txt'},
      {type: 'teamcity', subdir: '.', file: 'teamcity.txt'},
      {type: 'text', subdir: '.', file: 'text.txt'},
      {type: 'text-summary', subdir: '.', file: 'text-summary.txt'},
      {type: 'json', subdir: '.', file: 'coverage-final.json'}
    ]
  },
  port: 9876,
  colors: true,
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
};