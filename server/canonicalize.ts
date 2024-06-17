// based loosely on https://github.com/isaacs/json-stringify-nice/blob/master/index.js
// XXX move to lib

function isObj(val: any) {
  return !!val && !Array.isArray(val) && typeof val === 'object'
}

function sort(key: any, val: any) {
  if (!isObj(val))
    return val

  // The reason this works is ES2015 *does* guarantee that the order
  // that Object.keys and Object.entries and the like enumerate keys
  // in is deterministic, and is in fact determined by (although is
  // not necessarily the same as) insertion order. So we take any
  // object and reinsert its keys in sorted order, and that yields
  // something deterministic --- if perhaps surprising for numeric
  // keys, but I don't expect to use them a lot.
  // The canonical citation is
  // https://tc39.es/ecma262/#sec-ordinaryownpropertykeys
  // and I found this out from
  // https://stackoverflow.com/questions/5525795/does-javascript-guarantee-object-property-order
  const ret = Object.entries(val).sort(
    ([ak, av], [bk, bv]) =>
      isObj(av) === isObj(bv) ? ak.localeCompare(bk)
        : isObj(av) ? 1
          : -1
  ).reduce((set: Record<string, any>, [k, v]) => {
    set[k] = v
    return set
  }, {})

  return ret
}

export function canonicalize(value: any) {
  return JSON.stringify(value, sort, 2);
}
