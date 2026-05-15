import { CourseStructureItem } from "@/types/courseStructure";
import { fetch } from "./fetchData";
import { Video } from "@/models/course.model";
import { apiResponse } from "@/types/apiResponse";

export type videoDataType = Omit<Video, "_id">
export interface CourseDTO {
  _id: string;
  courseStructure: CourseStructureItem[];
}

type CreateVideoInput = {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
};
class VideoServices{
    async createVideo(videoData: CreateVideoInput,courseId:string) {
        return fetch<apiResponse<CourseDTO>>(`/upload-video/${courseId}`,{
            method:"POST",
            body:videoData
        })
    }
}

export const videoServices =  new VideoServices()