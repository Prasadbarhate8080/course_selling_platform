import { getServerSession, User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { courseModel } from "@/models/course.model";
import { connectToDatabase } from "@/lib/dbConnect";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    await connectToDatabase();
    console.log("request came on the add course topic ");
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
    let { courseId } = await context.params;
    let { topic, order = 1 } = await request.json();
    console.log(topic,order,courseId)
    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          message: "cannot get courseId",
        },
        { status: 401 }
      );
    }
    if (!topic || !order) {
      return NextResponse.json(
        {
          success: false,
          message: "cannot get topic or order",
        },
        { status: 401 }
      );
    }

    let course = await courseModel.findOne({
      _id: courseId,
    });

    course?.courseStructure.push({
      order: order,
      topic: topic,
      lectures: [],
    });
    let addedTopic = await course?.save();

    return NextResponse.json(
      {
        success: true,
        message: "topic added successfully",
        data: addedTopic,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log("error in the add topic:", error);
    return NextResponse.json(
      {
        success: false,
        message: "error in adding topic",
      },
      { status: 500 }
    );
  }
}
