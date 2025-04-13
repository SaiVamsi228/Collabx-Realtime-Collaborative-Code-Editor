  import { useState, useRef, useEffect, useMemo } from "react";
  import NightOwl from "monaco-themes/themes/Night Owl.json";
  import LeftSidebar from "./LeftSidebar";
  import TopBar from "./TopBar";
  import PinnedVideo from "./PinnedVideo";
  import EditorArea from "./EditorArea";
  import RightSidebar from "./RightSidebar";
  import BottomBar from "./BottomBar";
  import { ThemeProvider, useTheme } from "./theme-provider";
  import "../styles/CodingEnvi.css";
  import { executeCode } from "../api/judge0Service";
  import * as Y from "yjs";
  import { WebsocketProvider } from "y-websocket";
  import { MonacoBinding } from "y-monaco";
  import { useParams, useNavigate, useLocation } from "react-router-dom";
  import { auth, db } from "../firebase";
  import {
    doc,
    onSnapshot,
    collection,
    addDoc,
    query,
    orderBy,
  } from "firebase/firestore";
  import * as LivekitClient from "livekit-client";

  const styles = `
    .participant-container {
      position: relative;
      padding: 8px;
      border-radius: 6px;
      transition: background-color 0.3s ease;
    }

    .participant-container.active::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 8px;
      padding: 2px;
      background: linear-gradient(45deg, #00ff00, #00cc00, #009900, #00ff00);
      background-size: 200% 200%;
      animation: rotateGradient 2s linear infinite;
      z-index: -1;
    }

    @keyframes rotateGradient {
      0% { background-position: 0% 0%; }
      50% { background-position: 100% 100%; }
      100% { background-position: 0% 0%; }
    }

    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 8px;
      width: 100%;
    }
    
    .video-wrapper {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      width: 100%;
    }
    
    .video-wrapper video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
      background-color: #333;
    }

    .right-sidebar-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

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
      flex-direction: column-reverse; /* Reverse for bottom-to-top stacking */
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
  `;

  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);


  const getLiveKitToken = async (roomName, participantName) => {
    const response = await fetch(
      `https://livekit-token-server-production.up.railway.app/get-token?roomName=${encodeURIComponent(
        roomName
      )}&participantName=${encodeURIComponent(participantName)}`
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get token: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    if (!data.success || !data.token) {
      throw new Error("Invalid token response");
    }
    return data.token;
  };

  // ... (previous imports remain the same)

const CodingEnvi = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialLanguage = location.state?.targetLanguage || "javascript";
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [notesHeight, setNotesHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [versionControlExpanded, setVersionControlExpanded] = useState(false);
  const [rightSidebarTab, setRightSidebarTab] = useState("video");
  const [micEnabled, setMicEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [previousLanguage, setPreviousLanguage] = useState(initialLanguage);
  const [codeOutput, setCodeOutput] = useState(null);
  const [pinnedVideo, setPinnedVideo] = useState(null);
  const [pinnedVideoPosition, setPinnedVideoPosition] = useState({
    x: 20,
    y: 20,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const videoRefs = useRef({});
  const [showRunWithInput, setShowRunWithInput] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState(18);
  const [tabSize, setTabSize] = useState(2);
  const [monacoTheme, setMonacoTheme] = useState("vs-dark");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [participants, setParticipants] = useState([]);
  const [activeEditors, setActiveEditors] = useState(new Set());
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [fetchTime, setFetchTime] = useState(null);
  const [complexity, setComplexity] = useState(null);
  const [room, setRoom] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [videoStreams, setVideoStreams] = useState({});
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const yDocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const editTimeouts = useRef(new Map());
  const chatContainerRef = useRef(null);
  const chatMessagesRef = useRef(null);

  const languages = [
    "javascript",
    "typescript",
    "python",
    "java",
    "cpp",
    "csharp",
    "php",
    "swift",
    "kotlin",
    "dart",
    "go",
    "ruby",
    "scala",
    "rust",
    "erlang",
    "elixir",
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      if (!user) {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!auth.currentUser || !sessionId) return;
    const unsubscribe = onSnapshot(doc(db, "sessions", sessionId), (doc) => {
      if (doc.exists()) {
        setParticipants(doc.data().participants || []);
      }
    });
    return () => unsubscribe();
  }, [sessionId]);

  useEffect(() => {
    if (!auth.currentUser || !sessionId) return;
    const messagesRef = collection(db, "sessions", sessionId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChatMessages(messages);

      if (chatMessagesRef.current && isAtBottom) {
        setTimeout(() => {
          chatMessagesRef.current.scrollTop = 0;
        }, 0);
      } else {
        setNewMessageCount((prev) => prev + snapshot.docChanges().length);
      }
    });
    return () => unsubscribe();
  }, [sessionId, isAtBottom]);

  const joinRoom = async () => {
    if (!auth.currentUser || !sessionId) return;
    try {
      setConnectionStatus("connecting");
      const token = await getLiveKitToken(sessionId, auth.currentUser.uid);
      const room = new LivekitClient.Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: LivekitClient.VideoPresets.h720.resolution,
        },
      });

      // Set participant metadata with display name
      await room.connect(
        "wss://video-chat-application-7u5wc7ae.livekit.cloud",
        token
      );

      room.localParticipant.setMetadata(
        JSON.stringify({
          displayName: auth.currentUser.displayName || "User" + Math.floor(Math.random() * 1000),
        })
      );

      setRoom(room);
      setConnectionStatus("connected");

      // Initialize tracks
      await room.localParticipant.setMicrophoneEnabled(false);
      await room.localParticipant.setCameraEnabled(false);
    } catch (error) {
      console.error("Failed to join room:", error);
      setConnectionStatus("disconnected");
      // Attempt reconnection after a delay
      setTimeout(joinRoom, 5000);
    }
  };

  useEffect(() => {
    joinRoom();

    return () => {
      if (room) {
        cleanupSession();
        room.disconnect();
      }
    };
  }, [sessionId]);

  const cleanupSession = () => {
    setVideoStreams({});
    Object.keys(videoRefs.current).forEach((sid) => {
      if (videoRefs.current[sid]) {
        videoRefs.current[sid].srcObject = null;
      }
    });
    videoRefs.current = {};
    setPinnedVideo(null);

    if (bindingRef.current) bindingRef.current.destroy();
    if (providerRef.current) providerRef.current.destroy();
    if (yDocRef.current) yDocRef.current.destroy();
  };

  useEffect(() => {
    if (!room) return;

    const handleTrackSubscribed = (track, publication, participant) => {
      if (track.kind === "video") {
        const stream = track.mediaStream;
        setVideoStreams((prev) => ({
          ...prev,
          [track.sid]: { stream, participantIdentity: participant.identity },
        }));
        if (videoRefs.current[track.sid]) {
          videoRefs.current[track.sid].srcObject = stream;
        }
      }
      if (track.kind === "audio") {
        track.attach();
      }
    };

    const handleTrackUnsubscribed = (track) => {
      if (track.kind === "video") {
        setVideoStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[track.sid];
          if (pinnedVideo === track.sid) setPinnedVideo(null);
          return newStreams;
        });
        if (videoRefs.current[track.sid]) {
          videoRefs.current[track.sid].srcObject = null;
        }
      }
      if (track.kind === "audio") {
        track.detach();
      }
    };

    const handleLocalTrackPublished = (publication) => {
      if (publication.track.kind === "video") {
        setVideoStreams((prev) => ({
          ...prev,
          [publication.trackSid]: {
            stream: publication.track.mediaStream,
            participantIdentity: room.localParticipant.identity,
          },
        }));
        if (videoRefs.current[publication.trackSid]) {
          videoRefs.current[publication.trackSid].srcObject =
            publication.track.mediaStream;
        }
      }
      if (publication.track.kind === "audio") {
        publication.track.attach();
      }
    };

    const handleLocalTrackUnpublished = (publication) => {
      if (publication.track.kind === "video") {
        setVideoStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[publication.trackSid];
          if (pinnedVideo === publication.trackSid) setPinnedVideo(null);
          return newStreams;
        });
        if (videoRefs.current[publication.trackSid]) {
          videoRefs.current[publication.trackSid].srcObject = null;
        }
      }
      if (publication.track.kind === "audio") {
        publication.track.detach();
      }
    };

    const handleDisconnected = () => {
      setConnectionStatus("disconnected");
      cleanupSession();
      joinRoom(); // Attempt to reconnect
    };

    room.on("trackSubscribed", handleTrackSubscribed);
    room.on("trackUnsubscribed", handleTrackUnsubscribed);
    room.on("localTrackPublished", handleLocalTrackPublished);
    room.on("localTrackUnpublished", handleLocalTrackUnpublished);
    room.on("disconnected", handleDisconnected);

    return () => {
      room.off("trackSubscribed", handleTrackSubscribed);
      room.off("trackUnsubscribed", handleTrackUnsubscribed);
      room.off("localTrackPublished", handleLocalTrackPublished);
      room.off("localTrackUnpublished", handleLocalTrackUnpublished);
      room.off("disconnected", handleDisconnected);
    };
  }, [room, pinnedVideo]);

  const livekitParticipants = useMemo(() => {
    if (!room || !room.participants) return {};
    const participants = {};
    if (room.localParticipant) {
      participants[room.localParticipant.identity] = room.localParticipant;
    }
    room.participants.forEach((p) => {
      participants[p.identity] = p;
    });
    return participants;
  }, [room]);

  const toggleVideo = async () => {
    if (room && room.localParticipant) {
      try {
        if (!videoEnabled) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          const videoTrack = stream.getVideoTracks()[0];
          await room.localParticipant.publishTrack(videoTrack);
          setVideoEnabled(true);
        } else {
          const videoTrack = Array.from(room.localParticipant.videoTracks.values()).find(
            (pub) => pub.source === LivekitClient.Track.Source.Camera
          );
          if (videoTrack) {
            await room.localParticipant.unpublishTrack(videoTrack.track);
            videoTrack.track.stop();
          }
          setVideoEnabled(false);
        }
      } catch (error) {
        console.error("Error toggling video:", error);
        setVideoEnabled(false);
      }
    }
  };

  const toggleMic = async () => {
    if (room && room.localParticipant) {
      try {
        if (!micEnabled) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const audioTrack = stream.getAudioTracks()[0];
          await room.localParticipant.publishTrack(audioTrack);
          setMicEnabled(true);
        } else {
          const audioTrack = Array.from(room.localParticipant.audioTracks.values()).find(
            (pub) => pub.source === LivekitClient.Track.Source.Microphone
          );
          if (audioTrack) {
            await room.localParticipant.unpublishTrack(audioTrack.track);
            audioTrack.track.stop();
          }
          setMicEnabled(false);
        }
      } catch (error) {
        console.error("Error toggling mic:", error);
        setMicEnabled(false);
      }
    }
  };

  // ... (rest of the component remains unchanged, including other useEffects and render)

  return (
    <div
      className={`flex flex-col h-screen coding-envi ${
        theme === "dark" ? "dark" : ""
      }`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <TopBar
        theme={theme}
        leftSidebarOpen={leftSidebarOpen}
        setLeftSidebarOpen={setLeftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        setRightSidebarOpen={setRightSidebarOpen}
        rightSidebarTab={rightSidebarTab}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        handleRunCode={() => handleRunCode()}
        isLoading={isLoading}
        showRunWithInput={showRunWithInput}
        setShowRunWithInput={setShowRunWithInput}
        toggleTheme={toggleTheme}
        setVersionControlExpanded={setVersionControlExpanded}
        versionControlExpanded={versionControlExpanded}
        setSettingsExpanded={setSettingsExpanded}
        settingsExpanded={settingsExpanded}
        sessionId={sessionId}
        languages={languages}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          theme={theme}
          leftSidebarOpen={leftSidebarOpen}
          participants={participants}
          activeEditors={activeEditors}
          livekitParticipants={livekitParticipants}
          providerRef={providerRef}
        />

        <EditorArea
          selectedLanguage={selectedLanguage}
          theme={theme}
          monacoTheme={monacoTheme}
          fontSize={fontSize}
          tabSize={tabSize}
          showRunWithInput={showRunWithInput}
          setShowRunWithInput={setShowRunWithInput}
          codeInput={codeInput}
          setCodeInput={setCodeInput}
          notesHeight={notesHeight}
          setNotesHeight={setNotesHeight}
          isResizing={isResizing}
          setIsResizing={setIsResizing}
          settingsExpanded={settingsExpanded}
          setSettingsExpanded={setSettingsExpanded}
          versionControlExpanded={versionControlExpanded}
          setVersionControlExpanded={setVersionControlExpanded}
          codeOutput={codeOutput}
          isLoading={isLoading}
          error={error}
          fetchTime={fetchTime}
          complexity={complexity}
          handleRunCode={handleRunCode}
          handleEditorDidMount={handleEditorDidMount}
        />

        <RightSidebar
          theme={theme}
          rightSidebarOpen={rightSidebarOpen}
          rightSidebarTab={rightSidebarTab}
          setRightSidebarTab={setRightSidebarTab}
          videoStreams={videoStreams}
          participants={participants}
          pinnedVideo={pinnedVideo}
          setPinnedVideo={setPinnedVideo}
          auth={auth}
          chatMessages={chatMessages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          newMessageCount={newMessageCount}
          isAtBottom={isAtBottom}
          scrollToBottom={scrollToBottom}
          livekitParticipants={livekitParticipants}
        />
      </div>

      <BottomBar
        theme={theme}
        micEnabled={micEnabled}
        toggleMic={toggleMic}
        videoEnabled={videoEnabled}
        toggleVideo={toggleVideo}
        room={room}
        cleanupSession={cleanupSession}
        navigate={navigate}
      />

      <PinnedVideo
        pinnedVideo={pinnedVideo}
        videoStreams={videoStreams}
        participants={participants}
        auth={auth}
        pinnedVideoPosition={pinnedVideoPosition}
        setPinnedVideoPosition={setPinnedVideoPosition}
        setPinnedVideo={setPinnedVideo}
        videoRefs={videoRefs}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        dragOffset={dragOffset}
        setDragOffset={setDragOffset}
        livekitParticipants={livekitParticipants}
      />
    </div>
  );
};


  export default function CodingEnviWrapper() {
    return (
      <ThemeProvider defaultTheme="light">
        <CodingEnvi />
      </ThemeProvider>
    );
  }
