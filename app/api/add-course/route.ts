import { courseModel } from "@/models/course.model";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession, User} from "next-auth";
import { connectToDatabase } from "@/lib/dbConnect";
import { success } from "zod";

export async function POST(request: NextRequest,response: NextResponse) {
    try {
        await connectToDatabase();
        let { title, description,price,thumbnailUrl } = await request.json();
        let session = await getServerSession(authOptions);
        if (!session || (session.user as User).role !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "unauthorized request"
                },
                { status: 401 }
            )
        }
        let admin = session.user as User;
        console.log(title,description,price,thumbnailUrl)
        if(!title || !description || !price || !thumbnailUrl)
            return NextResponse.json({
                success:false,
                message:"invalid data"
            },
            {status:400}
        )
        let newCourse = await courseModel.create(
            {
                title: title,
                description: description,
                price:price,
                admin: admin._id,
                thumbnailUrl:thumbnailUrl
            },
        )
        return NextResponse.json(
            {
                success:true,
                message:"course added successfully",
                data:newCourse
            },
            {status:201}
        )
    } catch (error) {
        console.log("error in creating course",error)
        return NextResponse.json(
            {
                success:false,
                message:"error in creating course"
            },
            {status:500}
        )
    }

}