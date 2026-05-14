import z from "zod";
export const signInSchema = z.object({
    identifier:z.string().trim().min(2,{message:"username must be greater than two"}),
    password:z.string().trim()
})