var _ = require('lodash');
var assert = require('assert');


module.exports = function(env) {

  var Tensor = T['__Tensor'];
  assert.ok(Tensor); // webppl puts T in global scope

  function serializeTensor(tensor) {
    return {
      dims: tensor.dims,
      data: tensor.toFlatArray()
    };
  }
  
  function serializeParams(s, k, a, paramObj) {
    var prms = _.mapValues(paramObj, function(lst) {
      return lst.map(serializeTensor);
    });
    return k(s, prms);
  }

  function deserializeParams(s, k, a, paramObj) {
    var prms = {};
    for (var name in paramObj) {
      prms[name] = paramObj[name].map(function(tensor) {
        return new Tensor(tensor.dims).fromFlatArray(tensor.data);
      });
    }
    return k(s, prms);
  }

  return { serializeParams, deserializeParams };
};
