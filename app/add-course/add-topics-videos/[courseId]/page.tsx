"use client";
import { axiosErrorHandler } from "@/lib/axiosErrorHandler";
import { courseServices } from "@/services/courseServices";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import { Video, Plus, FileVideo, PlayCircle, Loader2, CheckCircle2 } from "lucide-react";
import { authenticator } from "@/lib/imagekitAuthenticator";
import { upload } from "@imagekit/next";
import axios from "axios";
import { CourseStructureItem } from "@/types/courseStructure";
import { topicSchema } from "@/schemas/topicSchema";
import { videoSchema } from "@/schemas/videoSchema";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function page() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  // Types

  // States
  const params = useParams();
  let courseId = String(params.courseId);
  const [selectedTopicForAddingVideo, setSelectedTopicForAddingVideo] = useState<number | null>(
    null,
  );

  const [progress, setProgress] = useState<null | number>(null);
  const [videoUploadingStatus, setVideoUploadingStatus] = useState<
    null | "uploading" | "uploaded"
  >(null);

  const [courseStructure, setCourseStructure] = useState<CourseStructureItem[]>([]);
  const [topicLoading, setTopicLoading] = useState(false);
  const [showTopicsLectures, setShowTopicsLectures] = useState<Array<number>>([]);

  // Forms
  const topicForm = useForm<z.infer<typeof topicSchema>>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      topic: "",
    },
  });

  const videoForm = useForm<z.infer<typeof videoSchema>>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Functions
  let fetchCourse = async () => {
    try {
      const response = await courseServices.getCourse(courseId);
      setCourseStructure(response.data?.courseStructure ?? []);
    } catch (error) {
      axiosErrorHandler(error, "error from add-course-topic");
    }
  };

  async function handleTopicUpload(data: z.infer<typeof topicSchema>) {
    try {
      setTopicLoading(true);
      const response = await courseServices.addCourseTopic({
        courseTopic: data.topic,
        courseId: courseId,
      });
      await fetchCourse();
      topicForm.reset();
      toast.success("topic uploaded successfully");
    } catch (error: any) {
      axiosErrorHandler(error);
    } finally {
      setTopicLoading(false);
    }
  }

  async function uploadThubnail(thubnaiImage: File) {
    try {
      let thumbnailAuthParams = await authenticator();
      const { signature, expire, token, publicKey } = thumbnailAuthParams;
      let thubnailUploadReponse = await upload({
        // Authentication parameters
        expire,
        token,
        signature,
        publicKey,
        file: thubnaiImage,
        fileName: thubnaiImage.name,
      });
      ("thumbnail image upload successfully");
      return thubnailUploadReponse;
    } catch (error: any) {
      console.log("authentication error", error);
      return;
    }
  }

  const generateSignedUrl = async () => {
    try {
      // Perform the request to the upload authentication endpoint.
      const response = await fetch("/api/generate_signed_url");
      if (!response.ok) {
        // If the server response is not successful, extract the error text for debugging.
        const errorText = await response.text();
        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }
      // Parse and destructure the response JSON for upload credentials.
      const data = await response.json();
      const { uploadId, uploadUrl } = data;
      return { uploadId, uploadUrl };
    } catch (error) {
      // Log the original error for debugging before rethrowing a new error.
      console.error("Authentication error:", error);
      throw new Error("Authentication request failed");
    }
  };
  const handleVideoUpload = async (data: z.infer<typeof videoSchema>, topicIndex: number) => {
    try {
      setVideoUploadingStatus("uploading");
      setSelectedTopicForAddingVideo(topicIndex);
      setProgress(0);

      let { uploadId, uploadUrl } = await generateSignedUrl();
      let thumbnailUploadResponse = await uploadThubnail(data.thumbnail);
      
      let response = await axios.put(uploadUrl, data.video, {
        onUploadProgress(progressEvent) {
          if (!progressEvent.total || !progressEvent.loaded) return;
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });
      
      setVideoUploadingStatus("uploaded");
      let result = await axios.post(`/api/upload-video/${courseId}`, {
        videoUrl: "https://stream.mux.com",
        title: data.title,
        description: data.description,
        thumbnailUrl: thumbnailUploadResponse?.url,
        videoUploadTopic: topicIndex,
        uploadId: uploadId
      });
      console.log("video upload result", result);
      
      toast.success("Video uploaded and added to topic successfully");
      await fetchCourse();
      
      // Reset state
      console.log("Resetting state after upload");
      setProgress(null);
      setVideoUploadingStatus(null);
      setSelectedTopicForAddingVideo(null);
      videoForm.reset();

    } catch (error) {
      console.error("error at video upload", error);
      toast.error("Failed to upload video");
      setProgress(null);
      setVideoUploadingStatus(null);
    }
  };

  // UseEffects
  useEffect(() => {
    const fetchCourseData = async () => {
    try {
      await fetchCourse();
    } catch (error: any) {
      axiosErrorHandler(error);
    }
  }
  fetchCourseData();
  }, []);
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Course Content</h1>
        <p className="text-muted-foreground">Add topics and upload videos for your course.</p>
      </div>

      <div className="space-y-6">
        {courseStructure.map((topic, index) => (
          <Card key={index} className="overflow-hidden border-2">
            <CardHeader className="bg-muted/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                  {topic.topic}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTopicForAddingVideo(selectedTopicForAddingVideo === index ? null : index);
                  }}
                  disabled={videoUploadingStatus !== null}
                >
                  {selectedTopicForAddingVideo === index ? "Cancel" : "Add Video"}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Lectures List */}
              <div className="space-y-3">
                {topic.lectures.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-2">No videos added yet.</p>
                ) : (
                  topic.lectures.map((lecture, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <PlayCircle className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{lecture.video.title}</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                  ))
                )}
              </div>

              {/* Progress Bar for this topic */}
              {selectedTopicForAddingVideo === index && progress !== null && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading Video...
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Add Video Form */}
              {selectedTopicForAddingVideo === index && videoUploadingStatus !== "uploaded" && (
                <Form {...videoForm}>
                  <form
                    onSubmit={videoForm.handleSubmit((data) => handleVideoUpload(data, index))}
                    className="mt-6 p-4 rounded-xl border-2 border-dashed bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={videoForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video Title</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter video title"
                                disabled={videoUploadingStatus === "uploading"}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={videoForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Enter video description"
                                disabled={videoUploadingStatus === "uploading"}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={videoForm.control}
                        name="thumbnail"
                        render={({ field: { onChange, value, ...rest } }) => (
                          <FormItem>
                            <FormLabel>Thumbnail Image</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-4">
                                <Label
                                  htmlFor={`thumbnail-${index}`}
                                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors ${videoUploadingStatus === "uploading" ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                  {value ? (
                                    <div className="flex flex-col items-center">
                                      <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                                      <span className="text-xs text-center px-2 truncate max-w-[150px]">
                                        {(value as File).name}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center text-muted-foreground">
                                      <Plus className="w-8 h-8 mb-2" />
                                      <span className="text-xs text-center">Select Image</span>
                                    </div>
                                  )}
                                </Label>
                                <Input
                                  {...rest}
                                  type="file"
                                  id={`thumbnail-${index}`}
                                  className="hidden"
                                  accept="image/*"
                                  disabled={videoUploadingStatus === "uploading"}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) onChange(file);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={videoForm.control}
                        name="video"
                        render={({ field: { onChange, value, ...rest } }) => (
                          <FormItem>
                            <FormLabel>Video File</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-4">
                                <Label
                                  htmlFor={`video-${index}`}
                                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors ${videoUploadingStatus === "uploading" ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                  {value ? (
                                    <div className="flex flex-col items-center">
                                      <FileVideo className="w-8 h-8 text-primary mb-2" />
                                      <span className="text-xs text-center px-2 truncate max-w-[150px]">
                                        {(value as File).name}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center text-muted-foreground">
                                      <Video className="w-8 h-8 mb-2" />
                                      <span className="text-xs text-center">Select Video</span>
                                    </div>
                                  )}
                                </Label>
                                <Input
                                  {...rest}
                                  type="file"
                                  id={`video-${index}`}
                                  className="hidden"
                                  accept="video/*"
                                  disabled={videoUploadingStatus === "uploading"}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) onChange(file);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={videoUploadingStatus === "uploading"}
                      >
                        {videoUploadingStatus === "uploading" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Upload Video"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Add New Topic Section */}
        <Card className="border-dashed border-2 bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Add New Topic</CardTitle>
            <CardDescription>Create a new section for your course.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...topicForm}>
              <form onSubmit={topicForm.handleSubmit(handleTopicUpload)} className="space-y-4">
                <FormField
                  control={topicForm.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Introduction to React" 
                          className="bg-background"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={topicLoading}>
                  {topicLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Topic...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Topic
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default page;
