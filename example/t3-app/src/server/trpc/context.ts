import { type inferAsyncReturnType } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { z } from "zod";

import { prisma } from "../db/client";

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
// type CreateContextOptions = Record<string, never>;

type CreateContextOptions = {
  user: any;
};

/** Use this helper for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 **/
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    ...opts,
    prisma,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (opts: CreateNextContextOptions) => {
  let user = undefined;
  let sessionCookie = undefined;
  try {
    sessionCookie = z
      .object({
        sessionId: z.string(),
      })
      .parse(opts.req.cookies);
  } catch (error) {
    sessionCookie = null;
  }

  if (sessionCookie) {
    const { sessionId } = sessionCookie;
    const authMicroserviceResponse = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_API_URL}/ms/me`,
      {
        method: "POST",
        body: JSON.stringify({ sessionId }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());

    if ("user" in authMicroserviceResponse)
      user = authMicroserviceResponse.user;
  }

  return await createContextInner({ user });
};

export type Context = inferAsyncReturnType<typeof createContext>;
