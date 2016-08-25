module.exports = function(env) {

  function registerParamsByName(s, k, a, name, params) {
    var value = util.registerParams(env, name, () => { return params });
    return k(s, value);
  };

  return { registerParamsByName };
};
