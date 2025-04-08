import { useState, useRef, useEffect, useMemo } from "react";
import {
  Users,
  Play,
  Share,
  Settings,
  GitBranch,
  Clock,
  Cpu,
  Languages,
  Video,
  VideoOff,
  MicOff,
  Mic,
  LogOut,
  MessageSquare,
  X,
  Maximize2,
  PinIcon,
  FileInputIcon,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { ThemeProvider, useTheme } from "./theme-provider";
import "../styles/CodingEnvi.css";
import { executeCode } from "../api/judge0Service";
import Editor from "@monaco-editor/react";
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

// Updated CSS styles
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
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .video-grid.grid-1 .video-wrapper {
    width: 100%;
  }

  .video-grid.grid-2 .video-wrapper {
    width: calc(50% - 4px);
  }

  .video-wrapper {
    position: relative;
    flex-grow: 1;
  }

  .video-wrapper video {
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
  }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

const OutputPanel = ({
  result,
  isLoading,
  error,
  theme,
  fetchTime,
  complexity,
}) => {
  return (
    <ScrollArea
      className={`h-[200px] p-4 ${
        theme === "dark" ? "text-white" : "text-black"
      }`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
          <p className="text-sm">Compiling and running code...</p>
        </div>
      ) : error ? (
        <div>
          <h3 className="text-sm font-semibold text-red-500">
            Compilation Failed
          </h3>
          <pre className="mt-2 text-xs whitespace-pre-wrap">
            {error.message || "Something went wrong."}
          </pre>
        </div>
      ) : result ? (
        <div>
          <p
            className={`text-sm ${
              result.isError ? "text-red-500" : "text-green-500"
            }`}
          >
            <strong>Status:</strong>{" "}
            {result.isError ? "Compilation Failed" : "Compiled Successfully"}
          </p>
          <pre className="mt-2 text-xs whitespace-pre-wrap">
            {result.output || "No output generated."}
          </pre>
          {fetchTime && (
            <p className="text-xs mt-2">
              <strong>Fetch Time:</strong> {fetchTime} ms
            </p>
          )}
          {complexity && (
            <p className="text-xs mt-1">
              <strong>Complexity:</strong> {complexity}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm">Run your code to see the output here.</p>
      )}
    </ScrollArea>
  );
};

const getLiveKitToken = async (roomName, participantName) => {
  const response = await fetch(
    `https://livekit-token-server-production.up.railway.app/get-token?roomName=${encodeURIComponent(
      roomName
    )}&participantName=${encodeURIComponent(participantName)}`
  );
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Token request failed: ${response.status} - ${errorText}`);
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
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
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
  const [showRunWithInput, setShowRunWithInput] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState(14);
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
  const [layout, setLayout] = useState("grid-1");

  const pinnedVideoRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const yDocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const editTimeouts = useRef(new Map());
  const chatScrollRef = useRef(null);
  const videoRefs = useRef({}); // Store video element refs

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

  // Authentication Check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      if (!user) {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Firebase Participants Listener
  useEffect(() => {
    if (!auth.currentUser || !sessionId) return;
    const unsubscribe = onSnapshot(doc(db, "sessions", sessionId), (doc) => {
      if (doc.exists()) {
        setParticipants(doc.data().participants || []);
      }
    });
    return () => unsubscribe();
  }, [sessionId]);

  // Firebase Chat Listener
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
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 100);
    });
    return () => unsubscribe();
  }, [sessionId]);

  // LiveKit Room Setup
  useEffect(() => {
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
        await room.connect(
          "wss://video-chat-application-7u5wc7ae.livekit.cloud",
          token
        );
        setRoom(room);
        setConnectionStatus("connected");
        await room.localParticipant.enableCameraAndMicrophone();
        setMicEnabled(true);
        setVideoEnabled(true);
      } catch (error) {
        console.error("Failed to join room:", error);
        setConnectionStatus("disconnected");
      }
    };
    joinRoom();
    return () => {
      if (room) room.disconnect();
    };
  }, [sessionId]);

  // LiveKit Track Event Listeners
  useEffect(() => {
    if (!room) return;

    const handleTrackSubscribed = (track, publication, participant) => {
      if (track.kind === "video") {
        console.log(`Track subscribed: ${track.sid} from ${participant.identity}`);
        setVideoStreams((prev) => {
          const newStreams = { ...prev, [track.sid]: track.mediaStream };
          if (videoRefs.current[track.sid]) {
            videoRefs.current[track.sid].srcObject = track.mediaStream;
          }
          return newStreams;
        });
      }
    };

    const handleTrackUnsubscribed = (track) => {
      if (track.kind === "video") {
        console.log(`Track unsubscribed: ${track.sid}`);
        setVideoStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[track.sid];
          if (pinnedVideo === track.sid) setPinnedVideo(null);
          return newStreams;
        });
      }
    };

    const handleLocalTrackPublished = (publication) => {
      if (publication.track.kind === "video") {
        console.log(`Local track published: ${publication.trackSid}`);
        setVideoStreams((prev) => {
          const newStreams = { ...prev, [publication.trackSid]: publication.track.mediaStream };
          if (videoRefs.current[publication.trackSid]) {
            videoRefs.current[publication.trackSid].srcObject = publication.track.mediaStream;
          }
          return newStreams;
        });
      }
    };

    const handleLocalTrackUnpublished = (publication) => {
      if (publication.track.kind === "video") {
        console.log(`Local track unpublished: ${publication.trackSid}`);
        setVideoStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[publication.trackSid];
          if (pinnedVideo === publication.trackSid) setPinnedVideo(null);
          return newStreams;
        });
      }
    };

    room.on("trackSubscribed", handleTrackSubscribed);
    room.on("trackUnsubscribed", handleTrackUnsubscribed);
    room.on("localTrackPublished", handleLocalTrackPublished);
    room.on("localTrackUnpublished", handleLocalTrackUnpublished);

    return () => {
      room.off("trackSubscribed", handleTrackSubscribed);
      room.off("trackUnsubscribed", handleTrackUnsubscribed);
      room.off("localTrackPublished", handleLocalTrackPublished);
      room.off("localTrackUnpublished", handleLocalTrackUnpublished);
    };
  }, [room, pinnedVideo]);

  // Map LiveKit Participants with Safeguards
  const livekitParticipants = useMemo(() => {
    if (!room || !room.participants) return {};
    const participants = {};
    if (room.localParticipant) {
      participants[room.localParticipant.identity] = room.localParticipant;
    }
    if (room.participants instanceof Map) {
      room.participants.forEach((p) => {
        participants[p.identity] = p;
      });
    }
    return participants;
  }, [room]);

  // Yjs Initialization (unchanged from previous version)
  const initializeYjs = (language) => {
    if (!editorRef.current || !monacoRef.current) {
      console.log("Cannot initialize Yjs: missing editor or Monaco instance");
      return;
    }

    console.log("Initializing Yjs for language:", language);
    if (bindingRef.current) bindingRef.current.destroy();
    if (providerRef.current) providerRef.current.destroy();
    if (yDocRef.current) yDocRef.current.destroy();

    const fullSessionId = `${sessionId}-${language}`;
    const encodedSessionId = encodeURIComponent(fullSessionId);
    const wsUrl = `wss://web-socket-server-production-bbc3.up.railway.app/?sessionId=${encodedSessionId}`;
    console.log(`Connecting to WebSocket: ${wsUrl}`);

    const yDoc = new Y.Doc();
    yDocRef.current = yDoc;

    providerRef.current = new WebsocketProvider(wsUrl, fullSessionId, yDoc, {
      resyncInterval: 2000,
    });

    providerRef.current.on("status", (event) => {
      console.log(`WebSocket ${fullSessionId} status: ${event.status}`);
    });

    providerRef.current.on("connection-error", (err) => {
      console.error(`WebSocket ${fullSessionId} error:`, err);
    });

    providerRef.current.on("connection-close", (event) => {
      console.log(`WebSocket ${fullSessionId} closed:`, event);
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
        console.log("Edit from client:", editingClientId);
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

    console.log(`Initialized Yjs for session: ${fullSessionId}`);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
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
    setMonacoTheme(theme === "dark" ? "vs-dark" : "light");
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
      setComplexity("O(n)"); // Placeholder; replace with actual logic if available
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !auth.currentUser) return;

    try {
      const messagesRef = collection(db, "sessions", sessionId, "messages");
      await addDoc(messagesRef, {
        text: newMessage,
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || "Anonymous",
        timestamp: new Date().toISOString(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

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

  const handleMouseMove = (e) => {
    if (isDragging && pinnedVideoRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
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

  useEffect(() => {
    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeEnd);
    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [isResizing]);

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
      {/* Top Bar */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-xl bg-transparent text-black ${
              theme === "light"
                ? "hover:bg-gray-100 text-black"
                : "hover:bg-gray-800 text-white"
            }`}
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          >
            <Users className={`w-5 h-5 bg-transparent`} />
          </Button>
          <div className="w-[215px] h-[50px] flex items-center justify-center bg-transparent">
            <span>CollabX - Session: {sessionId}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent
              className={theme === "dark" ? "bg-gray-800" : "bg-white"}
            >
              {languages.map((lang) => (
                <SelectItem
                  key={lang}
                  value={lang}
                  className={`cursor-pointer text-white ${
                    theme === "dark"
                      ? "hover:bg-gray-600"
                      : "hover:bg-gray-200 text-black"
                  }`}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  className={`rounded-lg bg-green-700 hover:bg-green-600 text-white`}
                  onClick={() => handleRunCode()}
                  disabled={isLoading}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Run
                </Button>
              </TooltipTrigger>
              <TooltipContent>Run code (Ctrl+Enter)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={`rounded-lg bg-transparent ${
                    theme === "light"
                      ? "hover:bg-gray-100 text-black"
                      : "hover:bg-gray-800 text-white"
                  } border border-gray-20`}
                  onClick={() => setShowRunWithInput(!showRunWithInput)}
                >
                  <FileInputIcon className="h-4 w-4 mr-2" />
                  Run with Input
                </Button>
              </TooltipTrigger>
              <TooltipContent>Run with custom input</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={`rounded-lg bg-transparent ${
                    theme === "light"
                      ? "hover:bg-gray-100 text-black"
                      : "hover:bg-gray-800 text-white"
                  } border border-gray-11`}
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Toggle {theme === "dark" ? "Light" : "Dark"} Mode
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={`rounded-lg bg-transparent ${
                    theme === "light"
                      ? "hover:bg-gray-100 text-black"
                      : "hover:bg-gray-800 text-white"
                  } border border-gray-11`}
                  onClick={() =>
                    setVersionControlExpanded(!versionControlExpanded)
                  }
                >
                  <GitBranch className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View version control</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={`rounded-lg bg-transparent ${
                    theme === "light"
                      ? "hover:bg-gray-100 text-black"
                      : "hover:bg-gray-800 text-white"
                  } border border-gray-11`}
                  onClick={() => setSettingsExpanded(!settingsExpanded)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Adjust settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={`rounded-lg bg-transparent ${
                    theme === "light"
                      ? "hover:bg-gray-100 text-black"
                      : "hover:bg-gray-800 text-white"
                  } border border-gray-11`}
                >
                  <Share className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share this session</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            className={`rounded-lg bg-transparent ${
              theme === "light"
                ? "hover:bg-gray-100 text-black"
                : "hover:bg-gray-800 text-white"
            }`}
            size="icon"
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          >
            {rightSidebarTab === "video" ? (
              <Video className="h-5 w-5" />
            ) : (
              <MessageSquare className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
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
                        <AvatarImage
                          src={participant.avatar}
                          alt={displayName}
                        />
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
                          {micOn ? (
                            <Mic className="h-4 w-4 text-green-500" />
                          ) : (
                            <MicOff className="h-4 w-4 text-red-500" />
                          )}
                          {videoOn ? (
                            <Video className="h-4 w-4 text-green-500" />
                          ) : (
                            <VideoOff className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    )}
ledged
                  </div>
                );
              })}
            </ScrollArea>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!settingsExpanded && !versionControlExpanded && (
            <div
              className="flex-1 overflow-auto"
              style={{
                height: `calc(100% - ${
                  notesHeight + (showRunWithInput ? 100 : 0)
                }px)`,
              }}
            >
              <Editor
                height="100%"
                language={selectedLanguage}
                theme={monacoTheme}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: fontSize,
                  tabSize: tabSize,
                  wordWrap: "on",
                  automaticLayout: true,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: true,
                  mouseWheelZoom: true,
                  bracketPairColorization: { enabled: true },
                  acceptSuggestionOnEnter: "on",
                  lineNumbers: "on",
                  renderWhitespace: "all",
                  detectIndentation: false,
                }}
              />
            </div>
          )}

          {showRunWithInput && !settingsExpanded && !versionControlExpanded && (
            <div className="border-t h-[100px] p-4 flex items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Input</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRunWithInput(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  className="w-full h-[60px] font-mono resize-none"
                  placeholder="Enter input for your code..."
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                />
              </div>
              <Button
                className="bg-green-700 hover:bg-green-600 text-white h-10"
                onClick={() => handleRunCode(codeInput)}
                disabled={isLoading}
              >
                Run with Input
              </Button>
            </div>
          )}

          {settingsExpanded && (
            <div className="flex-1 p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Settings</h2>
                <Button
                  variant="ghost"
                  className={`rounded-xl bg-transparent border border-gray-600 ${
                    theme === "light"
                      ? "hover:bg-gray-100 text-black"
                      : "hover:bg-gray-800 text-white"
                  }`}
                  size="sm"
                  onClick={() => setSettingsExpanded(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Editor Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Theme</label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent
                          className={
                            theme === "dark" ? "bg-gray-800" : "bg-white"
                          }
                        >
                          <SelectItem
                            value="light"
                            className={`cursor-pointer text-white ${
                              theme === "dark"
                                ? "hover:bg-gray-600"
                                : "hover:bg-gray-200 text-black"
                            }`}
                          >
                            Light
                          </SelectItem>
                          <SelectItem
                            value="dark"
                            className={`cursor-pointer text-white ${
                              theme === "dark"
                                ? "hover:bg-gray-600"
                                : "hover:bg-gray-200 text-black"
                            }`}
                          >
                            Dark
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Font Size</label>
                      <Select
                        value={fontSize.toString()}
                        onValueChange={(value) => setFontSize(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select font size" />
                        </SelectTrigger>
                        <SelectContent
                          className={
                            theme === "dark" ? "bg-gray-800" : "bg-white"
                          }
                        >
                          <SelectItem
                            value="12"
                            className={`cursor-pointer text-white ${
                              theme === "dark"
                                ? "hover:bg-gray-600"
                                : "hover:bg-gray-200 text-black"
                            }`}
                          >
                            12px
                          </SelectItem>
                          <SelectItem
                            value="14"
                            className={`cursor-pointer text-white ${
                              theme === "dark"
                                ? "hover:bg-gray-600"
                                : "hover:bg-gray-200 text-black"
                            }`}
                          >
                            14px
                          </SelectItem>
                          <SelectItem
                            value="16"
                            className={`cursor-pointer text-white ${
                              theme === "dark"
                                ? "hover:bg-gray-600"
                                : "hover:bg-gray-200 text-black"
                            }`}
                          >
                            16px
                          </SelectItem>
                          <SelectItem
                            value="18"
                            className={`cursor-pointer text-white ${
                              theme === "dark"
                                ? "hover:bg-gray-600"
                                : "hover:bg-gray-200 text-black"
                            }`}
                          >
                            18px
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tab Size</label>
                      <Select
                        value={tabSize.toString()}
                        onValueChange={(value) => setTabSize(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tab size" />
                        </SelectTrigger>
                        <SelectContent
                          className={
                            theme === "dark" ? "bg-gray-800" : "bg-white"
                          }
                        >
                          <SelectItem
                            value="2"
                            className={`cursor-pointer text-white ${
                              theme === "dark"
                                ? "hover:bg-gray-600"
                                : "hover:bg-gray-200 text-black"
                            }`}
                          >
                            2 spaces
                          </SelectItem>
                          <SelectItem
                            value="4"
                            className={`cursor-pointer text-white ${
                              theme === "dark"
                                ? "hover:bg-gray-600"
                                : "hover:bg-gray-200 text-black"
                            }`}
                          >
                            4 spaces
                          </SelectItem>
                          <SelectItem
                            value="8"
                            className={`cursor-pointer text-white ${
                              theme === "dark"
                                ? "hover:bg-gray-600"
                                : "hover:bg-gray-200 text-black"
                            }`}
                          >
                            8 spaces
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {versionControlExpanded && (
            <div className="flex-1 p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Version Control</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-xl bg-transparent border border-gray-600 ${
                    theme === "light"
                      ? "hover:bg-gray-100 text-black"
                      : "hover:bg-gray-800 text-white"
                  }`}
                  onClick={() => setVersionControlExpanded(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Current Branch</h3>
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    <span className="font-medium">main</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border border-gray-400"
                    >
                      Switch Branch
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!settingsExpanded && !versionControlExpanded && (
            <div
              className="border-t relative"
              style={{ height: `${notesHeight}px` }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 bg-gray-500 cursor-ns-resize hover:bg-gray-700 transition-colors"
                onMouseDown={handleResizeStart}
              />
              <div className="flex items-center justify-between p-2 border-b">
                <div className="flex items-center gap-2">
                  <Tabs defaultValue="output">
                    <TabsList>
                      <TabsTrigger className="rounded-lg" value="notes">
                        Notes
                      </TabsTrigger>
                      <TabsTrigger className="rounded-lg" value="output">
                        Output
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="notes" className="m-0">
                      <ScrollArea className="p-4 h-[calc(100%-45px)] overflow-auto font-mono text-sm">
                        <Textarea
                          className="w-full h-full resize-none"
                          placeholder="Add your notes here..."
                        />
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="output" className="m-0">
                      <OutputPanel
                        result={codeOutput}
                        isLoading={isLoading}
                        error={error}
                        theme={theme}
                        fetchTime={fetchTime}
                        complexity={complexity}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
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
              className="flex-1 overflow-auto p-0 m-0 right-sidebar-content"
            >
              <div className="p-2 border-b">
                <Select value={layout} onValueChange={setLayout}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid-1">1 per row</SelectItem>
                    <SelectItem value="grid-2">2 per row</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-2 flex-1 overflow-auto">
                <div className={`video-grid ${layout}`}>
                  {Object.entries(videoStreams).map(([sid, stream]) => (
                    <div key={sid} className="video-wrapper">
                      <video
                        ref={(el) => {
                          if (el) {
                            videoRefs.current[sid] = el;
                            el.srcObject = stream;
                          }
                        }}
                        autoPlay
                        playsInline
                        muted={sid.includes(auth.currentUser?.uid)}
                      />
                      <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
                        {sid.includes(auth.currentUser?.uid)
                          ? "You"
                          : participants.find((p) =>
                              sid.includes(p.uid)
                            )?.username || "Unknown"}
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
              </div>
            </TabsContent>

            <TabsContent
              value="chat"
              className="flex-1 overflow-hidden p-0 m-0 flex flex-col"
            >
              <ScrollArea className="flex-1 p-2" ref={chatScrollRef}>
                {chatMessages.map((message) => {
                  const sender = participants.find(
                    (p) => p.uid === message.senderId
                  );
                  const isCurrentUser =
                    message.senderId === auth.currentUser?.uid;
                  return (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 mb-2 ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isCurrentUser && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={sender?.avatar} />
                          <AvatarFallback>
                            {message.senderName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] p-2 rounded-lg ${
                          isCurrentUser
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-black"
                        }`}
                      >
                        {!isCurrentUser && (
                          <span className="text-xs font-semibold block">
                            {message.senderName}
                          </span>
                        )}
                        <p className="text-sm">{message.text}</p>
                        <span className="text-xs opacity-70">
                          {(() => {
                            const date = new Date(message.timestamp);
                            let hours = date.getHours();
                            const minutes = date.getMinutes();
                            const ampm = hours >= 12 ? "PM" : "AM";
                            hours = hours % 12 || 12;
                            const paddedMinutes = minutes
                              .toString()
                              .padStart(2, "0");
                            return `${hours}:${paddedMinutes} ${ampm}`;
                          })()}
                        </span>
                      </div>
                      {isCurrentUser && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={auth.currentUser?.photoURL} />
                          <AvatarFallback>
                            {auth.currentUser?.displayName
                              ?.charAt(0)
                              .toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
              </ScrollArea>
              <div className="p-2 border-t">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-center p-2 border-t">
        <div className="flex items-center gap-4">
          <Button
            variant={micEnabled ? "default" : "outline"}
            className={`rounded-full border border-gray-400 hover:bg-${
              micEnabled ? "gray-100" : "gray-800"
            } bg-${micEnabled ? "white" : "black"}`}
            size="icon"
            onClick={async () => {
              if (room && room.localParticipant) {
                try {
                  await room.localParticipant.setMicrophoneEnabled(!micEnabled);
                  setMicEnabled(!micEnabled);
                  console.log(`Mic toggled to: ${!micEnabled}`);
                } catch (error) {
                  console.error("Error toggling mic:", error);
                }
              }
            }}
          >
            {micEnabled ? (
              <Mic
                className={`h-7 w-7 text-${
                  micEnabled ? "black" : "white"
                } bg-transparent`}
              />
            ) : (
              <MicOff
                className={`h-7 w-7 bg-transparent text-${
                  micEnabled ? "black" : "white"
                }`}
              />
            )}
          </Button>

          <Button
            variant={videoEnabled ? "default" : "outline"}
            size="icon"
            className={`rounded-full border border-gray-400 hover:bg-${
              videoEnabled ? "gray-100" : "gray-800"
            } bg-${videoEnabled ? "white" : "black"}`}
            onClick={async () => {
              if (room && room.localParticipant) {
                try {
                  await room.localParticipant.setCameraEnabled(!videoEnabled);
                  setVideoEnabled(!videoEnabled);
                  console.log(`Video toggled to: ${!videoEnabled}`);
                } catch (error) {
                  console.error("Error toggling video:", error);
                }
              }
            }}
          >
            {videoEnabled ? (
              <Video
                className={`h-7 w-7 text-${
                  videoEnabled ? "black" : "white"
                } bg-transparent`}
              />
            ) : (
              <VideoOff
                className={`h-7 w-7 text-${
                  videoEnabled ? "black" : "white"
                } bg-transparent`}
              />
            )}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="rounded-lg bg-red-700 text-white hover:bg-red-600"
            onClick={() => {
              if (room) {
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

      {/* Pinned Video */}
      {pinnedVideo && videoStreams[pinnedVideo] && (
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
              : participants.find((p) => pinnedVideo.includes(p.uid))
                  ?.username || "Unknown"}
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
      )}
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