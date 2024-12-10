import sql from 'sql-template-tag';

import { pickStringSubsetFromArray, pickSubsetFromArray } from './utils.js';

/**
 * @template E
 * @typedef Edge
 * @property {E} node
 */

/**
 * @template E
 * @typedef Connection
 * @property {Edge<E>} edges
 * @property {import('./pagination-types.d.ts').PageInfo} pageInfo
 */

/**
 * @typedef PaginationArgs
 * @property {string|null|undefined} [after]
 * @property {string|null|undefined} [before]
 * @property {number|null|undefined} [first]
 * @property {number|null|undefined} [last]
 */

/**
 * @template T
 * @typedef PaginationResponse
 * @property {import('./pagination-types.d.ts').PageInfo} pageInfo
 * @property {Array<{ node: T, cursor: string }>} edges
 */

/**
 * @template T
 * @template Default
 * @typedef {T extends { edges?: infer E } ? E extends Array<infer A> ? A extends { node?: infer N } ? N : Default : Default : Default} NodeFromConnection
 */

/**
 * @typedef PaginationContext
 * @property {boolean} isForwardPagination
 * @property {number} requestedCount
 */

/**
 * @template {Record<string,any>} T
 * @param {T[]} rows
 * @param {PaginationContext} paginationContext
 * @param {(node: T) => string} generateCursorFromNode
 * @returns {PaginationResponse<T>}
 */
function abstractPaginatedResponse (
  rows,
  { isForwardPagination, requestedCount },
  generateCursorFromNode
) {
  /** @type {{ cursor: string, node: T }[]} */
  const edges = [];

  const fillsMoreThanOnePage = rows.length > requestedCount;

  if (fillsMoreThanOnePage) {
    rows = rows.slice(0, -1);
  }

  for (const node of rows) {
    edges.push({
      node,
      cursor: generateCursorFromNode(node),
    });
  }

  const startNode = rows[0];
  const endNode = rows.at(-1);

  return {
    pageInfo: {
      hasNextPage: fillsMoreThanOnePage && isForwardPagination,
      hasPreviousPage: fillsMoreThanOnePage && !isForwardPagination,
      // eslint-disable-next-line unicorn/no-null
      startCursor: startNode ? generateCursorFromNode(startNode) : null,
      // eslint-disable-next-line unicorn/no-null
      endCursor: endNode ? generateCursorFromNode(endNode) : null,
    },
    edges,
  };
}

/**
 * @template {Record<string, any>} From
 * @template {Record<string, any>} To
 * @typedef {import('./mercurius-types.d.ts').LoaderWithReturn<From, Promise<PaginationResponse<To>[]>, PaginationArgs>} PaginatedLoader
 */

/**
 * @template {{ id: string, [key: string]: any }} From
 * @template {{ [key: string]: any }} To
 * @template {PaginationArgs} Params
 * @param {Array<{ obj: From, params: Params }>} queries
 * @param {import('./mercurius-types.d.ts').CustomContext} info
 * @param {(id: string, params: Params | undefined, info: import('./mercurius-types.d.ts').CustomContext) => Promise<PaginationResponse<To>>} loader
 * @returns {Promise<PaginationResponse<To>[]>}
 */
export async function paginatedLoader (queries, info, loader) {
  const sourceField = 'id';
  const objs = pickSubsetFromArray(queries, 'obj');
  const entityTargets = pickStringSubsetFromArray(objs, sourceField);

  if (entityTargets.length === 0) return [];

  return Promise.all(entityTargets.map(async (id, i) => loader(id, queries[i]?.params, info)));
}

/**
 * @typedef TimeCursorNode
 * @property {string} id
 * @property {Date} createdAt
 */

/**
 * @param {TimeCursorNode} node
 * @returns {string}
 */
function generateTimeCursor (node) {
  return Buffer.from(`${node.createdAt.getTime()}::${node.id}`).toString('base64');
}

/**
 * @param {string} cursor
 * @returns {{ id: string, createdAtMs: number }}
 */
function parseTimeCursor (cursor) {
  const [
    rawCreatedAt,
    id,
  ] = Buffer.from(cursor, 'base64').toString().split('::');

  if (!rawCreatedAt || !id) {
    throw new TypeError('Unexpected cursor format');
  }

  const createdAtMs = Number.parseInt(rawCreatedAt, 10);

  if (Number.isNaN(createdAtMs)) {
    throw new TypeError('Cursor timestamp part is not a number');
  }

  return { id, createdAtMs };
}

/**
 * @template {TimeCursorNode} T
 * @param {T[]} rows
 * @param {PaginationContext} paginationContext
 * @returns {PaginationResponse<T>}
 */
export function generatePaginatedResponse (rows, paginationContext) {
  return abstractPaginatedResponse(rows, paginationContext, generateTimeCursor);
}

/**
 * @typedef PaginationSql
 * @property {import('sql-template-tag').Sql[]} paginationCondition
 * @property {PaginationContext} paginationContext
 * @property {number} paginationLimit
 * @property {import('sql-template-tag').Sql} paginationOrder
 */

/**
 * @param {PaginationArgs | undefined} params
 * @param {number} [defaultLimit]
 * @returns {PaginationSql}
 */
export function paginationArgsToSql (params, defaultLimit = 10) {
  const {
    after,
    before,
    first,
    last,
  } = params || {};

  const isForwardPagination = !!(after || first);
  const isBackwardPagination = !!(before || last);

  if (isForwardPagination && isBackwardPagination) {
    throw new Error('Found a mix of forward and backward pagination parameter');
  }

  const requestedCount = first ?? last ?? 10;

  /** @type {import('sql-template-tag').Sql[]} */
  const paginationCondition = [];
  /** @type {PaginationContext} */
  const paginationContext = {
    isForwardPagination,
    requestedCount,
  };
  const paginationLimit = 1 + (first ?? last ?? defaultLimit);
  const paginationOrder = sql`ORDER BY created_at DESC, id DESC`;

  const cursor = after || before;

  if (cursor) {
    const { createdAtMs, id } = parseTimeCursor(cursor);

    if (after) {
      paginationCondition.push(sql`
        (
          created_at >= to_timestamp(${createdAtMs / 1000}) AND
          created_at < to_timestamp(${(createdAtMs + 1) / 1000}) AND
          id < ${id}
        )
        OR
        created_at < to_timestamp(${createdAtMs / 1000})
      `);
    } else {
      paginationCondition.push(sql`
        (
          created_at <= to_timestamp(${createdAtMs / 1000}) AND
          created_at > to_timestamp(${(createdAtMs - 1) / 1000}) AND
          id > ${id}
        )
        OR
        created_at > to_timestamp(${(createdAtMs) / 1000})
      `);
    }
  }

  return {
    paginationCondition,
    paginationContext,
    paginationLimit,
    paginationOrder,
  };
}
