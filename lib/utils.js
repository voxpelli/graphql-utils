// TODO: Replace with @voxpelli/typed-utils

/**
 * @template T
 * @param {T} value
 * @returns {(T & String) | undefined}
 */
const getStringValue = (value) => typeof value === 'string' ? value : undefined;

/**
 * @template {any} T
 * @template {keyof T} K
 * @param {T[]} input
 * @param {K} key
 * @returns {Array<T[K]>}
 */
export const pickSubsetFromArray = (input, key) => {
  /** @type {Array<T[K]>} */
  const result = [];
  for (const value of input) {
    result.push(value[key]);
  }
  return result;
};

/**
 * @template {any} T
 * @template {keyof T} K
 * @param {T[]} input
 * @param {K} key
 * @returns {Array<T[K] & String>}
 */
export const pickStringSubsetFromArray = (input, key) => {
  /** @type {Array<T[K] & String>} */
  const result = [];
  for (const value of input) {
    const stringValue = getStringValue(value[key]);
    if (stringValue !== undefined) result.push(stringValue);
  }
  return result;
};

/**
 * @template {any} T
 * @template {keyof T} K
 * @param {T[]} input
 * @param {K} key
 * @returns {Map<T[K], T>}
 */
export const arrayToKeyedObject = (input, key) => {
  /** @type {Map<T[K], T>} */
  const result = new Map();

  for (const value of input) {
    result.set(value[key], value);
  }
  return result;
};
