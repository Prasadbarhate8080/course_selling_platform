import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

//to provide quality control option in ABS Video
import "videojs-contrib-quality-levels";
import "videojs-http-source-selector";

export const VideoJS = (props: { options: any; onReady?: any; }) => {
    const placeholderRef = useRef<any>(null);
    const playerRef = useRef<any>(null)
    const { options, onReady } = props;

    useEffect(() => {
        // Make sure Video.js player is only initialized once
        if (!playerRef.current) {
         // The Video.js player needs to be inside the component element for React 18 Strict Mode. 
            const placeholderEl = placeholderRef.current;
            const videoElement = document.createElement("video");
            videoElement.classList.add("video-js", "vjs-big-play-centered");
            videoElement.setAttribute("playsinline", "true");
            placeholderEl.appendChild(videoElement);

            const player: any = playerRef.current = videojs(videoElement, {
                ...options,
                userActions: {
                    click: true,
                    doubleClick: true
                }
            }, () => {
                onReady && onReady(player);
            });

            // Binding to the source selector plugin in Video.js
            if (player.httpSourceSelector) {
                player.httpSourceSelector();
            }
        } else {
            const player = playerRef.current;
            player.autoplay(options.autoplay);
            player.src(options.sources);
            player.poster(options.poster);
        }

    }, [options, onReady]);

    // Dispose the Video.js player when the functional component unmounts
    useEffect(() => {

        const player = playerRef.current;

        return () => {
            if (player) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [playerRef]);

    return <div ref={placeholderRef}></div>;
};

export default VideoJS;