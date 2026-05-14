import { Connection } from "mongoose";

declare module "*.css";
declare module "*.scss";

declare global {
    var mongoose:{
        conn: Connection | null 
        promise: Promise<Connection> | null
    }
}
