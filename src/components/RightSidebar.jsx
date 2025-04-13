import { useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PinIcon, ChevronDown } from "lucide-react";
import "../styles/globals.css";

const RightSidebar = ({
  theme,
  rightSidebarOpen,
  rightSidebarTab,
  setRightSidebarTab,
  videoStreams,
  participants,
  pinnedVideo,
  setPinnedVideo,
  auth,
  chatMessages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  newMessageCount,
  isAtBottom,
  scrollToBottom,
  livekitParticipants,
}) => {
  const videoRefs = useRef({});
  const chatContainerRef = useRef(null);
  const chatMessagesRef = useRef(null);

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

  return (
    <div
      className={`border-l transition-all duration-300 ${
        rightSidebarOpen ? "w-64" : "w-0 overflow-hidden"
      }`}
    >
      <Tabs
        value={rightSidebarTab}
        onValueChange={setRightSidebarTab}
        className="h-full flex flex-col"
      >
        <div className="p-2 border-b">
          <TabsList className="w-full">
            <TabsTrigger value="video" className="flex-1 rounded-lg">
              Video
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex-1 rounded-lg">
              Chat
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="video"
          className="flex-1 m-0 p-0 right-sidebar-content"
        >
          <div className="p-2 border-b">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid-1">1 per row</SelectItem>
                <SelectItem value="grid-2">2 per row</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="flex-1 p-2 h-[calc(100%-60px)]">
            <div className="video-grid">
              {Object.entries(videoStreams).map(([sid, { stream, participantIdentity }]) => (
                <div key={sid} className="video-wrapper relative">
                  <video
                    ref={(el) => {
                      if (el) {
                        videoRefs.current[sid] = el;
                        el.srcObject = stream;
                        el.play().catch((e) => console.error("Video play failed:", e));
                      }
                    }}
                    autoPlay
                    playsInline
                    muted={participantIdentity === auth.currentUser?.uid}
                    className="w-full h-auto rounded-md"
                  />
                  <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
                    {participantIdentity === auth.currentUser?.uid
                      ? "You"
                      : getParticipantName(participantIdentity)}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 bg-background/80 hover:bg-background"
                      onClick={() =>
                        setPinnedVideo(pinnedVideo === sid ? null : sid)
                      }
                    >
                      <PinIcon
                        className={`h-3 w-3 ${
                          theme === "light" ? "text-black" : "text-white"
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="chat"
          className="flex-1 m-0 p-0 right-sidebar-content"
        >
          <div className="chat-container flex-1 flex flex-col" ref={chatContainerRef}>
            <ScrollArea
              className="chat-messages flex-1"
              ref={chatMessagesRef}
              onScroll={() => {
                if (chatMessagesRef.current) {
                  const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
                  const isBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
                  if (isBottom) {
                    setNewMessageCount(0);
                  }
                }
              }}
            >
              {chatMessages.map((message) => {
                const isCurrentUser = message.senderId === auth.currentUser?.uid;
                return (
                  <div
                    key={message.id}
                    className={`message ${isCurrentUser ? "sent" : "received"} p-2`}
                  >
                    <div className="message-content">
                      {!isCurrentUser && (
                        <span className="sender">{message.senderName}</span>
                      )}
                      <p>{message.text}</p>
                      <span className="timestamp text-xs">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
            {newMessageCount > 0 && !isAtBottom && (
              <div className="new-messages-indicator p-2">
                <div
                  className="new-messages-button flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded cursor-pointer"
                  onClick={scrollToBottom}
                >
                  <ChevronDown className="h-4 w-4" />
                  {newMessageCount} new message{newMessageCount > 1 ? "s" : ""}
                </div>
              </div>
            )}
            <div className="chat-input-container p-2 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  className="flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="rounded-lg bg-black text-white hover:bg-gray-900"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RightSidebar;