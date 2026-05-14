import { z } from "zod";

export const videoSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(500),
  thumbnail: z.custom<File>((val) => val instanceof File, "Thumbnail image is required"),
  video: z.custom<File>((val) => val instanceof File, "Video file is required"),
});
