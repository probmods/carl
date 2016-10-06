type Compiled = {
  code: string,
  sourceMap: Object,
  addressMap: Object
};

type Params = { [key: string]: Array<{ dims: Array<number>, data: Array<number> }> };
