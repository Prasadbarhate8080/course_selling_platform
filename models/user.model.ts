import bcrypt from "bcryptjs";
import mongoose, { Document,Schema } from "mongoose";

export interface User extends Document
{
    userName:string,
    email:string,
    password:string,
    verifyCode:string,
    isVerified: boolean,
    verifyCodeExpiry: Date,
    courses:mongoose.Schema.Types.ObjectId[]
    role: "user" | "admin"
}

const userSchema:Schema<User> = new mongoose.Schema(
    {
        userName:{
            type: String,
            required: [true, "userName is required"],
            unique: true,
            trim: true,
        },
        email:{
            type:String,
            required: true,
            unique: true,
            match: [/.+\@.+\..+/, "please use a valid email address"]
        },
        password:{
            type:String,
        },
        verifyCode:{
            type:String,
        },
        verifyCodeExpiry:{
            type:Date,
        },
        isVerified:{
            type:Boolean,
            default:false
        },
        courses:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Course"
            }
        ],
        role:{
            type:String,
            enum:["user","admin"],
            default:"user"
        }
    }
)

userSchema.pre("save",async function (next) {
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,10)
    }
    next();
})

const userModel = (mongoose.models.User as mongoose.Model<User> || mongoose.model<User>("User",userSchema))

export {userModel}