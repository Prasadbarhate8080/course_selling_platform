"use client"
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { courseServices } from "@/services/courseServices";
import { userService } from "@/services/userService";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import VideoJS from "@/components/VideoPlayer";
import { 
  Loader2, 
  X, 
  Menu, 
  ChevronDown, 
  ChevronUp, 
  PlayCircle, 
  CheckCircle, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);

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
          setCourse(courseData);
          
          // Set initial video if none selected
          if (courseData.courseStructure.length > 0 && courseData.courseStructure[0].lectures.length > 0) {
            setCurrentVideo(courseData.courseStructure[0].lectures[0].video);
            setExpandedTopics([courseData.courseStructure[0]._id]);
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

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => 
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const handleToggleComplete = (videoId: string) => {
    setCompletedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId) 
        : [...prev, videoId]
    );
    const isNowComplete = !completedVideos.includes(videoId);
    toast.success(isNowComplete ? "Lecture marked as complete!" : "Lecture marked as incomplete");
  };

  const getNextVideo = () => {
    if (!course || !currentVideo) return null;
    let found = false;
    for (const topic of course.courseStructure) {
      for (const lecture of topic.lectures) {
        if (found) return lecture.video;
        if (lecture.video._id === currentVideo._id) found = true;
      }
    }
    return null;
  };

  const getPrevVideo = () => {
    if (!course || !currentVideo) return null;
    let prev = null;
    for (const topic of course.courseStructure) {
      for (const lecture of topic.lectures) {
        if (lecture.video._id === currentVideo._id) return prev;
        prev = lecture.video;
      }
    }
    return null;
  };

  if (loading || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!isPurchased || !course) return null;

  const totalLectures = course.courseStructure.reduce((acc, topic) => acc + topic.lectures.length, 0);
  const nextVideo = getNextVideo();
  const prevVideo = getPrevVideo();

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-200 lg:flex-row overflow-hidden">
      {/* Sidebar - Course Structure */}
      <aside 
        className={`${
          isSidebarOpen ? "w-96" : "w-0"
        } fixed inset-y-0 left-0 z-[60] transform border-r border-slate-800 bg-white transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col shadow-2xl overflow-hidden`}
      >
        <div className="flex flex-col h-full w-96">
          <div className="p-6 border-b border-gray-200 bg-white">
            <button 
              onClick={() => router.push(`/view-course/${courseId}`)} 
              className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors duration-200 mb-4"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium text-sm">Back to Course</span>
            </button>
            <h2 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
              {course.title}
            </h2>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
              <span>Progress</span>
              <span>{completedVideos.length} / {totalLectures} COMPLETED</span>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(5,150,105,0.3)]" 
                style={{ width: `${(completedVideos.length / totalLectures) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-gray-200">
            {course.courseStructure.map((topic, tIdx) => (
              <div key={topic._id} className="border-b border-gray-100">
                <button 
                  onClick={() => toggleTopic(topic._id)} 
                  className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-emerald-600 transition-colors">
                      Section {tIdx + 1}: {topic.topic}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {topic.lectures.filter(l => completedVideos.includes(l.video._id)).length} / {topic.lectures.length} LECTURES
                    </p>
                  </div>
                  {expandedTopics.includes(topic._id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                  )}
                </button>

                {expandedTopics.includes(topic._id) && (
                  <div className="bg-gray-50/50">
                    {topic.lectures.map((lecture) => {
                      const isActive = currentVideo?._id === lecture.video._id;
                      const isCompleted = completedVideos.includes(lecture.video._id);
                      
                      return (
                        <button 
                          key={lecture._id} 
                          onClick={() => {
                            setCurrentVideo(lecture.video);
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                          }} 
                          className={`w-full p-4 pl-8 flex items-center gap-4 hover:bg-gray-100 transition-all duration-200 border-l-4 ${ 
                            isActive 
                              ? 'border-emerald-600 bg-emerald-50 shadow-[inset_4px_0_0_0_rgba(5,150,105,1)]' 
                              : 'border-transparent' 
                          }`}
                        >
                          <div className="relative">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                            ) : (
                              <PlayCircle className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className={`text-sm leading-snug ${ 
                              isActive ? 'text-emerald-700 font-bold' : 'text-gray-700 font-medium' 
                            }`}>
                              {lecture.video.title}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">15:00 MINS</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-950">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 z-50">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 rounded-xl bg-slate-800 text-white hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="hidden md:flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Now Playing</span>
            <Badge className="bg-emerald-600/10 text-emerald-500 border-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase">
              Video Lesson
            </Badge>
          </div>
          <div className="w-10 md:hidden" />
        </div>

        {/* Video Player Container */}
        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-none">
          <div className="w-full bg-black aspect-video lg:aspect-auto lg:flex-1 relative group">
            {currentVideo ? (
              // If it's a Mux video and not yet completed, show processing UI
              (currentVideo.videoUrl.includes("stream.mux.com") && currentVideo.status !== "completed") || 
              currentVideo.status === "processing" || 
              currentVideo.status === "uploading" ? (
                <div className="flex h-full flex-col items-center justify-center space-y-4 bg-slate-900 text-slate-400">
                  <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
                  <div className="text-center">
                    <p className="text-xl font-bold text-white tracking-tight">Optimizing Video...</p>
                    <p className="text-sm text-slate-500 mt-2 px-6 max-w-md">Our servers are preparing this lecture for high-quality streaming. This usually takes a few minutes.</p>
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
                    }}
                    onReady={(player: any) => {
                      console.log("Player is ready");
                    }}
                  />
                </div>
              )
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 bg-slate-900/50">
                <div className="text-center space-y-4">
                  <PlayCircle className="h-16 w-16 mx-auto opacity-10" />
                  <p className="text-lg font-bold tracking-tight text-slate-400">Select a lecture to start your session</p>
                </div>
              </div>
            )}
          </div>

          {/* Lecture Info & Navigation */}
          <div className="bg-white border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-6 py-8 md:px-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
                <div className="space-y-4 flex-1">
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    {currentVideo?.title}
                  </h1>
                  <div className="flex items-center gap-3 text-sm font-bold text-emerald-600 uppercase tracking-widest">
                    <span>{course.title}</span>
                    <span className="h-1 w-1 rounded-full bg-emerald-200"></span>
                    <span className="text-gray-400">15:00 duration</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button 
                    variant={completedVideos.includes(currentVideo?._id || "") ? "outline" : "default"}
                    onClick={() => currentVideo && handleToggleComplete(currentVideo._id)}
                    className={`h-12 px-8 rounded-2xl font-bold transition-all duration-300 shadow-lg ${
                      completedVideos.includes(currentVideo?._id || "")
                        ? "border-emerald-600 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                    }`}
                  >
                    <CheckCircle className={`mr-2 h-5 w-5 ${completedVideos.includes(currentVideo?._id || "") ? "fill-emerald-600" : ""}`} />
                    {completedVideos.includes(currentVideo?._id || "") ? "Completed" : "Mark as Complete"}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                <Button 
                  variant="ghost" 
                  onClick={() => prevVideo && setCurrentVideo(prevVideo)}
                  disabled={!prevVideo}
                  className="h-12 px-6 rounded-xl text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 font-bold transition-all disabled:opacity-30"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Previous Lesson
                </Button>

                <Button 
                  onClick={() => nextVideo && setCurrentVideo(nextVideo)}
                  disabled={!nextVideo}
                  className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xl shadow-slate-900/10 disabled:opacity-30"
                >
                  Next Lesson
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Description Section */}
              <div className="mt-16 pt-16 border-t border-gray-100">
                <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em] mb-6">Lecture Notes</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                    {currentVideo?.description || "No description provided for this lecture."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearnPage;
