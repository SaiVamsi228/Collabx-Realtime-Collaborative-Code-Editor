import { Button } from "./ui/button";
import { Mic, MicOff, Video, VideoOff, LogOut } from "lucide-react";

const BottomBar = ({
  theme,
  micEnabled,
  toggleMic,
  videoEnabled,
  toggleVideo,
  room,
  cleanupSession,
  navigate,
}) => {
  return (
    <div className="flex items-center justify-center p-2 border-t">
      <div className="flex items-center gap-4">
        <Button
          variant={micEnabled ? "default" : "outline"}
          className={`rounded-full border border-gray-400 ${
            micEnabled
              ? "bg-white hover:bg-gray-100"
              : "bg-black hover:bg-gray-800"
          }`}
          size="icon"
          onClick={toggleMic}
        >
          {micEnabled ? (
            <Mic
              className={`h-7 w-7 ${theme === "light" ? "text-black" : "text-white"}`}
            />
          ) : (
            <MicOff
              className={`h-7 w-7 ${theme === "light" ? "text-black" : "text-white"}`}
            />
          )}
        </Button>

        <Button
          variant={videoEnabled ? "default" : "outline"}
          size="icon"
          className={`rounded-full border border-gray-400 ${
            videoEnabled
              ? "bg-white hover:bg-gray-100"
              : "bg-black hover:bg-gray-800"
          }`}
          onClick={toggleVideo}
        >
          {videoEnabled ? (
            <Video
              className={`h-7 w-7 ${theme === "light" ? "text-black" : "text-white"}`}
            />
          ) : (
            <VideoOff
              className={`h-7 w-7 ${theme === "light" ? "text-black" : "text-white"}`}
            />
          )}
        </Button>

        <Button
          variant="destructive"
          size="sm"
          className="rounded-lg bg-red-700 text-white hover:bg-red-600"
          onClick={() => {
            if (room) {
              cleanupSession();
              room.disconnect();
            }
            navigate("/");
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Leave Session
        </Button>
      </div>
    </div>
  );
};

export default BottomBar;