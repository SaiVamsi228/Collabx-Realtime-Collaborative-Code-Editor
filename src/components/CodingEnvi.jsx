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

// Styles remain unchanged
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
    background-color: #333;
    border-radius: 4px;
  }
  
  .video-wrapper video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }

  .video-off-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #333;
    border-radius: 4px;
    color: #fff;
    font-size: 14px;
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
    .active-status {
    position: relative;
  }
  .active-status::before {
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
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

const getLiveKitToken = async (roomName, participantName) => {
  const response = await fetch(
    `${
      import.meta.env.VITE_LIVEKIT_TOKEN_URL
    }/get-token?roomName=${encodeURIComponent(
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
  const [videoTrackSid, setVideoTrackSid] = useState(null);
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
  const [participantStates, setParticipantStates] = useState({});
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  // New state for WebSocket status
  const [websocketStatus, setWebsocketStatus] = useState("disconnected");

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
    const unsubscribe = onSnapshot(
      doc(db, "sessions", sessionId),
      (doc) => {
        if (doc.exists()) {
          setParticipants(doc.data().participants || []);
        }
      },
      (error) => {
        console.error("Firestore session listener error:", error);
        setError("Failed to load session data. Please try again.");
      }
    );
    return () => unsubscribe();
  }, [sessionId]);

  useEffect(() => {
    if (!auth.currentUser || !sessionId) return;
    const messagesRef = collection(db, "sessions", sessionId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
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
      },
      (error) => {
        console.error("Firestore messages listener error:", error);
        setError("Failed to load chat messages. Please try again.");
      }
    );
    return () => unsubscribe();
  }, [sessionId, isAtBottom]);

  const initializeExistingTracks = (room) => {
    if (!room || !room.localParticipant) {
      console.error(
        "Cannot initialize tracks: Room or local participant not available"
      );
      return;
    }

    const newStates = { ...participantStates };

    newStates[room.localParticipant.identity] = {
      identity: room.localParticipant.identity,
      videoEnabled: false,
      audioEnabled: false,
      stream: null,
      trackSid: null,
      audioTrackSid: null,
    };

    if (room.localParticipant.tracks) {
      room.localParticipant.tracks.forEach((publication) => {
        if (publication.track) {
          if (publication.kind === "video") {
            newStates[room.localParticipant.identity] = {
              ...newStates[room.localParticipant.identity],
              videoEnabled: true,
              stream: publication.track.mediaStream,
              trackSid: publication.trackSid,
            };
            if (videoRefs.current[publication.trackSid]) {
              videoRefs.current[publication.trackSid].srcObject =
                publication.track.mediaStream;
              videoRefs.current[publication.trackSid]
                .play()
                .catch((e) => console.error("Local video play failed:", e));
            }
          } else if (publication.kind === "audio") {
            newStates[room.localParticipant.identity] = {
              ...newStates[room.localParticipant.identity],
              audioEnabled: true,
              audioTrackSid: publication.trackSid,
            };
          }
        }
      });
    }

    if (room.participants) {
      room.participants.forEach((participant) => {
        newStates[participant.identity] = {
          identity: participant.identity,
          videoEnabled: false,
          audioEnabled: false,
          stream: null,
          trackSid: null,
          audioTrackSid: null,
        };

        if (participant.tracks) {
          participant.tracks.forEach((publication) => {
            if (publication.track && publication.isSubscribed) {
              if (publication.kind === "video") {
                newStates[participant.identity] = {
                  ...newStates[participant.identity],
                  videoEnabled: true,
                  stream: publication.track.mediaStream,
                  trackSid: publication.trackSid,
                };
                if (videoRefs.current[publication.trackSid]) {
                  videoRefs.current[publication.trackSid].srcObject =
                    publication.track.mediaStream;
                  videoRefs.current[publication.trackSid]
                    .play()
                    .catch((e) =>
                      console.error("Remote video play failed:", e)
                    );
                }
              } else if (publication.kind === "audio") {
                newStates[participant.identity] = {
                  ...newStates[participant.identity],
                  audioEnabled: true,
                  audioTrackSid: publication.trackSid,
                };
                publication.track.attach();
              }
            }
          });
        }
      });
    }

    setParticipantStates(newStates);
  };

  const joinRoom = async (retryCount = 0, maxRetries = 3) => {
    if (!auth.currentUser || !sessionId) {
      console.error("Cannot join room: Missing auth or sessionId");
      return;
    }

    try {
      setConnectionStatus("connecting");
      console.log(
        `Attempting to join room, attempt ${retryCount + 1}/${maxRetries}`
      );

      const token = await getLiveKitToken(sessionId, auth.currentUser.uid);
      const room = new LivekitClient.Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: LivekitClient.VideoPresets.h720.resolution,
        },
      });

      await room.connect(`${import.meta.env.VITE_LIVEKIT_URL}`, token, {
        autoSubscribe: true,
      });
      console.log("Successfully connected to room");

      try {
        await room.localParticipant.setMetadata(
          JSON.stringify({
            displayName:
              auth.currentUser.displayName ||
              "User" + Math.floor(Math.random() * 1000),
          })
        );
        console.log("Participant metadata set");
      } catch (metadataError) {
        console.warn("Failed to set metadata:", metadataError.message);
      }

      setRoom(room);
      setConnectionStatus("connected");

      initializeExistingTracks(room);

      try {
        await room.localParticipant.setMicrophoneEnabled(false);
        await room.localParticipant.setCameraEnabled(false);
      } catch (error) {
        console.warn("Failed to disable mic/camera:", error.message);
      }
    } catch (error) {
      console.error("Failed to join room:", error);
      setConnectionStatus("disconnected");

      if (
        retryCount < maxRetries &&
        error.message.includes("could not establish pc connection")
      ) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        setTimeout(() => joinRoom(retryCount + 1, maxRetries), delay);
      } else {
        console.error("Max retries reached or non-retryable error");
        setError("Failed to connect to video chat. Please try again later.");
      }
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
    setParticipantStates({});
    Object.keys(videoRefs.current).forEach((sid) => {
      if (videoRefs.current[sid]) {
        videoRefs.current[sid].srcObject = null;
      }
    });
    videoRefs.current = {};
    setPinnedVideo(null);
    setVideoTrackSid(null);

    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (yDocRef.current) {
      yDocRef.current.destroy();
      yDocRef.current = null;
    }
    editTimeouts.current.clear();
  };

  useEffect(() => {
    if (!room) return;

    const handleParticipantConnected = (participant) => {
      setParticipantStates((prev) => ({
        ...prev,
        [participant.identity]: {
          identity: participant.identity,
          videoEnabled: false,
          audioEnabled: false,
          stream: null,
          trackSid: null,
          audioTrackSid: null,
        },
      }));

      if (participant.tracks) {
        participant.tracks.forEach((publication) => {
          if (publication.track && publication.isSubscribed) {
            if (publication.kind === "video") {
              setParticipantStates((prev) => ({
                ...prev,
                [participant.identity]: {
                  ...prev[participant.identity],
                  videoEnabled: true,
                  stream: publication.track.mediaStream,
                  trackSid: publication.trackSid,
                },
              }));
              if (videoRefs.current[publication.trackSid]) {
                videoRefs.current[publication.trackSid].srcObject =
                  publication.track.mediaStream;
                videoRefs.current[publication.trackSid]
                  .play()
                  .catch((e) => console.error("Video play failed:", e));
              }
            } else if (publication.kind === "audio") {
              setParticipantStates((prev) => ({
                ...prev,
                [participant.identity]: {
                  ...prev[participant.identity],
                  audioEnabled: true,
                  audioTrackSid: publication.trackSid,
                },
              }));
              publication.track.attach();
            }
          }
        });
      }
    };

    const handleParticipantDisconnected = (participant) => {
      setParticipantStates((prev) => {
        const newStates = { ...prev };
        delete newStates[participant.identity];
        return newStates;
      });
      if (pinnedVideo === participant.identity) setPinnedVideo(null);
    };

    const handleTrackSubscribed = (track, publication, participant) => {
      if (track.kind === "video") {
        setParticipantStates((prev) => ({
          ...prev,
          [participant.identity]: {
            ...prev[participant.identity],
            videoEnabled: true,
            stream: track.mediaStream,
            trackSid: track.sid,
          },
        }));
        if (videoRefs.current[track.sid]) {
          videoRefs.current[track.sid].srcObject = track.mediaStream;
          videoRefs.current[track.sid]
            .play()
            .catch((e) => console.error("Video play failed:", e));
        }
      } else if (
        track.kind === "audio" &&
        participant.identity !== auth.currentUser?.uid
      ) {
        setParticipantStates((prev) => ({
          ...prev,
          [participant.identity]: {
            ...prev[participant.identity],
            audioEnabled: true,
            audioTrackSid: track.sid,
          },
        }));
        track.attach();
      }
    };

    const handleTrackUnsubscribed = (track, publication, participant) => {
      if (track.kind === "video") {
        setParticipantStates((prev) => ({
          ...prev,
          [participant.identity]: {
            ...prev[participant.identity],
            videoEnabled: false,
            stream: null,
            trackSid: null,
          },
        }));
        if (videoRefs.current[track.sid]) {
          videoRefs.current[track.sid].srcObject = null;
        }
      } else if (track.kind === "audio") {
        setParticipantStates((prev) => ({
          ...prev,
          [participant.identity]: {
            ...prev[participant.identity],
            audioEnabled: false,
            audioTrackSid: null,
          },
        }));
        track.detach();
      }
    };

    const handleLocalTrackPublished = (publication) => {
      if (publication.track.kind === "video") {
        setParticipantStates((prev) => ({
          ...prev,
          [room.localParticipant.identity]: {
            ...prev[room.localParticipant.identity],
            videoEnabled: true,
            stream: publication.track.mediaStream,
            trackSid: publication.trackSid,
          },
        }));
        if (videoRefs.current[publication.trackSid]) {
          videoRefs.current[publication.trackSid].srcObject =
            publication.track.mediaStream;
          videoRefs.current[publication.trackSid]
            .play()
            .catch((e) => console.error("Video play failed:", e));
        }
      } else if (publication.track.kind === "audio") {
        setParticipantStates((prev) => ({
          ...prev,
          [room.localParticipant.identity]: {
            ...prev[room.localParticipant.identity],
            audioEnabled: true,
            audioTrackSid: publication.trackSid,
          },
        }));
      }
    };

    const handleLocalTrackUnpublished = (publication) => {
      if (publication.track.kind === "video") {
        setParticipantStates((prev) => ({
          ...prev,
          [room.localParticipant.identity]: {
            ...prev[room.localParticipant.identity],
            videoEnabled: false,
            stream: null,
            trackSid: null,
          },
        }));
        if (videoRefs.current[publication.trackSid]) {
          videoRefs.current[publication.trackSid].srcObject = null;
        }
        setVideoTrackSid(null);
      } else if (publication.track.kind === "audio") {
        setParticipantStates((prev) => ({
          ...prev,
          [room.localParticipant.identity]: {
            ...prev[room.localParticipant.identity],
            audioEnabled: false,
            audioTrackSid: null,
          },
        }));
        publication.track.detach();
      }
    };

    const handleDisconnected = () => {
      console.log("Room disconnected, attempting to reconnect...");
      setConnectionStatus("disconnected");
      cleanupSession();
      joinRoom();
    };

    room.on("participantConnected", handleParticipantConnected);
    room.on("participantDisconnected", handleParticipantDisconnected);
    room.on("trackSubscribed", handleTrackSubscribed);
    room.on("trackUnsubscribed", handleTrackUnsubscribed);
    room.on("localTrackPublished", handleLocalTrackPublished);
    room.on("localTrackUnpublished", handleLocalTrackUnpublished);
    room.on("disconnected", handleDisconnected);

    return () => {
      room.off("participantConnected", handleParticipantConnected);
      room.off("participantDisconnected", handleParticipantDisconnected);
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

  const initializeYjs = (language) => {
    if (!editorRef.current || !monacoRef.current) {
      console.warn("Cannot initialize Yjs: Editor or Monaco not ready");
      return;
    }

    if (bindingRef.current) {
      bindingRef.current.destroy();
      console.log("Destroyed existing MonacoBinding");
    }
    if (providerRef.current) {
      providerRef.current.destroy();
      console.log("Destroyed existing WebsocketProvider");
    }
    if (yDocRef.current) {
      yDocRef.current.destroy();
      console.log("Destroyed existing Y.Doc");
    }

    const fullSessionId = `${sessionId}-${language}`;
    const encodedSessionId = encodeURIComponent(fullSessionId);
    const wsUrl = `${
      import.meta.env.VITE_WEBSOCKET_URL
    }/?sessionId=${encodedSessionId}`;

    console.log(
      `Initializing Yjs for session: ${fullSessionId}, URL: ${wsUrl}`
    );
    setWebsocketStatus("connecting");

    const yDoc = new Y.Doc();
    yDocRef.current = yDoc;

    providerRef.current = new WebsocketProvider(wsUrl, fullSessionId, yDoc, {
      resyncInterval: 2000,
    });

    // WebSocket connection status logging
    providerRef.current.on("connect", () => {
      console.log(`WebSocket connected for session: ${fullSessionId}`);
      setWebsocketStatus("connected");
    });

    providerRef.current.on("status", ({ status }) => {
      console.log(`WebSocket status: ${status} for session: ${fullSessionId}`);
      setWebsocketStatus(status);
    });

    providerRef.current.on("synced", ({ synced }) => {
      console.log(`Yjs synced: ${synced} for session: ${fullSessionId}`);
      if (synced) {
        setWebsocketStatus("connected");
      }
    });

    providerRef.current.on("disconnect", () => {
      console.warn(`WebSocket disconnected for session: ${fullSessionId}`);
      setWebsocketStatus("disconnected");
    });

    providerRef.current.on("error", (error) => {
      console.error(`WebSocket error for session: ${fullSessionId}`, error);
      setWebsocketStatus("error");
      setError(`WebSocket connection failed: ${error.message}`);
    });

    const yText = yDoc.getText("monaco");
    bindingRef.current = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      providerRef.current.awareness
    );

    yText.observe((event) => {
      const transaction = event.transaction;
      let editingClientId = transaction.local
        ? providerRef.current.awareness.clientID
        : Array.from(transaction.afterState || []).find(
            ([clientId, clock]) =>
              !transaction.beforeState.has(clientId) ||
              transaction.beforeState.get(clientId) < clock
          )?.[0];

      if (editingClientId) {
        setActiveEditors((prev) => {
          const newSet = new Set(prev);
          newSet.add(editingClientId);
          return newSet;
        });
        if (editTimeouts.current.has(editingClientId)) {
          clearTimeout(editTimeouts.current.get(editingClientId));
        }
        const timeoutId = setTimeout(() => {
          setActiveEditors((prev) => {
            const newSet = new Set(prev);
            newSet.delete(editingClientId);
            return newSet;
          });
          editTimeouts.current.delete(editingClientId);
        }, 250);
        editTimeouts.current.set(editingClientId, timeoutId);
      }
    });

    const editor = editorRef.current;
    const awareness = providerRef.current.awareness;
    const localColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    const localName =
      auth.currentUser?.displayName ||
      "User" + Math.floor(Math.random() * 1000);
    awareness.setLocalStateField("user", {
      name: localName,
      color: localColor,
      id: auth.currentUser?.uid,
    });

    const updateCursorPosition = (position) => {
      awareness.setLocalStateField("cursor", {
        line: position.lineNumber,
        column: position.column,
      });
    };

    editor.onDidChangeCursorPosition((e) => updateCursorPosition(e.position));
    editor.onDidChangeCursorSelection((e) =>
      updateCursorPosition(e.selection.getPosition())
    );

    console.log(`Yjs initialized for session: ${fullSessionId}`);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.editor.defineTheme("night-owl", NightOwl);
    setMonacoTheme(theme === "dark" ? "night-owl" : "vs-light");
    setIsEditorReady(true);
  };

  useEffect(() => {
    if (isEditorReady && editorRef.current && monacoRef.current) {
      initializeYjs(selectedLanguage);

      const translatedCode = location.state?.translatedCode;
      const newLanguage = location.state?.targetLanguage;

      if (newLanguage && newLanguage !== selectedLanguage) {
        setPreviousLanguage(selectedLanguage);
        setSelectedLanguage(newLanguage);
        monacoRef.current.editor.setModelLanguage(
          editorRef.current.getModel(),
          newLanguage
        );
        initializeYjs(newLanguage);
        if (translatedCode === "" && editorRef.current) {
          editorRef.current.setValue("");
        }
      }

      if (
        translatedCode !== undefined &&
        translatedCode !== "" &&
        editorRef.current &&
        editorRef.current.getValue() !== translatedCode
      ) {
        editorRef.current.setValue(translatedCode);
        editorRef.current.getAction("editor.action.formatDocument").run();
      }
    }

    return () => {
      if (bindingRef.current) bindingRef.current.destroy();
      if (providerRef.current) providerRef.current.destroy();
      if (yDocRef.current) yDocRef.current.destroy();
      editTimeouts.current.clear();
    };
  }, [isEditorReady, selectedLanguage, sessionId]);

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(
        theme === "dark" ? "night-owl" : "vs-light"
      );
    }
    setMonacoTheme(theme === "dark" ? "night-owl" : "vs-light");
  }, [theme]);

  const handleRunCode = async (stdin = "") => {
    try {
      setIsLoading(true);
      setError(null);
      setCodeOutput(null);
      setFetchTime(null);
      setComplexity(null);

      if (!editorRef.current || !editorRef.current.getValue().trim()) {
        throw new Error("No code to execute!");
      }

      const startTime = performance.now();
      const result = await executeCode(
        editorRef.current.getValue(),
        selectedLanguage,
        stdin
      );
      const endTime = performance.now();

      result.isError =
        result.status !== "Accepted" &&
        (!result.exitCode || result.exitCode !== 0);
      setCodeOutput(result);
      setFetchTime((endTime - startTime).toFixed(2));
      setComplexity("O(n)");
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim() || !auth.currentUser) return;

    try {
      const messagesRef = collection(db, "sessions", sessionId, "messages");
      await addDoc(messagesRef, {
        text: message,
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || "Anonymous",
        timestamp: new Date().toISOString(),
      });
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = Math.max(
        0,
        Math.min(e.clientX - dragOffset.x, window.innerWidth - 240)
      );
      const newY = Math.max(
        0,
        Math.min(e.clientY - dragOffset.y, window.innerHeight - 180)
      );
      setPinnedVideoPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleResizeMove = (e) => {
    if (isResizing) {
      const newHeight = window.innerHeight - e.clientY;
      setNotesHeight(
        Math.max(100, Math.min(newHeight, window.innerHeight - 200))
      );
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  const handleChatScroll = () => {
    if (chatMessagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
      const isAtBottom =
        Math.abs(scrollHeight - scrollTop - clientHeight) <= 10;
      setIsAtBottom(isAtBottom);
      if (isAtBottom) {
        setNewMessageCount(0);
      }
    }
  };

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = 0;
      setNewMessageCount(0);
    }
  };

  const toggleVideo = async () => {
    if (!room || !room.localParticipant || room.state !== "connected") {
      console.error(
        "Cannot toggle video: Room not connected or participant unavailable"
      );
      setVideoEnabled(false);
      setVideoTrackSid(null);
      return;
    }

    try {
      if (!videoEnabled) {
        console.log("Enabling video...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
        });
        const videoTrack = stream.getVideoTracks()[0];
        if (!videoTrack) {
          throw new Error("No video track available");
        }

        const publication = await room.localParticipant.publishTrack(
          videoTrack,
          {
            source: LivekitClient.Track.Source.Camera,
          }
        );
        console.log("Video track published:", publication.trackSid);

        setVideoEnabled(true);
        setVideoTrackSid(publication.trackSid);

        const currentSid = publication.trackSid;
        if (videoRefs.current[currentSid]) {
          videoRefs.current[currentSid].srcObject = stream;
          videoRefs.current[currentSid]
            .play()
            .catch((e) => console.error("Video play failed:", e));
        }
      } else {
        console.log("Disabling video...");
        console.log(
          "Current tracks:",
          Array.from(room.localParticipant.tracks?.entries() || [])
        );
        console.log("Stored videoTrackSid:", videoTrackSid);

        let videoPublication = null;
        if (videoTrackSid && room.localParticipant.tracks) {
          videoPublication = room.localParticipant.tracks.get(videoTrackSid);
        }
        if (!videoPublication && room.localParticipant.tracks) {
          videoPublication = Array.from(
            room.localParticipant.tracks.values()
          ).find((pub) => pub.kind === "video");
        }

        if (videoPublication && videoPublication.track) {
          const track = videoPublication.track;
          const trackSid = videoPublication.trackSid;

          console.log("Found video track to unpublish:", trackSid);
          await room.localParticipant.unpublishTrack(track);
          console.log("Video track unpublished:", trackSid);

          track.stop();
          const stream = track.mediaStream;
          if (stream) {
            stream.getTracks().forEach((t) => t.stop());
          }

          if (videoRefs.current[trackSid]) {
            videoRefs.current[trackSid].srcObject = null;
            delete videoRefs.current[trackSid];
          }

          setVideoEnabled(false);
          setVideoTrackSid(null);
        } else {
          console.warn(
            "No video track found to unpublish, stopping all video tracks..."
          );
          try {
            const stream = videoRefs.current[videoTrackSid]?.srcObject;
            if (stream) {
              stream.getTracks().forEach((t) => t.stop());
            }
            if (videoTrackSid && videoRefs.current[videoTrackSid]) {
              videoRefs.current[videoTrackSid].srcObject = null;
              delete videoRefs.current[videoTrackSid];
            }
          } catch (err) {
            console.error("Error stopping video tracks:", err);
          }
          setVideoEnabled(false);
          setVideoTrackSid(null);
        }
      }
    } catch (error) {
      console.error("Error toggling video:", error);
      setVideoEnabled(false);
      setVideoTrackSid(null);
      if (videoTrackSid && videoRefs.current[videoTrackSid]) {
        videoRefs.current[videoTrackSid].srcObject
          ?.getTracks()
          .forEach((t) => t.stop());
        videoRefs.current[videoTrackSid].srcObject = null;
        delete videoRefs.current[videoTrackSid];
      }
    }
  };

  const toggleMic = async () => {
    if (!room || !room.localParticipant || room.state !== "connected") {
      console.error(
        "Cannot toggle mic: Room not connected or participant unavailable"
      );
      setMicEnabled(false);
      return;
    }

    try {
      if (!micEnabled) {
        console.log("Enabling mic...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const audioTrack = stream.getAudioTracks()[0];
        await room.localParticipant.publishTrack(audioTrack);
        setMicEnabled(true);
      } else {
        console.log("Disabling mic...");
        const audioPublication = room.localParticipant.tracks
          ? Array.from(room.localParticipant.tracks.values()).find(
              (pub) => pub.kind === "audio"
            )
          : null;
        if (audioPublication && audioPublication.track) {
          await room.localParticipant.unpublishTrack(audioPublication.track);
          audioPublication.track.stop();
          setMicEnabled(false);
        } else {
          console.warn("No audio track found to unpublish");
          setMicEnabled(false);
        }
      }
    } catch (error) {
      console.error("Error toggling mic:", error);
      setMicEnabled(false);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeEnd);
    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [isResizing]);

  useEffect(() => {
    if (chatMessagesRef.current && chatMessages.length > 0) {
      scrollToBottom();
    }
  }, []);

  if (isAuthenticated === undefined) {
    return <div>Loading...</div>;
  }

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
        websocketStatus={websocketStatus} // Add this prop
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
          participantStates={participantStates}
          livekitParticipants={livekitParticipants}
          pinnedVideo={pinnedVideo}
          setPinnedVideo={setPinnedVideo}
          auth={auth}
          chatMessages={chatMessages}
          handleSendMessage={handleSendMessage}
          newMessageCount={newMessageCount}
          isAtBottom={isAtBottom}
          scrollToBottom={scrollToBottom}
          videoRefs={videoRefs}
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
        participantState={participantStates[pinnedVideo]}
        livekitParticipants={livekitParticipants}
        auth={auth}
        pinnedVideoPosition={pinnedVideoPosition}
        setPinnedVideoPosition={setPinnedVideoPosition}
        setPinnedVideo={setPinnedVideo}
        videoRefs={videoRefs}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        dragOffset={dragOffset}
        setDragOffset={setDragOffset}
      />
    </div>
  );
};

export default function CodingEnviWithTheme() {
  return (
    <ThemeProvider defaultTheme="light">
      <CodingEnvi />
    </ThemeProvider>
  );
}
