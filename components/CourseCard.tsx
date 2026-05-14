import React from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';
interface CourseCardProps {
  title: string;
  description: string;
  image: string;
  price: number;
  src: string;
}
function CourseCard({
  title,
  description,
  image,
  price,
  src,
}: CourseCardProps) {
  return (
    <Link href={src}>
    <Card className="overflow-hidden transition-all w-72 duration-300 pt-0 hover:shadow-xl hover:-translate-y-1 ">
      {/* Image */}
      <div className="relative w-full h-44">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      <CardHeader className="">
        <CardTitle className="text-lg line-clamp-2">
          {title.charAt(0).toUpperCase() + title.slice(1)}
        </CardTitle>
        <CardDescription>By Prasad Barhate</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">₹{price}</span>
        </div>

        <Button size="sm">Enroll</Button>
      </CardFooter>
    </Card>
    </Link>
  );
}

export default CourseCard
