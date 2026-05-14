import mongoose, { Schema, Document } from "mongoose";

export interface Video extends Document {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  controls?: boolean;
  uploadId?: string;
  status?: "uploading" | "completed" | "faild"  | "processing" | "uploaded",
  transformation?: {
    height: number;
    width: number;
    quality?: number;
  };
}

export interface Course extends Document {
  title: string;
  description: string;
  price: number;

  admin: mongoose.Types.ObjectId;

  user: mongoose.Types.ObjectId[];

  reviews: mongoose.Types.ObjectId[];

  thumbnailUrl:string

  courseStructure: {
    order?: number;
    topic: string;
    lectures: {
      order?: number;
      video: mongoose.Types.ObjectId;
    }[];
  }[];
}


export interface Progress extends Document
{
    lastPosition:Number,
    user:mongoose.Schema.Types.ObjectId,
    video:mongoose.Schema.Types.ObjectId
}

const progressSchema:Schema<Progress> = new Schema(
    {
        lastPosition:{
            type:Number
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        video:{
            type:mongoose.Schema.Types.ObjectId
        }
    }
)

const videoSchema:Schema<Video> = new Schema(
    {
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
        },
        videoUrl:{
            type:String,
            required:true,
        },
        status:{
            type:String,
        },
        thumbnailUrl:{
            type:String
        },
        controls:{
            type:Boolean,
            default:true
        },
        uploadId: {
            type: String,
        },
        transformation:{
            height:{
                type:Number,
                default:720
            },
            width:{
                type:Number,
                default:720
            },
            quality:{
                type:Number,
                default:240
            }
        }
    }
)

const courseSchema:Schema<Course> = new Schema(
    {
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required: true
        },
        price:{
            type: Number,
            required: true
        },
        thumbnailUrl:{
            type:String,
        },
        admin:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        user:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            }
        ],
        reviews:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Review"
            }
        ],
        courseStructure: [
            {
                topic:{type:String,required:true},
                lectures:[
                    {
                        video:{
                            type:mongoose.Schema.Types.ObjectId,
                            ref:"Video"
                        }
                    }
                ]
            }
        ]
    }
)

const progressModel = (mongoose.models.Progress as mongoose.Model<Progress> || mongoose.model("Progress",progressSchema))
const courseModel = (mongoose.models.Course as mongoose.Model<Course> || mongoose.model<Course>("Course",courseSchema))
const videoModel =  (mongoose.models.Video as mongoose.Model<Video> || mongoose.model<Video>("Video",videoSchema))

export {courseModel,videoModel,progressModel}