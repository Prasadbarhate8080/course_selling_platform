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
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Explore Courses
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Learn from the best industry experts and level up your skills today.
          </p>
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
