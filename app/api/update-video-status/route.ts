import { connectToDatabase } from "@/lib/dbConnect";
import { videoModel } from "@/models/course.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST (request:NextRequest) {
    try {
        console.log("status updation request came")
        let body = await request.json();
        let {videoId,videoUrl} = body;
        await connectToDatabase()
        let token = request.headers.get("x-internal-token")
        if(token !== process.env.INTERNAL_API_TOKEN)
        {
            return NextResponse.json({
                message:"unauthorized",
                success:false
            },
            {
                status:401
            }
            )
        }
        if(!videoId || !videoUrl) 
            return NextResponse.json({
                success:false,
                message:"cannot get videoid or url"
            },
        {status:401}
        )
        let video = await videoModel.updateOne({_id:videoId},{
            videoUrl:videoUrl,
            status:"completed"
        })
        console.log(video)
        if(video.matchedCount == 0)
        {
            return NextResponse.json({
                success:false,
                message:"video not found"
            },
            {status:401})
        }else if(video.modifiedCount == 0){
            return NextResponse.json({
                success:false,
                message:"video found but not modified"
            },
            {status:401})
        }
    
        return NextResponse.json({
            success:true,
            message:"video updated succesfully"
        },
        {status:200}
    )
    
    } catch (error) {
        return NextResponse.json({
            success:false,
            message:"error in updating course"
        },
        {status:500}
    )
    }
}