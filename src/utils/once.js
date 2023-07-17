/* eslint-disable no-param-reassign */
export default function once(fn, context) {
  let result;

  return function closer(...args) {
    if (fn) {
      result = fn.apply(context || this, args);
      fn = null;
    }

    return result;
  };
}
