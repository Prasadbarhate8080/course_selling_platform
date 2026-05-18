"use client"
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { courseServices } from "@/services/courseServices";
import { CourseStructureItem } from "@/types/courseStructure";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Loader2, 
  ArrowLeft, 
  Clock, 
  Users, 
  Star, 
  Award, 
  Globe, 
  Calendar, 
  PlayCircle, 
  FileText, 
  CheckCircle, 
  Edit 
} from "lucide-react";
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
  instructor?: string;
  instructorBio?: string;
  rating?: number;
  totalReviews?: number;
  studentCount?: number;
  skillLevel?: string;
  lastUpdated?: string;
  whatYouWillLearn?: string[];
  requirements?: string[];
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
        name: "SkillPeak",
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
              router.push(`/learn/${courseId}`);
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
          color: "#059669",
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
    const fetchUserAndCourse = async () => {
      try {
        setLoading(true);
        let purchased = false;
        
        if (session?.user?._id) {
          const userRes = await userService.getUser(session.user._id);
          if (userRes.success && userRes.data?.courses) {
            purchased = userRes.data.courses.some(
              (id: any) => id.toString() === courseId
            );
            setIsPurchased(purchased);
          }
        }

        const response = purchased 
          ? await courseServices.getCourse(courseId)
          : await courseServices.getCoursePreview(courseId);

        if (!response?.success || !response.data) {
          setError(response?.message || "Unable to load course.");
          return;
        }

        // Add dummy data for fields not in schema
        const courseData = {
          ...(response.data as CourseData),
          instructor: "Prasad Barhate",
          instructorBio: "Senior Full Stack Developer with 10+ years of experience in Java, Spring Boot, and Modern Web Architectures. Passionate about teaching and building scalable systems.",
          rating: 4.8,
          totalReviews: 1234,
          studentCount: 15432,
          skillLevel: "Beginner to Advanced",
          lastUpdated: "May 2026",
          whatYouWillLearn: [
            "Master Java Core and Advanced concepts",
            "Build production-ready Spring Boot applications",
            "Design and implement Microservices architecture",
            "Develop modern frontends with React and Next.js",
            "Database design with SQL and NoSQL",
            "Deploy applications to AWS/Azure using Docker and Kubernetes"
          ],
          requirements: [
            "Basic understanding of programming logic",
            "A computer with at least 8GB RAM",
            "Willingness to learn and build real-world projects"
          ]
        };

        setCourse(courseData);
      } catch (err) {
        console.error("Failed to load course", err);
        setError("Failed to load course.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchUserAndCourse();
    }
  }, [courseId, session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          <p className="text-lg font-medium text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{error || "Course Not Found"}</h1>
        <Button onClick={() => router.push('/')} className="bg-emerald-600 hover:bg-emerald-700">Go Back Home</Button>
      </div>
    );
  }

  const totalLectures = course.courseStructure.reduce(
    (acc, topic) => acc + topic.lectures.length,
    0
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Course Header */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Courses</span>
          </button>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left: Course Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-4 py-1.5 rounded-full text-sm font-semibold">
                  {course.skillLevel}
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {course.title}
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
                  {course.description}
                </p>
              </div>

              {/* Course Meta */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-gray-900">{course.rating}</span>
                  <span className="text-gray-500">({course.totalReviews?.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-700 font-medium">{course.studentCount?.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-700 font-medium">45+ hours</span>
                </div>
              </div>

              {/* Instructor Info */}
              <div className="flex items-start gap-6 p-8 bg-white rounded-3xl border border-gray-200 shadow-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg shadow-emerald-500/20">
                  {course.instructor?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-1">Instructor</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{course.instructor}</h3>
                  <p className="text-gray-600 leading-relaxed">{course.instructorBio}</p>
                </div>
              </div>
            </div>

            {/* Right: Purchase Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden sticky top-24 shadow-2xl shadow-emerald-900/5">
                <div className="relative aspect-video">
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center group cursor-pointer">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <PlayCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div>
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-5xl font-bold text-gray-900">₹{course.price.toLocaleString()}</span>
                      <span className="text-xl text-gray-400 line-through">₹{(course.price * 2).toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-medium text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-lg">50% Discount • Lifetime access</p>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={isPurchased ? () => router.push(`/learn/${courseId}`) : handleBuyNow}
                      disabled={buying}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xl py-8 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      {buying ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : isPurchased ? (
                        "Go to Dashboard"
                      ) : (
                        "Enroll Now"
                      )}
                    </Button>
                    
                    {session?.user?.role === "admin" && (
                      <Button 
                        variant="outline"
                        onClick={() => router.push(`/add-course/add-topics-videos/${courseId}`)}
                        className="w-full py-6 rounded-2xl border-dashed border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold"
                      >
                        <Edit className="mr-2 h-5 w-5" />
                        Update Content
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <h4 className="font-bold text-gray-900">This course includes:</h4>
                    <div className="space-y-3 text-sm font-medium">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="w-5 h-5 text-emerald-500" />
                        <span>45+ hours on-demand video</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <PlayCircle className="w-5 h-5 text-emerald-500" />
                        <span>{totalLectures} comprehensive lectures</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Award className="w-5 h-5 text-emerald-500" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span>Full lifetime access</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Globe className="w-5 h-5 text-emerald-500" />
                        <span>Access on mobile and desktop</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Last updated {course.lastUpdated}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-20">
            {/* What You'll Learn */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-1.5 bg-emerald-600 rounded-full" />
                <h2 className="text-3xl font-bold text-gray-900">What You'll Learn</h2>
              </div>
              <div className="bg-slate-50 rounded-3xl p-10 grid md:grid-cols-2 gap-6 border border-gray-100">
                {course.whatYouWillLearn?.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="mt-1 bg-emerald-100 rounded-full p-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-gray-700 font-medium leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Course Structure */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-emerald-600 rounded-full" />
                  <h2 className="text-3xl font-bold text-gray-900">Course Content</h2>
                </div>
                <div className="text-sm font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                  {course.courseStructure.length} sections • {totalLectures} lectures
                </div>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {course.courseStructure.map((topic, index) => (
                  <AccordionItem 
                    key={topic._id || index} 
                    value={`item-${index}`}
                    className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="px-8 py-6 hover:bg-gray-50/50 text-left [&[data-state=open]]:bg-emerald-50/50">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            Section {index + 1}: {topic.topic}
                          </h3>
                          <p className="text-sm font-semibold text-emerald-600">
                            {topic.lectures.length} lectures • {topic.lectures.length * 15} mins
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-8 pb-6 pt-2">
                      <div className="space-y-1">
                        {topic.lectures.map((lecture, lIdx) => (
                          <div 
                            key={lecture._id || lIdx} 
                            className="flex items-center justify-between py-4 px-4 hover:bg-emerald-50/30 rounded-xl transition-colors duration-200 group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                <PlayCircle className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                              </div>
                              <span className="text-gray-700 font-medium">{lecture.video.title}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-400">12:45</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* Requirements */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-1.5 bg-emerald-600 rounded-full" />
                <h2 className="text-3xl font-bold text-gray-900">Requirements</h2>
              </div>
              <ul className="space-y-4 px-4">
                {course.requirements?.map((req, index) => (
                  <li key={index} className="flex items-start gap-4 text-gray-700 font-medium">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 mt-2.5 flex-shrink-0 shadow-lg shadow-emerald-500/40" />
                    <span className="text-lg leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Description */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-1.5 bg-emerald-600 rounded-full" />
                <h2 className="text-3xl font-bold text-gray-900">Description</h2>
              </div>
              <div className="prose prose-emerald max-w-none">
                <p className="text-gray-700 leading-relaxed text-xl whitespace-pre-wrap">
                  {course.description}
                </p>
                <p className="text-gray-600 mt-6 leading-relaxed">
                  Join thousands of successful students who have transformed their careers through our practical, project-based approach. This course is constantly updated with the latest industry standards and tools.
                </p>
              </div>
            </section>
          </div>

          {/* Right Column Spacer */}
          <div className="lg:col-span-1" />
        </div>
      </div>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
};

export default page;
