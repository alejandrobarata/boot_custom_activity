'use strict';

requirejs.config({
  paths: {
    postmonger: 'postmonger.min',
  },
  shim: {
    'jquery.min': {
      exports: '$',
    },
    'customActivity.min': {
      deps: ['jquery.min', 'postmonger'],
    },
  },
});

requirejs(['jquery.min', 'customActivity.min'], function ($, customEvent) {});

requirejs.onError = function (err) {
  if (err.requireType === 'timeout') {
    console.log('modules: ' + err.requireModules);
  }
  throw err;
};
