import { User } from "@/models/user.model";
import { fetch } from "./fetchData";
import { apiResponse } from "@/types/apiResponse";

type user = Omit<User,"">;

class UserService {
    async getUser(userId:string) {
            return fetch<apiResponse<user>>(`/get-user/${userId}`)
        }
}

export const userService = new UserService();