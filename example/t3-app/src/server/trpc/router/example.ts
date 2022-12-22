import { z } from "zod";

import { router, publicProcedure, authenticatedProcedure } from "../trpc";

export const exampleRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.item.findMany();
  }),
  create: authenticatedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.item.create({
        data: {
          name: input.name,
          userId: ctx.user.id,
        },
      });
    }),
});
