import { apiResponse } from "@/types/apiResponse";
import { fetch } from "./fetchData";
import { Course } from "@/models/course.model";
import { CourseStructureItem } from "@/types/courseStructure";

// export type videoDataType = Omit<Video, "_id">

export interface CourseDTO {
  _id: string;
  courseStructure: CourseStructureItem[];
}

class CourseServices{
    async addCourseTopic(courseData:{courseTopic:string,courseId:string}) {
        return fetch<apiResponse<Course>>(`/add-course-topic/${courseData.courseId}`,{
            method:"POST",
            body:{
                topic: courseData.courseTopic,
            }
        })
    }
    async getCourse(courseId:string) {
        return fetch<apiResponse<CourseDTO>>(`/get-course/${courseId}`,{
            method:"GET",
        })
    }
    async getCourses() {
        return fetch<apiResponse<Course[]>>(`/get-courses`,{
            method:"GET",
        })
    }

}

export const courseServices =  new CourseServices()