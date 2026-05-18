import { NextResponse } from "next/server";
import { reviewsModel } from "@/models/reviews.model";
import { courseModel, videoModel } from "@/models/course.model";
import { userModel } from "@/models/user.model";
import { connectToDatabase } from "@/lib/dbConnect";

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    context: { params: Promise<{ courseId: string }> }
) {
    try {
        await connectToDatabase();
        
        // Ensure models are registered
        if (!videoModel) console.log("videoModel not found");

        const { courseId } = await context.params;

        if (!courseId) {
            return NextResponse.json(
                { success: false, message: "Course ID is required" },
                { status: 400 }
            );
        }

        // Fetch only necessary details for preview
        const course = await courseModel.findById(courseId)
            .select("title description price thumbnailUrl reviews courseStructure")
            .populate({
                path: "courseStructure.lectures.video",
                model: videoModel,
                select: "title" // ONLY title, no URLs or other sensitive info
            })
            .populate({
                path: "reviews",
                model: reviewsModel,
                select: "rating comment user",
                populate: {
                    path: "user",
                    model: userModel,
                    select: "userName"
                }
            }).lean();

        if (!course) {
            return NextResponse.json(
                { success: false, message: "Course not found" },
                { status: 404 }
            );
        }

        const coursePreview = {
            _id: course._id,
            title: course.title,
            description: course.description,
            price: course.price,
            thumbnailUrl: course.thumbnailUrl,
            reviews: course.reviews,
            courseStructure: course.courseStructure
        };

        return NextResponse.json(
            {
                success: true,
                message: "Course preview fetched successfully",
                data: coursePreview
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error fetching course preview:", error);
        return NextResponse.json(
            { success: false, message: "Error fetching course preview" },
            { status: 500 }
        );
    }
}
