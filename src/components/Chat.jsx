// src/components/Chat.jsx
import { useRef } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";

const Chat = ({
  chatMessages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  auth,
  theme,
  chatContainerRef,
  chatMessagesRef,
  newMessageCount,
  isAtBottom,
  scrollToBottom,
  handleChatScroll,
}) => {
  return (
    <>
      <style>
        {`
          .chat-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            position: relative;
          }
          .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
            display: flex;
            flex-direction: column-reverse;
            gap: 10px;
          }
          .new-messages-indicator {
            position: sticky;
            bottom: 60px;
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 4px;
            pointer-events: none;
            z-index: 10;
          }
          .new-messages-button {
            pointer-events: all;
            background: #3182ce;
            color: white;
            padding: 4px 12px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            cursor: pointer;
          }
          .message {
            display: flex;
            align-items: flex-end;
          }
          .message.sent {
            justify-content: flex-end;
          }
          .message.received {
            justify-content: flex-start;
          }
          .message-content {
            max-width: 70%;
            padding: 8px 12px;
            border-radius: 10px;
            background-color: #fff;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
          .message.sent .message-content {
            background-color: #dcf8c6;
          }
          .message.received .message-content {
            background-color: #ffffff;
          }
          .sender {
            font-size: 12px;
            font-weight: bold;
            color: #333;
            display: block;
          }
          .message-content p {
            margin: 4px 0;
            word-wrap: break-word;
          }
          .timestamp {
            font-size: 10px;
            color: #888;
            display: block;
            text-align: right;
          }
          .chat-input-container {
            position: sticky;
            bottom: 0;
            padding: 10px;
            background: inherit;
            border-top: 1px solid #e5e7eb;
          }
        `}
      </style>
      <div className="chat-container" ref={chatContainerRef}>
        <ScrollArea
          className="chat-messages"
          ref={chatMessagesRef}
          onScroll={handleChatScroll}
        >
          {chatMessages.map((message, index) => {
            const isCurrentUser = message.senderId === auth.currentUser?.uid;
            return (
              <div
                key={message.id}
                className={`message ${isCurrentUser ? "sent" : "received"}`}
                data-message-index={index}
              >
                <div className="message-content">
                  {!isCurrentUser && (
                    <span className="sender">{message.senderName}</span>
                  )}
                  <p>{message.text}</p>
                  <span className="timestamp">
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
          <div className="new-messages-indicator">
            <div className="new-messages-button" onClick={scrollToBottom}>
              <ChevronDown className="h-4 w-4" />
              {newMessageCount} new message{newMessageCount > 1 ? "s" : ""}
            </div>
          </div>
        )}
        <div className="chat-input-container">
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
    </>
  );
};

export default Chat;
