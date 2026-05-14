import { apiError } from "@/types/apiError";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function axiosErrorHandler(error:any,errorFrom?:string) : void {
    const axiosError = error as AxiosError<apiError>
    console.log
    if(axiosError.response)
    {
        console.log(errorFrom,axiosError.response.data)
        toast.error(axiosError.response.data.message)
    }
    else if(axiosError.request)
    {
        toast.error(`${errorFrom}Something went wrong please check your internet connection!`)
    }
    else
    {
        toast.error(`${errorFrom}something went wrong`);
    }
}