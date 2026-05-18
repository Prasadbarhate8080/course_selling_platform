import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import * as crypto from "crypto"
import { videoModel } from "@/models/course.model";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
  webhookSecret: process.env.MUX_WEBHOOK_SECRET!,
});
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headersList = await headers();
    const signatureHeader = headersList.get("mux-signature");
    if (!signatureHeader)
      return NextResponse.json(
        { message: "does not get the siganature" },
        { status: 400 },
      );
    const signatureValues = signatureHeader?.split(",");
    const timestamp = signatureValues[0]?.split("=")[1];
    const signature = signatureValues[1]?.split("=")[1];
    const payload = timestamp + "." + rawBody;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.MUX_WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");
    if (expectedSignature !== signature)
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

    const event = JSON.parse(rawBody);
    console.log("Mux Event Type:", event.type);
    
    // In Mux, for direct uploads, the upload_id is usually in event.data.upload_id 
    // or sometimes event.data.id depending on the event type.
    const uploadId = event.data.upload_id || event.data.id;
    console.log("Detected Upload ID from Mux:", uploadId);

    if (event.type === "video.asset.ready") {
      const playbackId = event.data.playback_ids?.[0]?.id;
      const assetId = event.data.id; // This is the Asset ID

      console.log("VIDEO ASSET READY:", { playbackId, assetId, uploadId });
      
      // Try to find the video by uploadId
      let video = await videoModel.findOne({ uploadId: uploadId });
      
      if (!video) {
        console.error("CRITICAL: Video not found in DB for uploadId:", uploadId);
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }

      console.log("Updating Video in DB:", video._id);
      video.videoUrl = `https://stream.mux.com/${playbackId}.m3u8`;
      video.status = "completed";
      await video.save();
      console.log("Video successfully updated with new URL:", video.videoUrl);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
