"use client";
import { courseSchema } from "@/schemas/courseSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useState } from "react";
import { apiError } from "@/types/apiError";
import { useRouter } from "next/navigation";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
  UploadResponse,
} from "@imagekit/next";
import { authenticator } from "@/lib/imagekitAuthenticator";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

function page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (status === "loading") return;
    
    console.log("Full Session Object:", session);
    console.log("User Role in Frontend:", (session?.user as any)?.role);

    if (status === "unauthenticated") {
      toast.error("Please login to access this page");
      router.replace("/sign-in");
    } else if (session?.user && (session.user as any).role !== "admin") {
      toast.error("Access denied. Admin only.");
      router.replace("/");
    }
  }, [status, session, router]);

  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      thumbnailUrl: "",
    },
  });

  async function onSubmit(data: z.infer<typeof courseSchema>) {
    try {
      if (!thumbnailImage) return toast("dont have thumbnail image");
      let { signature, expire, token, publicKey } = await authenticator();
      let thumbnailUploadResponse: UploadResponse = await upload({
        expire,
        signature,
        token,
        publicKey,
        file: thumbnailImage,
        fileName: thumbnailImage.name,
        isPrivateFile: false,
        useUniqueFileName: true,
      });
      if (!thumbnailUploadResponse.url) return toast("thumbnail upload faild");
      console.log(thumbnailUploadResponse);
      data.thumbnailUrl = thumbnailUploadResponse.url;
      const response = await axios.post("/api/add-course", data);
      console.log(response);
      toast.success(response.data.message);
      router.push(`/add-course/add-topics-videos/${response.data.data._id}`);
    } catch (error) {
      const axiosError = error as AxiosError<apiError>;
      toast.error(axiosError.response?.data.message);
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-center mt-10">
        Add course Details
      </h1>
      <div className="max-w-6xl  h-10 mx-auto mt-4">
        <div className="max-w-3xl p-2 mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="price" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2 w-96">
                <label
                  htmlFor="thumbnail"
                  className="text-sm font-medium text-gray-700"
                >
                  Course Thumbnail
                </label>

                <div className="relative">
                  <input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (!e.currentTarget.files?.[0]) return;
                      setThumbnailImage(e.currentTarget.files[0]);
                    }}
                  />

                  <label
                    htmlFor="thumbnail"
                    className="flex flex-col items-center justify-center w-full h-40 
                            border-2 border-dashed border-gray-300 rounded-lg cursor-pointer 
                            bg-gray-50 hover:bg-gray-100 transition"
                  >
                    {thumbnailImage ? (
                      <img
                        src={URL.createObjectURL(thumbnailImage)}
                        alt="Thumbnail preview"
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <>
                        <svg
                          className="w-8 h-8 text-gray-400 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 4v8m0 0l4-4m-4 4l-4-4"
                          />
                        </svg>
                        <p className="text-sm text-gray-600">
                          Click to upload thumbnail
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, WEBP (recommended 16:9)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Next
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default page;
