"use client";

import { useCallback, useEffect, useState } from "react";
import { courseServices } from "@/services/courseServices";
import { Course } from "@/models/course.model";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, ArrowRight, CheckCircle2, Users, Award, BookOpen, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";

export default function Home() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseServices.getCourses();
      if (response.success && response.data) {
        setCourses(response.data);
      } else {
        setError(response.message || "Failed to fetch courses");
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching courses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <main className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50 to-white" id="home">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                <Award className="w-4 h-4" />
                <span>Trusted by 10,000+ Students</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Master Full Stack Java
                <span className="block text-emerald-600 mt-2">Launch Your Career</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Learn coding and full stack development from industry experts. Build real-world projects and get job-ready skills.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6 group"
                  onClick={() => {
                    const element = document.getElementById('courses');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Courses
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  View Demo
                </Button>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-700 font-medium">100% Practical</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-700 font-medium">Lifetime Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-700 font-medium">Certificate</span>
                </div>
              </div>
            </div>

            {/* Right Content - Stats Cards */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                {/* Card 1 */}
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">10,000+</h3>
                  <p className="text-gray-600">Active Students</p>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 mt-8">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">50+</h3>
                  <p className="text-gray-600">Expert Courses</p>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">95%</h3>
                  <p className="text-gray-600">Success Rate</p>
                </div>

                {/* Card 4 */}
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 mt-8">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">100%</h3>
                  <p className="text-gray-600">Job Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              <span>Popular Courses</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Our <span className="text-emerald-600">Featured Courses</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our carefully curated courses designed to take you from beginner to professional developer
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[400px] rounded-2xl bg-white shadow-md animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-destructive/10 text-destructive p-4 rounded-full mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Error Loading Courses</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={fetchCourses} variant="outline" className="gap-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                <RefreshCcw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
              {courses.map((course) => (
                <CourseCard
                  key={course._id as string}
                  title={course.title}
                  description={course.description}
                  image={course.thumbnailUrl || "/sample_thumbnail.jpg"}
                  price={course.price}
                  src={`/view-course/${course._id}`}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl bg-white/50 border-gray-200">
              <h3 className="text-xl font-semibold mb-2">No Courses Available</h3>
              <p className="text-muted-foreground max-w-sm">
                We're currently preparing new content. Check back soon for exciting new courses!
              </p>
            </div>
          )}

          {/* View All Button */}
          {!loading && !error && courses && courses.length > 0 && (
            <div className="text-center mt-12">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-lg px-8"
              >
                View All Courses
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
