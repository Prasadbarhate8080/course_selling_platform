import React from 'react'
import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';
import { Clock, Users, Star } from 'lucide-react';
import { Badge } from './ui/badge';

interface CourseCardProps {
  title: string;
  description: string;
  image: string;
  price: number;
  src: string;
  instructor?: string;
  duration?: string;
  studentCount?: number;
  rating?: number;
  skillLevel?: string;
}

function CourseCard({
  title,
  description,
  image,
  price,
  src,
  instructor = "Prasad Barhate",
  duration = "45 hours",
  studentCount = 1200,
  rating = 4.8,
  skillLevel = "Beginner"
}: CourseCardProps) {
  return (
    <Link href={src}>
      <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer group h-full flex flex-col">
        {/* Course Thumbnail */}
        <div className="relative h-48 overflow-hidden">
          <Image 
            src={image} 
            alt={title} 
            fill
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
          <div className="absolute top-4 right-4">
            <Badge className="bg-white/90 backdrop-blur-sm text-emerald-600 font-semibold px-3 py-1 border-none">
              {skillLevel}
            </Badge>
          </div>
        </div>

        {/* Course Content */}
        <div className="p-6 space-y-4 flex flex-col flex-1">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-200 min-h-[3.5rem]">
            {title.charAt(0).toUpperCase() + title.slice(1)}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed flex-1">
            {description}
          </p>

          {/* Instructor */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
              {instructor.charAt(0)}
            </div>
            <span className="font-medium">{instructor}</span>
          </div>

          {/* Meta Information */}
          <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{studentCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-gray-900">{rating}</span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <span className="text-3xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
            </div>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white group-hover:shadow-lg transition-shadow duration-200"
            >
              Enroll Now
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CourseCard
