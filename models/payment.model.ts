import mongoose, {Schema,Document} from "mongoose";

export interface Payment extends Document
{
    price: number,
    status: "pending" | "success" | "failed",
    courseId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    razorpayOrderId: string,
    razorpayPaymentId?: string,
    razorpaySignature?: string,
    createdAt: Date,
    updatedAt: Date,
}

const paymentSchema:Schema<Payment> = new Schema(
    {
        price: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "success", "failed"],
            default: "pending",
            required: true
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },
        userId: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        razorpayOrderId: {
            type: String,
            required: true,
            unique: true
        },
        razorpayPaymentId: {
            type: String
        },
        razorpaySignature: {
            type: String
        }
    },
    { timestamps: true }
)

const paymentModel = (mongoose.models.Payment as mongoose.Model<Payment> || mongoose.model<Payment>("Payment",paymentSchema))

export {paymentModel}