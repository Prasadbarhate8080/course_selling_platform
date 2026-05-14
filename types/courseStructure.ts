export interface VideoDTO {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  controls?: boolean;
  transformation?: {
    height: number;
    width: number;
    quality?: number;
  };
}

export interface CourseStructureItem {
  _id?: string;
  order?: number;
  topic: string;
  lectures: {
    _id?: string;
    order?: number;
    video: VideoDTO;
  }[];
}
