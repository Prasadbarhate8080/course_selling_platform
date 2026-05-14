import { getServerSession, User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { courseModel } from "@/models/course.model";
import { connectToDatabase } from "@/lib/dbConnect";

export async function GET(request:NextRequest,context:{params:Promise<{courseId:string}>}) {
    try {
        await connectToDatabase()
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
            model: "Video"
        });
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
            status:201
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