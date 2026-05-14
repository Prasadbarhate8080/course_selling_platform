export interface apiResponse<T> {
    success: boolean,
    message: string,
    data?: T
}