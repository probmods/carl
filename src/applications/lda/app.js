'use strict'; // @flow

var fs = require('fs');
var path = require('path');

// This file is not transpiled by babel-node, since it is required at runtime
// from settings.js via a non-literal `require`.

module.exports = {
  learn: {
    data: JSON.parse(fs.readFileSync(path.join(__dirname, 'cocolabAbstractCorpus.json'), 'utf-8'))
  }
};
