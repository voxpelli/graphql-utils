import type { JsonObject } from 'type-fest';

export type DeMaybe<T> = T extends null ? never : T;

export type NonEmptyObject<Value, Then> = Value extends Record<string, any> ? keyof Value extends never ? never : Then : never;

export type ComplexKeys<Collection> = {
  [P in keyof Collection as (
    Collection[P] extends string | number | boolean | null
      ? never
      : JsonObject extends Collection[P]
        ? never
        : Date extends Collection[P] ? never : P
  )]: Collection[P]
};
