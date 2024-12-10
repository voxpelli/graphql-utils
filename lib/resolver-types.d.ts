import type { GraphQLResolveInfo } from 'graphql';

import type { Shallowing } from './shallowing-types.d.ts';

type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult>;

type MaybeResolverFn<TResult, TParent, TContext, TArgs> = TResult | ResolverFn<TResult, TParent, TContext, TArgs>;

export type CustomResolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  MaybeResolverFn<DeepPartial<Shallowing<TResult, string>>, TParent, TContext, TArgs>;

type DeepPartial<Value> =
  Value extends (readonly (infer U)[]) ? DeepPartial<U>[] :
    Value extends { [key: string]: any } ? { [P in keyof Value]?: DeepPartial<Value[P]> } :
      Value;
