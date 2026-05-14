import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import { courseModel } from "@/models/course.model";
import { connectToDatabase } from "@/lib/dbConnect";

export async function GET(request:NextRequest)
{
    try {
        await connectToDatabase()
       let courses = await courseModel.find()
       console.log("inside the get courses")
       if(courses.length == 0) return NextResponse.json(
        {
            success:false,
            message:"no courses found"
        }
       )

       return NextResponse.json(
        {
            success:true,
            message:"courses sent successfully",
            data:courses
        }
       )

    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {
                success:false,
                message:"error in getting course"
            },
            {
                status:500
            }
        )
    }
}