import { mux } from "@/lib/mux"
import { NextResponse } from "next/server";

export async function GET() {

    try {
      console.log("request come on the upload auth`")
      const upload = await mux.video.uploads.create({
        cors_origin: "*", // Or specify your app's origin
        new_asset_settings: {
          playback_policies: ["public"],
          video_quality: "basic",
        },
      });
      return NextResponse.json({
        uploadUrl: upload.url,
        uploadId: upload.id,
      },{status:200});
    } catch (error) {
      console.log("error in the upload auth")
      console.error("Failed to create upload URL:", error);
      return NextResponse.json({ error: "Failed to generate upload URL",},{status: 500});
    }
}