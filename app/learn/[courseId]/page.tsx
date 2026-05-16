"use client"
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { courseServices } from "@/services/courseServices";
import { userService } from "@/services/userService";
import { useSession } from "next-auth/react";
import { Loader2, PlayCircle, CheckCircle, ChevronRight, Menu, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import VideoJS from "@/components/VideoPlayer";

interface VideoData {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  status?: string;
}

interface Lecture {
  _id: string;
  video: VideoData;
}

interface Topic {
  _id: string;
  topic: string;
  lectures: Lecture[];
}

interface CourseData {
  _id: string;
  title: string;
  courseStructure: Topic[];
}

const LearnPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const courseId = String(params.courseId);

  const [course, setCourse] = useState<CourseData | null>(null);
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    const checkAccessAndFetch = async () => {
      if (!session?.user?._id || !courseId) return;

      try {
        setLoading(true);
        // 1. Check if user purchased the course
        const userRes = await userService.getUser(session.user._id);
        const purchased = userRes.data?.courses?.some(
          (id: any) => id.toString() === courseId
        );

        if (!purchased) {
          toast.error("You haven't purchased this course yet.");
          router.push(`/view-course/${courseId}`);
          return;
        }

        setIsPurchased(true);

        // 2. Fetch full course details
        const courseRes = await courseServices.getCourse(courseId);
        if (courseRes.success && courseRes.data) {
          const courseData = courseRes.data as unknown as CourseData;
          console.log(courseData)
          setCourse(courseData);
          
          // Set first video as default
          if (courseData.courseStructure.length > 0 && courseData.courseStructure[0].lectures.length > 0) {
            setCurrentVideo(courseData.courseStructure[0].lectures[0].video);
          }
        } else {
          toast.error("Failed to load course content.");
        }
      } catch (err) {
        console.error("Error loading learn page:", err);
        toast.error("An error occurred while loading the course.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      checkAccessAndFetch();
    }
  }, [session, courseId, status, router]);

  if (loading || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg font-medium">Loading your course...</span>
      </div>
    );
  }

  if (!isPurchased || !course) return null;

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-200 lg:flex-row overflow-hidden">
      {/* Sidebar - Course Structure */}
      <aside 
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-80 transform border-r border-slate-800 bg-slate-900 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <h2 className="font-bold text-white truncate pr-2">{course.title}</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {course.courseStructure.map((topic, tIdx) => (
            <div key={topic._id || tIdx} className="space-y-1">
              <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-800/50 rounded-md">
                {topic.topic}
              </h3>
              <div className="space-y-0.5">
                {topic.lectures.map((lecture, lIdx) => (
                  <button
                    key={lecture._id || lIdx}
                    onClick={() => {
                      setCurrentVideo(lecture.video);
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                      currentVideo?._id === lecture.video._id
                        ? "bg-primary/20 text-primary font-medium"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <PlayCircle className={`h-4 w-4 shrink-0 ${currentVideo?._id === lecture.video._id ? "text-primary" : "text-slate-500"}`} />
                    <span className="text-left line-clamp-2">{lecture.video.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => router.push(`/view-course/${courseId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Overview
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top bar for mobile */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-sm font-medium text-white truncate px-4">{course.title}</span>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
            {/* Video Player Section */}
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-slate-800">
              {currentVideo ? (
                // If it's a Mux video and not yet completed, show processing UI
                (currentVideo.videoUrl.includes("stream.mux.com") && currentVideo.status !== "completed") || 
                currentVideo.status === "processing" || 
                currentVideo.status === "uploading" ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-4 bg-slate-900 text-slate-400">
                    <Loader2 className="h-12 w-12 animate-spin text-primary/50" />
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">Video is processing</p>
                      <p className="text-sm px-4">Preparing your video for streaming. This usually takes a few minutes.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full w-full video-player-container">
                    <VideoJS
                      key={currentVideo.videoUrl}
                      options={{
                        autoplay: false,
                        controls: true,
                        responsive: true,
                        fluid: true,
                        poster: currentVideo.thumbnailUrl,
                        sources: [
                          {
                            src: currentVideo.videoUrl,
                            type: currentVideo.videoUrl.endsWith(".m3u8") 
                              ? "application/x-mpegURL" 
                              : "video/mp4",
                          },
                        ],
                        controlBar: {
                          children: [
                            "playToggle",
                            "volumePanel",
                            "currentTimeDisplay",
                            "timeDivider",
                            "durationDisplay",
                            "progressControl",
                            "liveDisplay",
                            "remainingTimeDisplay",
                            "customControlSpacer",
                            "playbackRateMenuButton",
                            "chaptersButton",
                            "descriptionsButton",
                            "subsCapsButton",
                            "audioTrackButton",
                            "fullscreenToggle",
                          ],
                        },
                      }}
                      onReady={(player: any) => {
                        console.log("Player is ready");
                      }}
                    />
                  </div>
                )
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  Select a video to start learning
                </div>
              )}
            </div>

            {/* Lecture Info Section */}
            {currentVideo && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {currentVideo.title}
                  </h1>
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white shrink-0">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Complete
                  </Button>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">About this lecture</h2>
                  <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {currentVideo.description || "No description provided for this lecture."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearnPage;
