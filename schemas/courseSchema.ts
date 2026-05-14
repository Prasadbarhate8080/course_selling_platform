import  {z} from "zod"

export const courseSchema = z.object({
    title: z.string()
    .min(6,{message:"title must be greater than 6 letters"})
    .max(100,{message:"title should not be greater that 100 characters"})
    .trim(),
    description: z.string().trim(),
    price: z.coerce.number<number>().nonnegative(),
    thumbnailUrl:z.string().trim()
})

