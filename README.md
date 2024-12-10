# @voxpelli/graphql-utils

My personal helpers and types for GraphQL

[![npm version](https://img.shields.io/npm/v/@voxpelli/graphql-utils.svg?style=flat)](https://www.npmjs.com/package/@voxpelli/graphql-utils)
[![npm downloads](https://img.shields.io/npm/dm/@voxpelli/graphql-utils.svg?style=flat)](https://www.npmjs.com/package/@voxpelli/graphql-utils)
[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-7fffff?style=flat&labelColor=ff80ff)](https://github.com/neostandard/neostandard)
[![Module type: ESM](https://img.shields.io/badge/module%20type-esm-brightgreen)](https://github.com/voxpelli/badges-cjs-esm)
[![Types in JS](https://img.shields.io/badge/types_in_js-yes-brightgreen)](https://github.com/voxpelli/types-in-js)
[![Follow @voxpelli@mastodon.social](https://img.shields.io/mastodon/follow/109247025527949675?domain=https%3A%2F%2Fmastodon.social&style=social)](https://mastodon.social/@voxpelli)

## Helpers

### [Loader helpers](./lib/loader-helpers.js)

* `oneToManyLoader()`
* `oneToOneLoader()`

#### Loader helper types

* `OneToManyLoader`
* `OneToOneLoader`

### [Pagination helpers](./lib/pagination-helpers.js)

* `generatePaginatedResponse()`
* `paginatedLoader()`
* `paginationArgsToSql()`

#### Pagination helper types

* `PageInfo`
* `PaginatedLoader`
* `PaginationArgs`
* `PaginationResponse`

## Types

### [Loaders types](./lib/loaders-types.d.ts)

* `Loaders`
* `Schema`

### [Mercurius types](./lib/mercurius-types.d.ts)

* `CustomContext`
* `LoaderWithReturn`

### [Resolver types](./lib/resolver-types.d.ts)

* `CustomResolver`

### [Shallowing types](./lib/shallowing-types.d.ts)

* `Shallowing`

## GraphQL Codegen

These helpers are used with something like this config for https://the-guild.dev/graphql/codegen:

```yml
schema: './lib/graphql/schema.graphql'
# documents:
#   - './lib/queries/**/*.{graphql,js}'
#   - './views/**/*.{graphql,js}'
extensions:
  languageService:
    useSchemaFileDefinitions: true
  codegen:
    overwrite: true
    emitLegacyCommonJSImports: false
    config:
      exportFragmentSpreadSubTypes: true
      skipTypename: true
      avoidOptionals: true
      contextType: '@voxpelli/graphql-utils#CustomContext'
      customResolverFn: '@voxpelli/graphql-utils#CustomResolver'
      enumsAsTypes: true
      immutableTypes: true
      noSchemaStitching: true
      wrapFieldDefinitions: false
      resolverTypeWrapperSignature: T
      useTypeImports: true
      # TODO: What is this?
      showUnusedMappers: true
      scalars:
        DateTime: Date
        EmailAddress: string
        JSONObject: JsonObject
        NonEmptyString: string
        UUID: string
    generates:
      lib/graphql/schema.d.ts:
        plugins:
          - add:
              content: '// Automatically generated, do not change!'
          - add:
              content: "import type { JsonObject } from 'type-fest';"
          - typescript
          - typescript-resolvers
      lib/graphql/:
        preset: near-operation-file
        presetConfig:
          extension: -generated.d.ts
          baseTypesPath: schema.js
        plugins:
          - add:
              content: '// Automatically generated, do not change!'
          - typescript-operations:
              inlineFragmentTypes: 'combine'
```
