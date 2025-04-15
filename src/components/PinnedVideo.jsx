import { useRef, memo } from "react";
import { PinIcon, VideoOff } from "lucide-react";

const PinnedVideo = ({
  pinnedVideo,
  participantState, // Changed from participantStates to participantState
  livekitParticipants,
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

  const getParticipantName = (identity) => {
    const participant = livekitParticipants[identity];
    if (!participant) return "Unknown";
    try {
      const metadata = participant.metadata ? JSON.parse(participant.metadata) : {};
      return metadata.displayName || participant.identity || "Unknown";
    } catch {
      return participant.identity || "Unknown";
    }
  };

  const handleMouseDown = (e) => {
    if (pinnedVideoRef.current) {
      const rect = pinnedVideoRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  if (!pinnedVideo || !participantState) {
    return null;
  }

  return (
    <div
      ref={pinnedVideoRef}
      className="absolute w-60 h-40 bg-background rounded-md shadow-lg z-50"
      style={{
        left: pinnedVideoPosition.x,
        top: pinnedVideoPosition.y,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      {participantState.videoEnabled && participantState.stream ? (
        <video
          ref={(el) => {
            if (el && participantState.trackSid) {
              videoRefs.current[participantState.trackSid] = el;
              if (el.srcObject !== participantState.stream) {
                el.srcObject = participantState.stream;
                el.play().catch((e) => console.error("Pinned video play failed:", e));
              }
            }
          }}
          autoPlay
          playsInline
          muted
          className="w-full h-full rounded-md object-cover"
        />
      ) : (
        <div className="video-off-placeholder w-full h-full rounded-md">
          <VideoOff className="h-8 w-8" />
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
        {participantState.identity === auth.currentUser?.uid
          ? "You"
          : getParticipantName(participantState.identity)}
      </div>
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          className="h-6 w-6 bg-background/80 hover:bg-background rounded-full flex items-center justify-center"
          onClick={() => setPinnedVideo(null)}
        >
          <PinIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

// Memoize and add custom prop comparison
export default memo(PinnedVideo, (prevProps, nextProps) => {
  return (
    prevProps.pinnedVideo === nextProps.pinnedVideo &&
    prevProps.participantState === nextProps.participantState &&
    prevProps.pinnedVideoPosition.x === nextProps.pinnedVideoPosition.x &&
    prevProps.pinnedVideoPosition.y === nextProps.pinnedVideoPosition.y &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.dragOffset.x === nextProps.dragOffset.x &&
    prevProps.dragOffset.y === nextProps.dragOffset.y
  );
});