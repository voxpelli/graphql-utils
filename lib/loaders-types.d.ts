import type { LoaderWithReturn } from './mercurius-types.d.ts';
import type { PageInfo } from './pagination-types.d.ts';
import type { Shallowing } from './shallowing-types.js';
import type { ComplexKeys, DeMaybe, NonEmptyObject } from './utils-types.d.ts';

// import type { ResolversParentTypes, ResolversInterfaceTypes, Resolvers, Scalars } from '../lib/graphql/schema.d.ts';

// *** Schema related ***

type PaginationShallowing<Value, Replacement, Replace extends boolean = false> =
  Value extends { edges?: infer E, pageInfo: PageInfo }
    ? E extends ReadonlyArray<infer A>
      ? A extends { node?: infer N }
        ? {
            edges: ReadonlyArray<
              Shallowing<Omit<A, 'node'>, Replacement, Replace> &
              {
                node: BaseInterface<N, Replacement, Replace>
              }
            >,
            pageInfo: PageInfo
          }
        : Shallowing<Value, Replacement, Replace>
      : Shallowing<Value, Replacement, Replace>
    : Shallowing<Value, Replacement, Replace>;

type PaginationCompatibleShallowing<Value, Replacement, Replace extends boolean = false> =
  Value extends Array<infer U> ? Array<PaginationCompatibleShallowing<U, Replacement, Replace>> :
    Value extends ReadonlyArray<infer U> ? ReadonlyArray<PaginationCompatibleShallowing<U, Replacement, Replace>> :
      PaginationShallowing<Value, Replacement, Replace>;

type BaseInterface<Target, Replacement, Replace extends boolean = false> = DeMaybe<Target> extends infer U
  ? (
      PaginationCompatibleShallowing<Pick<U, keyof U>, Replacement, Replace> |
      (Target extends null ? undefined : never)
    )
  : never;

type PaginationTypes = `${string}Edge` | `${string}Connection`;

type ResolverKeys<S extends Schema> = keyof S['ResolversParentTypes'] & keyof S['Resolvers'];

// *** Loaders related functions

type EntityPropertyTarget<Target> = Promise<
  Array<
    BaseInterface<Target, string, true>
  >
>;

type EntityPropertyLoader<Source extends Record<string, any>, Target, ArgsTarget> = LoaderWithReturn<
  Shallowing<Source, string, true>,
  EntityPropertyTarget<Target>,
  ArgsTarget extends (...args: infer P) => {}
    ? P[1] extends Record<string, any>
      ? P[1]
      : never
    : never
>;

type EntityLoaders<
  S extends Schema,
  E extends ResolverKeys<S>
> =
  S['ResolversParentTypes'][E] extends Record<string, any>
    ? ComplexKeys<S['ResolversParentTypes'][E]> extends infer U
      ? {
          [P in keyof U]: EntityPropertyLoader<
          S['ResolversParentTypes'][E],
            U[P],
            P extends keyof S['Resolvers'][E] ? S['Resolvers'][E][P] : never
          >
        }
      : never
    : never;

type LoadersKey<
  S extends Schema,
  E extends ResolverKeys<S>
> = Exclude<
  NonEmptyObject<
    EntityLoaders<S, E>,
    E
  >,
  (keyof S['ResolversInterfaceTypes']) |
  PaginationTypes |
  (keyof S['Scalars'])
>;

export interface Schema {
  ResolversParentTypes: Record<string, unknown>,
  ResolversInterfaceTypes: Record<string, unknown>,
  Resolvers: Record<string, unknown>,
  Scalars: Record<string, unknown>,
}

export type Loaders<S extends Schema> = {
  [E in ResolverKeys<S> as LoadersKey<S, E>]: EntityLoaders<S, E>;
};
