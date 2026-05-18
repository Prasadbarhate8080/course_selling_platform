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
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    console.log(course)
  },[course])

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

  const handleToggleComplete = (videoId: string) => {
    setCompletedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId) 
        : [...prev, videoId]
    );
    const isNowComplete = !completedVideos.includes(videoId);
    toast.success(isNowComplete ? "Lecture marked as complete!" : "Lecture marked as incomplete");
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-200 lg:flex-row overflow-hidden">
      {/* Sidebar - Course Structure */}
      <aside 
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-[60] w-80 transform border-r border-slate-800 bg-slate-900 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-slate-900/50">
          <h2 className="font-bold text-white truncate pr-2 text-lg">{course.title}</h2>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {course.courseStructure.map((topic, tIdx) => (
            <div key={topic._id || tIdx} className="space-y-2">
              <h3 className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 bg-slate-800/30 rounded-lg">
                {topic.topic}
              </h3>
              <div className="space-y-1">
                {topic.lectures.map((lecture, lIdx) => {
                  const isCompleted = completedVideos.includes(lecture.video._id);
                  const isActive = currentVideo?._id === lecture.video._id;
                  
                  return (
                    <button
                      key={lecture._id || lIdx}
                      onClick={() => {
                        setCurrentVideo(lecture.video);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 group ${
                        isActive
                          ? "bg-primary text-white font-semibold shadow-lg shadow-primary/20"
                          : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <PlayCircle className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                        {isCompleted && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-slate-900">
                            <CheckCircle className="h-2 w-2 text-white fill-current" />
                          </div>
                        )}
                      </div>
                      <span className="text-left line-clamp-2 leading-snug">{lecture.video.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            onClick={() => router.push(`/view-course/${courseId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Overview
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-950">
        {/* Top bar for mobile */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 lg:hidden sticky top-0 z-50">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-all shadow-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-sm font-bold text-white truncate px-4">{course.title}</span>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-8">
            {/* Video Player Section */}
            <div className="aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-2xl ring-1 ring-white/10 relative group">
              {currentVideo ? (
                // Show processing if status is not completed OR if the URL is just the Mux placeholder
                (currentVideo.status !== "completed" && 
                 (currentVideo.status === "processing" || 
                  currentVideo.status === "uploading" || 
                  currentVideo.videoUrl === "https://stream.mux.com")) ||
                currentVideo.videoUrl === "https://stream.mux.com" ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-4 bg-slate-900 text-slate-400">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">Video is processing</p>
                      <p className="text-sm text-slate-500 mt-2 px-6 max-w-md">We're preparing your video for high-quality streaming. This should only take a moment.</p>
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
                            type: (currentVideo.videoUrl.includes("stream.mux.com") || currentVideo.videoUrl.endsWith(".m3u8"))
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
                <div className="flex h-full items-center justify-center text-slate-500 bg-slate-900/50">
                  <div className="text-center space-y-3">
                    <PlayCircle className="h-12 w-12 mx-auto opacity-20" />
                    <p className="font-medium">Select a lecture to start learning</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lecture Info Section */}
            {currentVideo && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-800">
                  <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                      {currentVideo.title}
                    </h1>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <span>Full Stack Java</span>
                      <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                      <span>{course.title}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant={completedVideos.includes(currentVideo._id) ? "default" : "outline"}
                    onClick={() => handleToggleComplete(currentVideo._id)}
                    className={`h-12 px-6 rounded-2xl transition-all duration-300 font-bold ${
                      completedVideos.includes(currentVideo._id)
                        ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 border-none"
                        : "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {completedVideos.includes(currentVideo._id) ? (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5 fill-current" />
                        Completed
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm">
                      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6">Lecture Description</h2>
                      <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                        {currentVideo.description || "No description provided for this lecture."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                      <h3 className="text-sm font-bold text-blue-400 mb-4">Instructor Notes</h3>
                      <p className="text-xs text-slate-400 leading-relaxed italic">
                        "Focus on the core concepts in this video. We'll be using these patterns throughout the advanced modules."
                      </p>
                    </div>
                  </div>
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
