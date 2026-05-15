import { getServerSession, User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { courseModel, videoModel } from "@/models/course.model";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/dbConnect";

export const dynamic = 'force-dynamic';

export async function POST(request:NextRequest,context: { params: Promise<{ courseId: string }> })
{
    try {
        await connectToDatabase()
        console.log("request came on the upload video")
        let body = await request.json();
        let {courseId} = await context.params;
        console.log("courseId",courseId)
        const session = await getServerSession(authOptions);
        const admin:User = session?.user as User
        // if(!session && admin?.role !== "admin")
        // {
        //     return NextResponse.json(
        //         {
        //             success:false,
        //             message:"unauthorized request"  
        //         },
        //         {status:401}
        //     )
        // }
        let {videoUrl,title,description,thumbnailUrl,videoUploadTopic,uploadId} = body;

        if(!videoUrl && !title && !description) return NextResponse.json({
            success:false,
            message:"insufficient data"
        },{status:401})

        let newVideo:mongoose.Document = await videoModel.create({
            title:title,
            description:description,
            videoUrl:videoUrl,
            status:"uploaded",
            thumbnailUrl:thumbnailUrl,
            uploadId:uploadId,
        })
        let videoId:mongoose.Types.ObjectId = newVideo?._id as mongoose.Types.ObjectId;
        let course = await courseModel.findOne(
            {
                _id:courseId,
            },
        )
        if(!course) return NextResponse.json(
            {
                success:"false",
                message:"course not found"
            },
            {status:401}
        )
        
        course?.courseStructure[videoUploadTopic].lectures.push({video:videoId})
        let videoAdded = await course.save()
        return NextResponse.json(
            {
                success:true,
                message:`video uploaded successfully`
            },
            {status:201}
        )
        
    } catch (error) {
        console.log("error at video upload",error)
        return NextResponse.json(
            {
                success:false,
                message:"error in uploading video"
            },
            {status:500}
        )
        
    }
}