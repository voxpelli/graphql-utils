import type { FastifyReply } from 'fastify';
import type { MercuriusContext } from 'mercurius';

export interface LoaderWithReturn<
  TObj extends Record<string, any>,
  TReturn,
  TParams extends Record<string, any> = any,
  TContext extends Record<string, any> = MercuriusContext
> {
  (
    queries: Array<{
      obj: TObj;
      params: TParams;
    }>,
    context: TContext & {
      reply: FastifyReply;
    }
  ): TReturn;
}

export type CustomContext = MercuriusContext & { reply?: FastifyReply };
