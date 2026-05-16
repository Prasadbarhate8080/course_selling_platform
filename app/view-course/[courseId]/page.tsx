"use client"
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { courseServices } from "@/services/courseServices";
import { CourseStructureItem } from "@/types/courseStructure";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, X, Star, Clock, Users, User, CheckCircle2, ChevronDown, ChevronUp, Video, Edit } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Script from "next/script";
import axios from "axios";
import { userService } from "@/services/userService";

interface CourseData {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  courseStructure: CourseStructureItem[];
}

const page = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const courseId = String(params.courseId);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<number[]>([]);
  const toggleTopic = (index: number) => {
    setExpandedTopics((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };
  
  const handleBuyNow = async () => {
    try {
      if (!session) {
        toast.error("Please login to purchase the course");
        router.push("/sign-in");
        return;
      }

      setBuying(true);

      // 1. Create Order
      const { data: orderData } = await axios.post("/api/payment/create-order", {
        courseId,
      });

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Course Selling Platform",
        description: `Purchase of ${course?.title}`,
        image: course?.thumbnailUrl || "/logo.png",
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            // 2. Verify Payment
            const { data: verifyData } = await axios.post("/api/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyData.success) {
              toast.success("Payment successful! Course added to your library.");
              router.push("/my-courses"); // Assuming this page exists
            } else {
              toast.error(verifyData.message || "Payment verification failed");
            }
          } catch (error: any) {
            console.error("Verification Error:", error);
            toast.error(error.response?.data?.message || "Error verifying payment");
          }
        },
        prefill: {
          name: session.user.userName,
          email: session.user.email,
        },
        theme: {
          color: "#0f172a",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment Error:", error);
      toast.error(error.response?.data?.message || "Failed to initiate payment");
    } finally {
      setBuying(false);
    }
  };
  
  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?._id) {
        try {
          const response = await userService.getUser(session.user._id);
          if (response.success && response.data?.courses) {
            const purchased = response.data.courses.some(
              (id: any) => id.toString() === courseId
            );
            setIsPurchased(purchased);
          }
        } catch (err) {
          console.error("Failed to fetch user data", err);
        }
      }
    };
    fetchUser();
  }, [session, courseId]);
  

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        // If not purchased, fetch only preview data
        let response;
        if (!isPurchased) {
          response = await courseServices.getCoursePreview(courseId);
        } else {
          response = await courseServices.getCourse(courseId);
        }

        if (!response?.success || !response.data) {
          setError(response?.message || "Unable to load course.");
          return;
        }

        setCourse(response.data as CourseData);
      } catch (err) {
        console.error("Failed to load course", err);
        setError("Failed to load course.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, isPurchased]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-2 text-lg">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading course...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-red-600">
        {error}
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-muted-foreground">
        Course not found.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Banner Section */}
      <section className="bg-slate-900 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_400px] gap-12 items-center">
          {/* Left Side: Course Info */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{course.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-white">4.8</span>
                <span>(1,234 ratings)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>15,432 students enrolled</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Created by <span className="text-primary-foreground font-semibold underline underline-offset-4 decoration-primary cursor-pointer hover:text-white transition-colors">John Doe</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Last updated 05/2026</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> English</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Hindi</span>
            </div>
          </div>

          {/* Right Side: Thumbnail & Buying Section */}
          <div className="relative group">
            <div className="sticky top-8 space-y-4">
              <div className="rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl bg-slate-800 aspect-video relative">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    No thumbnail available
                  </div>
                )}
              </div>
              
              <div className="bg-card text-card-foreground p-6 rounded-3xl shadow-xl border space-y-4">
                {!isPurchased && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">₹{course.price}</span>
                    <span className="text-muted-foreground line-through">₹{course.price * 2}</span>
                    <span className="text-green-600 font-semibold">50% off</span>
                  </div>
                )}
                
                <Button 
                  onClick={isPurchased ? () => router.push(`/learn/${courseId}`) : handleBuyNow}
                  disabled={buying}
                  className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20"
                >
                  {buying ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : isPurchased ? (
                    "View Course"
                  ) : (
                    "Buy Now"
                  )}
                </Button>

                {session?.user?.role === "admin" && (
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/add-course/add-topics-videos/${courseId}`)}
                    className="w-full h-12 border-dashed border-2 hover:bg-primary/5 hover:text-primary transition-all"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Update Course
                  </Button>
                )}

                {!isPurchased && (
                  <p className="text-center text-xs text-muted-foreground">30-Day Money-Back Guarantee</p>
                )}
                
                <div className="space-y-3 pt-4 border-t">
                  <p className="font-semibold text-sm">This course includes:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><Clock className="h-4 w-4" /> 45 hours on-demand video</li>
                    <li className="flex items-center gap-2"><Users className="h-4 w-4" /> Full lifetime access</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Certificate of completion</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-[1fr_400px] gap-12">
        <div className="space-y-12">
          {/* Description Section */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Description</h2>
            <div className="prose max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {course.description}
            </div>
          </section>

          {/* Course Structure Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold">Course Content</h2>
                <p className="text-muted-foreground mt-2">Explore the topics and lectures included in this course.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>

            {!course.courseStructure || course.courseStructure.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {!course.courseStructure 
                      ? "Course curriculum is available after purchase." 
                      : "No topics have been added to this course yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {course.courseStructure.map((topic, topicIndex) => (
                  <div key={topic._id ?? topicIndex} className="border-2 rounded-2xl overflow-hidden bg-card">
                    <button
                      onClick={() => toggleTopic(topicIndex)}
                      className="w-full flex items-center justify-between p-5 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {topicIndex + 1}
                        </span>
                        <h3 className="text-lg font-bold text-left">{topic.topic}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="text-sm font-medium">{topic.lectures.length} lectures</span>
                        {expandedTopics.includes(topicIndex) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </button>
                    
                    {expandedTopics.includes(topicIndex) && (
                      <div className="p-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {topic.lectures.length === 0 ? (
                          <p className="p-4 text-sm text-muted-foreground italic">No lectures added for this topic.</p>
                        ) : (
                          topic.lectures.map((lecture, lectureIndex) => (
                            <div
                              key={lecture._id ?? lectureIndex}
                              className="flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-primary/5 group"
                            >
                              <div className="shrink-0">
                                <Video className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                              <div className="grow min-w-0">
                                <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                  {lecture.video?.title ?? `Lecture ${lectureIndex + 1}`}
                                </p>
                              </div>
                              <div className="shrink-0 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-0.5 bg-muted rounded">Video</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column spacer for sticky content on desktop */}
        <div className="hidden lg:block w-[400px]"></div>
      </div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </main>
  );
};

export default page;
