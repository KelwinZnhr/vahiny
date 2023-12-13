import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";


export const guestbookRouter = createTRPCRouter({
    postMessage: protectedProcedure
        .input(z.object({
            name: z.string(),
            message: z.string(),
        })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.db.guestbook.create({
                    data: {
                        name: input.name,
                        message: input.message,
                    },
                });
            } catch (error) {
                console.log("error", error);
            };
        }),
    getAll: publicProcedure.query(async({ctx})=>{
        try{
            return await ctx.db.guestbook.findMany({
                select:{
                    name:true,
                    message:true,
                },
                orderBy:{
                    createdAt:"desc"
                }
            })
        }catch(error){
            console.log("error",error);
        }
    })

});

