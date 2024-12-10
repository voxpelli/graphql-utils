// Follows https://graphql.org/learn/pagination/ / https://relay.dev/graphql/connections.htm
export interface PageInfo {
  endCursor: string | null,
  hasNextPage: boolean,
  hasPreviousPage: boolean,
  startCursor: string | null,
}
