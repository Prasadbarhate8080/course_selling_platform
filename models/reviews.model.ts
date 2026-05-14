import mongoose, {Schema,Document} from "mongoose";

export interface Reviews extends Document 
{
    user:mongoose.Schema.Types.ObjectId,
    comment:string,
    rating: 1 | 2 | 3 | 4 | 5;
}

const reviewsSchema:Schema<Reviews> = new Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        comment:{
            type:String,
            required:true
        },
        rating:{
            type:Number,
            required:true
        }
    }
)

const reviewsModel = (mongoose.models.Review as mongoose.Model<Reviews> || mongoose.model("Review",reviewsSchema))
export {reviewsModel}