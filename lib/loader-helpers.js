import { mapArray, pickStringSubsetFromArray, pickSubsetFromArray } from './utils.js';

/** @typedef {import('sql-template-tag').Sql} Sql */

/**
 * @template {Record<string, any>} From
 * @template {Record<string, any>} To
 * @typedef {import('./mercurius-types.js').LoaderWithReturn<From, Promise<(To|undefined)[]>>} OneToOneLoader
 */

/**
 * @template {Record<string, any>} From
 * @template {{ id: string, [key: string]: any }} To
 * @param {Array<{ obj: From }>} queries
 * @param {import('./mercurius-types.js').CustomContext} info
 * @param {keyof From} sourceField
 * @param {(ids: string[], info: import('./mercurius-types.js').CustomContext) => Promise<To[]>} loader
 * @returns {Promise<(To|undefined)[]>}
 */
export async function oneToOneLoader (queries, info, sourceField, loader) {
  const objs = pickSubsetFromArray(queries, 'obj');
  const entityTargets = pickStringSubsetFromArray(objs, sourceField);

  if (entityTargets.length === 0) return [];

  const uniqueTargetIds = [...(new Set(entityTargets))];

  const rows = await loader(uniqueTargetIds, info);

  /** @type {(To|undefined)[]} */
  const result = [];
  const byId = mapArray(rows, targetField);

  for (const query of queries) {
    const queryObjId = query && query.obj && query.obj[sourceField];

    /** @type {(To|undefined)} */
    const entityTarget = queryObjId ? byId.get(queryObjId) : undefined;

    result.push(entityTarget);
  }

  return result;
}

/**
 * @template {Record<string, any>} From
 * @template {Record<string, any>} To
 * @typedef {import('./mercurius-types.js').LoaderWithReturn<From, Promise<(To[])[]>>} OneToManyLoader
 */

/**
 * @template {{ id: string, [key: string]: any }} From
 * @template {{ [key: string]: any }} To
 * @param {Array<{ obj: From }>} queries
 * @param {import('./mercurius-types.js').CustomContext} info
 * @param {(ids: string[], info: import('./mercurius-types.js').CustomContext) => Promise<{ fromId: string, rows: To[] }[]>} loader
 * @returns {Promise<To[][]>}
 */
export async function oneToManyLoader (queries, info, loader) {
  const sourceField = 'id';
  const objs = pickSubsetFromArray(queries, 'obj');
  const entityTargets = pickStringSubsetFromArray(objs, sourceField);

  if (entityTargets.length === 0) return [];

  const uniqueTargetIds = [...(new Set(entityTargets))];

  const rows = await loader(uniqueTargetIds, info);

  /** @type {To[][]} */
  const result = [];
  const byId = mapArray(rows, 'fromId');

  for (const query of queries) {
    const queryObjId = query && query.obj && query.obj[sourceField];

    /** @type {To[]} */
    const entityTarget = (queryObjId && byId.get(queryObjId)?.rows) || [];

    result.push(entityTarget);
  }

  return result;
}
