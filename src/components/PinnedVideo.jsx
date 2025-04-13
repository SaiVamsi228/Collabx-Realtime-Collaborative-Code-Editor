import { useRef } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

const PinnedVideo = ({
  pinnedVideo,
  videoStreams,
  participants,
  auth,
  pinnedVideoPosition,
  setPinnedVideoPosition,
  setPinnedVideo,
  videoRefs,
  isDragging,
  setIsDragging,
  dragOffset,
  setDragOffset,
}) => {
  const pinnedVideoRef = useRef(null);

  const handleMouseDown = (e) => {
    if (pinnedVideoRef.current && pinnedVideo !== null) {
      setIsDragging(true);
      const rect = pinnedVideoRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return pinnedVideo && videoStreams[pinnedVideo] ? (
    <div
      ref={pinnedVideoRef}
      className="absolute z-50 rounded-md bg-background border shadow-lg"
      style={{
        left: `${pinnedVideoPosition.x}px`,
        top: `${pinnedVideoPosition.y}px`,
        width: "240px",
        height: "180px",
      }}
      onMouseDown={handleMouseDown}
    >
      <video
        ref={(el) => {
          if (el) {
            videoRefs.current[pinnedVideo] = el;
            el.srcObject = videoStreams[pinnedVideo];
          }
        }}
        autoPlay
        playsInline
        muted={pinnedVideo.includes(auth.currentUser?.uid)}
        className="w-full h-full object-cover rounded-md"
      />
      <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
        {pinnedVideo.includes(auth.currentUser?.uid)
          ? "You"
          : participants.find((p) => pinnedVideo.includes(p.uid))?.username ||
            "Unknown"}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 bg-background/80 hover:bg-background"
        onClick={() => setPinnedVideo(null)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  ) : null;
};

export default PinnedVideo;