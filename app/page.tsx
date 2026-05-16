"use client";

import { useCallback, useEffect, useState } from "react";
import { courseServices } from "@/services/courseServices";
import { Course } from "@/models/course.model";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";
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
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-32">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Industrial Grade Learning
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-8">
            Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Full Stack Java</span> & Modern Coding
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            From Core Java to Advanced Microservices. Learn the exact skills used by top-tier engineers at Google, Amazon, and Microsoft.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-2xl shadow-lg shadow-primary/25 w-full sm:w-auto" onClick={() => {
              const element = document.getElementById('courses');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Browse Courses
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold rounded-2xl border-slate-800 text-slate-300 hover:bg-slate-900 w-full sm:w-auto">
              Success Stories
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-800/50 pt-12">
            <div>
              <p className="text-3xl font-bold text-white">10k+</p>
              <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mt-1">Students</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">4.9/5</p>
              <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mt-1">Avg Rating</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mt-1">Support</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">Life-time</p>
              <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mt-1">Access</p>
            </div>
          </div>
        </div>
      </section>

      <div id="courses" className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 mb-12">
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-primary rounded-full"></div>
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest">Our Catalog</h2>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Pick your next challenge
          </h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[400px] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-destructive/10 text-destructive p-4 rounded-full mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Courses</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchCourses} variant="outline" className="gap-2">
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl bg-muted/30">
            <h3 className="text-xl font-semibold mb-2">No Courses Available</h3>
            <p className="text-muted-foreground max-w-sm">
              We're currently preparing new content. Check back soon for exciting new courses!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
