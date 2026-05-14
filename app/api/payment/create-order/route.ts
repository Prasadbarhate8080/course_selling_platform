import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConnect";
import { courseModel } from "@/models/course.model";
import { paymentModel } from "@/models/payment.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

/**
 * Razorpay Order Creation API
 * This API creates a unique Order ID from Razorpay and saves a pending payment record in our DB.
 * 
 * Flow:
 * 1. Validate user session.
 * 2. Get course details and price.
 * 3. Create Razorpay order (amount in paise).
 * 4. Save pending payment in MongoDB with the Razorpay Order ID.
 */

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { courseId } = await request.json();

    // 1. Authenticate User
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login to buy the course." },
        { status: 401 }
      );
    }

    const user = session.user as any;

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
        { status: 400 }
      );
    }

    // 2. Fetch Course Details
    const course = await courseModel.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // 3. Initialize Razorpay Instance
    // Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are in your .env file
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // 4. Create Razorpay Order
    const options = {
      amount: Math.round(course.price * 100), // Razorpay expects amount in paise (1 INR = 100 paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Failed to create Razorpay order" },
        { status: 500 }
      );
    }

    // 5. Save Pending Payment in Database
    // This allows us to track the payment status later via Webhooks or Verification API
    await paymentModel.create({
      userId: user._id,
      courseId: course._id,
      price: course.price,
      status: "pending",
      razorpayOrderId: order.id,
    });

    return NextResponse.json(
      {
        success: true,
        order, // Return the Razorpay order object to the frontend
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error while creating payment order" },
      { status: 500 }
    );
  }
}
