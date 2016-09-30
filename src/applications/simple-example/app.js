'use strict'; // @flow

// This file is not transpiled by babel-node, since it is required at runtime
// from settings.js via a non-literal `require`.

var _ = require('lodash');

module.exports = {
  observe: {
    requiredFields: ['coinNumber', 'outcome']
  },
  learn: {
    prepareObservations(data: Array<Object>): Array<Array<Object>> {
      // prepare observations for use in webppl using mapData/foldData
      const groupedData = _.groupBy(data, 'coinNumber');
      const sortedData = _.mapValues(groupedData, (value) => {
        return _.sortBy(value, 'datetime');
      });
      const parsedData = _.mapValues(sortedData, (coinObservations) => {
        return coinObservations.map((observation) => {
          return (observation.outcome == "1") ? true : false;
        });
      });
      return parsedData;
    },
    parameterNames: ['theta']
  }
};

