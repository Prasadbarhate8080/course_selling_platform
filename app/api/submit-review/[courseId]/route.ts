import { getServerSession, User} from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import { reviewsModel } from "@/models/reviews.model";
import { courseModel } from "@/models/course.model";
import { connectToDatabase } from "@/lib/dbConnect";

export const dynamic = 'force-dynamic';

export async function POST(request:Request, context: { params: Promise<{ courseId: string }> })
{
    try {
        await connectToDatabase()
        let {rating, comment} = await request.json();
        let session = await getServerSession(authOptions);
        const { courseId } = await context.params; 
        console.log("rating and comment:",{rating,comment})
        console.log("courseId:",courseId)
        let userId:string = session?.user?._id.toString()
        if(!session)
        {
            return NextResponse.json(
                {
                    success:false,
                    message:"unauthorized"
                },
                {status:401}
            )
        }
        const user:User = session?.user;
        const _userId = new mongoose.Types.ObjectId(userId)
        const _courseId = new mongoose.Types.ObjectId(courseId)
        let addedReview = await reviewsModel.create(
            {
                user:_userId,
                comment:comment,
                rating:rating
            },
        )
       
        let addReviewToCourse = await courseModel.updateOne(
            {_id:_courseId},
            {$push:{reviews: addedReview._id}},
        )

        return NextResponse.json(
            {
                success:true,
                message:"review sent successfully"
            },
            {status:201}
        )

    } catch (error) {
        console.log("error in submiting review:",error)
        return NextResponse.json(
            {
                success:false,
                message:"error in submiting review"
            },
            {status:500}
        )
    }

}