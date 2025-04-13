import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

const LeftSidebar = ({
  theme,
  leftSidebarOpen,
  participants,
  activeEditors,
  livekitParticipants,
  providerRef,
}) => {
  return (
    <div
      className={`border-r transition-all duration-300 ${
        leftSidebarOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className={`font-semibold ${!leftSidebarOpen && "sr-only"}`}>
            Participants
          </h2>
        </div>
        <ScrollArea className="flex-1 p-2">
          {participants.map((participant) => {
            const states =
              providerRef.current?.awareness?.getStates() || new Map();
            const state = Array.from(states).find(
              ([_, s]) => s.user?.id === participant.uid
            );
            const clientId = state ? state[0] : null;
            const isActive = activeEditors.has(clientId);
            const livekitParticipant = livekitParticipants[participant.uid];
            const micOn = livekitParticipant?.isMicrophoneEnabled || false;
            const videoOn = livekitParticipant?.isCameraEnabled || false;
            const displayName = participant.username || "Anonymous";
            return (
              <div
                key={participant.uid}
                className={`participant-container ${
                  isActive ? "active" : ""
                } flex items-center gap-2 p-2 rounded-md hover:bg-muted ${
                  !leftSidebarOpen && "justify-center"
                }`}
              >
                <div className="relative">
                  <Avatar
                    className={isActive ? "border-2 border-green-500" : ""}
                  >
                    <AvatarImage src={participant.avatar} alt={displayName} />
                    <AvatarFallback>
                      {displayName
                        .split(" ")
                        .map((word) => word.charAt(0))
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {leftSidebarOpen && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{displayName}</span>
                    <div className="flex gap-1">
                      <span className={micOn ? "text-green-500" : "text-red-500"}>
                        {micOn ? (
                          <Mic className="h-4 w-4" />
                        ) : (
                          <MicOff className="h-4 w-4" />
                        )}
                      </span>
                      <span
                        className={videoOn ? "text-green-500" : "text-red-500"}
                      >
                        {videoOn ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <VideoOff className="h-4 w-4" />
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </ScrollArea>
      </div>
    </div>
  );
};

export default LeftSidebar;