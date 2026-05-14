import { connectToDatabase } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { redisClient } from "@/lib/redisClient";
import { courseModel } from "@/models/course.model";
import { videoProcessingQueue } from "@/lib/queue";



export async function GET(){
    try {
        // await connectToDatabase()
        // let chachedCourse;
        // try {
        //     chachedCourse = await redisClient.get("course");
            
        // } catch (error) {
        //     console.log("error:",error)
        // }
        // let jsonCourse;
        // if(chachedCourse) 
        //     jsonCourse = JSON.parse(chachedCourse)

        // if(chachedCourse)
        //     return NextResponse.json(jsonCourse)
        
        // let course = await courseModel.findOne({_id:"6916f8df254aac026e1307e8"})
        // await redisClient.setex("course",5,JSON.stringify(course));
        // return  NextResponse.json(course)


        const res = await videoProcessingQueue.add("process-video",{
            url:"this the video url"
        })
        
        console.log("job added to queue",res.id)
        return NextResponse.json({jobId:res.id})

    } catch (error) {
        console.log("error occured during the getting course",error)
        return NextResponse.json({error:"error acoursed during the fetching the course"})
    }
    
}