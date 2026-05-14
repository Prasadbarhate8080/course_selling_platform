import mongoose, {Schema,Document} from "mongoose";

export interface Admin extends Document
{
    userName:string,
    email:string,
    adminSecrete:string,
    password:string
}

const adminSchema:Schema<Admin> = new Schema(
    {
        userName:{
            type:String,
            required: [true, "userName is required"]
        },
        email:{
            type:String,
            required: [true, "email is required"]
        },
        adminSecrete:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:[true, "password is required"]
        }
    }
)

const adminModel = (mongoose.models.Admin as mongoose.Model<Admin> || mongoose.model<Admin>("Admin",adminSchema))

export {adminModel}