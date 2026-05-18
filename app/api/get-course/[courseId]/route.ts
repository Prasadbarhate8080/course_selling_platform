import { getServerSession, User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { courseModel, videoModel } from "@/models/course.model";
import { connectToDatabase } from "@/lib/dbConnect";

export const dynamic = 'force-dynamic';

export async function GET(request:NextRequest,context:{params:Promise<{courseId:string}>}) {
    try {
        await connectToDatabase()
        
        // Ensure videoModel is registered
        if (!videoModel) {
            console.log("videoModel not found, this shouldn't happen");
        }

        let session = await getServerSession(authOptions);
        console.log("session",session)
        let { courseId } = await context.params;
        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    message: "unauthorized request"
                },
                { status: 401 }
            )
        }
        let admin = session.user as User;
        console.log("request on get course", courseId)

        if(!courseId)
        {
            return NextResponse.json(
                {
                    success:false,
                    message:"cannot get courseId"
                },
                {status:401}
            )
        }

        let course = await courseModel.findOne(
            {
                _id:courseId
            }
        ).populate({
            path: "courseStructure.lectures.video",
            model: videoModel,
            select: "title description videoUrl thumbnailUrl status" // Explicitly select fields
        }).lean(); // Use lean() for better performance and to avoid stale doc issues

        console.log("Populated Course Data:", JSON.stringify(course?.courseStructure[0]?.lectures[0]?.video, null, 2));

        if(!course)
        {
            return NextResponse.json(
                {
                    success:false,
                    message:"course not found"
                },
                {status:401}
            )
        }

        return NextResponse.json({
            success:true,
            data:course
        },
        {
            status:200
        }
    )
    } catch (error) {
        console.log("error in the ass topic:",error)
        return NextResponse.json({
            success:false,
            message:"error in adding topic"
        },
        {status:500}
    )
    }
}