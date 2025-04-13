import React, { useEffect, useRef } from "react";

const RightSidebar = ({
  theme,
  rightSidebarOpen,
  rightSidebarTab,
  setRightSidebarTab,
  participantStates,
  livekitParticipants,
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
  videoRefs,
}) => {
  const chatMessagesRef = useRef(null);

  // Re-render videos when participantStates changes
  useEffect(() => {
    console.log("RightSidebar: participantStates updated:", participantStates);
    Object.entries(participantStates).forEach(([identity, state]) => {
      if (state.videoEnabled && state.trackSid && videoRefs.current[state.trackSid]) {
        console.log(`Ensuring video for ${identity}, trackSid: ${state.trackSid}`);
        videoRefs.current[state.trackSid].play().catch((e) =>
          console.error(`Video play failed for ${identity}:`, e)
        );
      }
    });
  }, [participantStates, videoRefs]);

  const handlePinVideo = (identity) => {
    setPinnedVideo(pinnedVideo === identity ? null : identity);
  };

  return (
    <div
      className={`right-sidebar ${
        rightSidebarOpen ? "w-80" : "w-0"
      } bg-gray-100 dark:bg-gray-800 transition-all duration-300 flex flex-col overflow-hidden`}
    >
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 p-2 ${
            rightSidebarTab === "video"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
          onClick={() => setRightSidebarTab("video")}
        >
          Video
        </button>
        <button
          className={`flex-1 p-2 ${
            rightSidebarTab === "chat"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
          onClick={() => setRightSidebarTab("chat")}
        >
          Chat
        </button>
      </div>

      <div className="right-sidebar-content">
        {rightSidebarTab === "video" && (
          <div className="video-grid p-2">
            {Object.entries(participantStates).map(([identity, state]) => {
              const participant = livekitParticipants[identity];
              const isLocal = identity === auth.currentUser?.uid;
              return (
                <div key={identity} className="participant-container">
                  <div className="video-wrapper">
                    {state.videoEnabled && state.trackSid ? (
                      <>
                        <video
                          ref={(el) => {
                            if (el && state.trackSid) {
                              videoRefs.current[state.trackSid] = el;
                              if (state.stream) {
                                el.srcObject = state.stream;
                                el.play().catch((e) =>
                                  console.error(`Video play failed for ${identity}:`, e)
                                );
                              }
                            }
                          }}
                          autoPlay
                          muted={isLocal}
                          className="rounded"
                        />
                        <button
                          onClick={() => handlePinVideo(identity)}
                          className="absolute top-2 right-2 bg-gray-800 text-white p-1 rounded"
                        >
                          {pinnedVideo === identity ? "Unpin" : "Pin"}
                        </button>
                      </>
                    ) : (
                      <div className="video-off-placeholder">
                        {participant?.identity || "Unknown"} (Video Off)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {rightSidebarTab === "chat" && (
          <div className="chat-container">
            <div className="chat-messages" ref={chatMessagesRef}>
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.senderId === auth.currentUser?.uid ? "sent" : "received"}`}
                >
                  <div className="message-content">
                    <span className="sender">{msg.senderName}</span>
                    <p>{msg.text}</p>
                    <span className="timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {!isAtBottom && newMessageCount > 0 && (
              <div className="new-messages-indicator">
                <button className="new-messages-button" onClick={scrollToBottom}>
                  {newMessageCount} New Message{newMessageCount > 1 ? "s" : ""}
                </button>
              </div>
            )}
            <div className="chat-input-container">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;