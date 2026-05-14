import { z } from "zod";

export const topicSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(8, "Topic should be minimum of 8 letters")
    .max(60, "topic should be less than 60 lettes"),
});
