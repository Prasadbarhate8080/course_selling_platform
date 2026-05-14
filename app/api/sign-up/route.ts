import { sendVerificationEmail } from "@/helper/sendVerificationEmail";
import { connectToDatabase } from "@/lib/dbConnect";
import { userModel } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest)
{
    await connectToDatabase();
    try {
        const {userName,email,password} = await request.json();
        console.log(userName,email,password)
        const verifiedExistedUserByUsername = await userModel.findOne(
            {
                userName:userName,
                isVerified:true
            }
        )
        if(verifiedExistedUserByUsername)
        {
            return NextResponse.json(
                {
                success:false,
                message:"username is already taken"
                },
                {status:400}
            )
        }   

        const existedUserByEmail = await userModel.findOne({
            email:email
        })
        let verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if(existedUserByEmail){
            if(existedUserByEmail.isVerified){
                return NextResponse.json(
                    { 
                        success:false,
                        message:"user is already exit with this email"
                    },
                    {status:400}
                )
            }
            else
            {
                existedUserByEmail.password = password;
                existedUserByEmail.verifyCode = verifyCode;
                existedUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existedUserByEmail.save();
            }
        }
        else
        {
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);
            const newUser = new userModel({
                userName,
                email,
                password,
                verifyCode,
                verifyCodeExpiry:expiryDate,
                isVerified:false
            })
            await newUser.save();
        }   

        const emailResponse = await sendVerificationEmail(
            email,userName,verifyCode
        )

        if (!emailResponse.success) {
        return Response.json(
          {
            success: false,
            message: emailResponse.message,
          },
          { status: 500 }
        );
      }
  
      return Response.json(
        {
          success: true,
          message: 'User registered successfully. Please verify your account.',
        },
        { status: 201 }
      );

    } catch (error) {
        console.error('Error registering user:', error);
      return Response.json(
        {
          success: false,
          message: 'Error registering user',
        },
        { status: 500 }
      );
    }
    
}