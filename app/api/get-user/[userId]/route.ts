import { connectToDatabase } from "@/lib/dbConnect";
import { userModel } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest,context: { params: Promise<{ userId: string }> }){
    try {
        await connectToDatabase()
        console.log("request is comming to the get user route")
        let {userId} = await context.params;
        let user = await userModel.findById(userId)
        if(!user) return NextResponse.json({
            success:false,
            message:"user not found"
        },{status: 401})
        return NextResponse.json({
            success:true,
            message:"user found",
            data:user
        },{status: 201})
    } catch (error) {
        
    }

}