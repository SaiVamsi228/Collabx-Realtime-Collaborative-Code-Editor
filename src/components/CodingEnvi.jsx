import { useState, useRef, useEffect } from "react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
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
import { doc, onSnapshot } from "firebase/firestore";

const OutputPanel = ({ result, isLoading, error, theme }) => {
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
        </div>
      ) : (
        <p className="text-sm">Run your code to see the output here.</p>
      )}
    </ScrollArea>
  );
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
  const [code, setCode] = useState(
    "// Write your code here\nconsole.log('Hello, world!');\n"
  );
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
  const [codeOutput, setCodeOutput] = useState(null);
  const [error, setError] = useState(null);
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(2);
  const [monacoTheme, setMonacoTheme] = useState("vs-dark");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [activeCollapsible, setActiveCollapsible] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [participants, setParticipants] = useState([]);
  const [activeEditors, setActiveEditors] = useState(new Set());

  const pinnedVideoRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const yDocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const fetchCardRef = useRef(null);
  const complexityCardRef = useRef(null);
  const editTimeouts = useRef(new Map());

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
    if (!auth.currentUser) return;
    const unsubscribe = onSnapshot(doc(db, "sessions", sessionId), (doc) => {
      if (doc.exists()) {
        setParticipants(doc.data().participants || []);
      }
    });
    return () => unsubscribe();
  }, [sessionId]);

  // WebSocket and Yjs Initialization (from old code)
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
    // Include sessionId directly in the URL, matching old code
    const wsUrl = `wss://web-socket-server-production-bbc3.up.railway.app/?sessionId=${encodedSessionId}`;
    console.log(`Attempting to connect to WebSocket: ${wsUrl}`);
  
    const yDoc = new Y.Doc();
    yDocRef.current = yDoc;
  
    // Pass the full URL and use fullSessionId as room name, no params needed
    providerRef.current = new WebsocketProvider(wsUrl, fullSessionId, yDoc, {
      resyncInterval: 2000,
    });
  
    providerRef.current.on("status", (event) => {
      console.log(`WebSocket ${fullSessionId} status: ${event.status}`);
    });
  
    providerRef.current.on("connection-error", (err) => {
      console.error(`WebSocket ${fullSessionId} error:`, err);
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
        : Array.from(transaction.afterState).find(
            ([clientId, clock]) =>
              !transaction.beforeState.has(clientId) ||
              transaction.beforeState.get(clientId) < clock
          )?.[0];
  
      if (editingClientId) {
        console.log("Edit from client:", editingClientId);
        setActiveEditors((prev) => new Set(prev).add(editingClientId));
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
      auth.currentUser?.displayName || "User" + Math.floor(Math.random() * 1000);
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
    initializeYjs(selectedLanguage);
  };

  useEffect(() => {
    setMonacoTheme(theme === "dark" ? "vs-dark" : "light");
  }, [theme]);

  useEffect(() => {
    if (isEditorReady) {
      const translatedCode = location.state?.translatedCode;
      const newLanguage = location.state?.targetLanguage;

      if (newLanguage && newLanguage !== selectedLanguage) {
        setPreviousLanguage(selectedLanguage);
        setSelectedLanguage(newLanguage);
        monacoRef.current.editor.setModelLanguage(
          editorRef.current.getModel(),
          newLanguage
        );
        initializeYjs(newLanguage); // Re-initialize Yjs for new language
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
  }, [isEditorReady, selectedLanguage, sessionId, location.state]);

  const handleRunCode = async (stdin = "") => {
    try {
      setIsLoading(true);
      setError(null);
      setCodeOutput(null);

      if (!editorRef.current || !editorRef.current.getValue().trim()) {
        throw new Error("No code to execute!");
      }

      const result = await executeCode(
        editorRef.current.getValue(),
        selectedLanguage,
        stdin
      );
      result.isError =
        result.status !== "Accepted" &&
        (!result.exitCode || result.exitCode !== 0);
      setCodeOutput(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalMouseMove = (e) => {
      if (isDragging && pinnedVideoRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        setPinnedVideoPosition({ x: newX, y: newY });
      }
    };
    const handleGlobalClick = (e) => {
      if (
        activeCollapsible &&
        fetchCardRef.current &&
        complexityCardRef.current &&
        !fetchCardRef.current.contains(e.target) &&
        !complexityCardRef.current.contains(e.target) &&
        !e.target.closest("button")
      ) {
        setActiveCollapsible(null);
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("click", handleGlobalClick);
    };
  }, [isDragging, dragOffset, activeCollapsible]);

  const toggleCollapsible = (type) => {
    setActiveCollapsible(activeCollapsible === type ? null : type);
  };

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
            {/* Placeholder for SVG */}
            <div className="svg-placeholder">Logo SVG Placeholder</div>
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

          <div className="relative">
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
                    onClick={() => toggleCollapsible("translate")}
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    Translate
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Translate code</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Collapsible open={activeCollapsible === "translate"}>
              <CollapsibleContent className="absolute top-10 left-0 z-10">
                <Card
                  className={`${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-black"
                  } border`}
                >
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Code Translation</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <Select defaultValue="python">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Translate To" />
                      </SelectTrigger>
                      <SelectContent
                        className={
                          theme === "dark" ? "bg-gray-800" : "bg-white"
                        }
                      >
                        <SelectItem
                          value="python"
                          className={`cursor-pointer text-white ${
                            theme === "dark"
                              ? "hover:bg-gray-600"
                              : "hover:bg-gray-200 text-black"
                          }`}
                        >
                          Python
                        </SelectItem>
                        <SelectItem
                          value="java"
                          className={`cursor-pointer text-white ${
                            theme === "dark"
                              ? "hover:bg-gray-600"
                              : "hover:bg-gray-200 text-black"
                          }`}
                        >
                          Java
                        </SelectItem>
                        <SelectItem
                          value="csharp"
                          className={`cursor-pointer text-white ${
                            theme === "dark"
                              ? "hover:bg-gray-600"
                              : "hover:bg-gray-200 text-black"
                          }`}
                        >
                          C#
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>

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
            <div className="flex-1 overflow-auto p-2">
              {participants.map((participant) => {
                console.log(providerRef.current?.awareness.getStates());
                const state = Array.from(
                  providerRef.current?.awareness.getStates() || []
                ).find(([_, s]) => s.user?.id === participant.id);
                const clientId = state ? state[0] : null;
                const isActive = activeEditors.has(clientId);
                if (clientId && !isActive) {
                  activeEditors.add(clientId);
                }
                const userColor = state ? state[1].user.color : "#888888";
                const displayName = participant.username || "Anonymous";
                return (
                  <div
                    key={participant.id}
                    className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted ${
                      !leftSidebarOpen && "justify-center"
                    } ${isActive ? "bg-muted/50" : ""}`}
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
                      {leftSidebarOpen && (
                        <div className="absolute -bottom-1 -right-1 flex gap-1">
                          {participant.micOn && (
                            <Badge
                              variant="secondary"
                              className="h-5 w-5 p-0 flex items-center justify-center"
                            >
                              <Mic className="h-3 w-3" />
                            </Badge>
                          )}
                          {participant.videoOn && (
                            <Badge
                              variant="secondary"
                              className="h-5 w-5 p-0 flex items-center justify-center"
                            >
                              <Video className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    {leftSidebarOpen && (
                      <span className="text-sm">{displayName}</span>
                    )}
                  </div>
                );
              })}
            </div>
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
                value={code}
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
                          <SelectItem
                            value="system"
                            className={`cursor-pointer text-white ${
                              theme === "dark"
                                ? "hover:bg-gray-600"
                                : "hover:bg-gray-200 text-black"
                            }`}
                          >
                            System
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

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Collaboration Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Auto-save</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`rounded-lg bg-transparent ${
                          theme === "light"
                            ? "hover:bg-gray-100 text-black"
                            : "hover:bg-gray-800 text-white"
                        } border border-gray-11`}
                      >
                        Enabled
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Show cursor names
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`rounded-lg bg-transparent ${
                          theme === "light"
                            ? "hover:bg-gray-100 text-black"
                            : "hover:bg-gray-800 text-white"
                        } border border-gray-11`}
                      >
                        Enabled
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Notifications</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`rounded-lg bg-transparent ${
                          theme === "light"
                            ? "hover:bg-gray-100 text-black"
                            : "hover:bg-gray-800 text-white"
                        } border border-gray-11`}
                      >
                        Enabled
                      </Button>
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

                <div>
                  <h3 className="text-lg font-medium mb-2">Changes</h3>
                  <div className="space-y-2">
                    <div className="p-2 border rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">app.js</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        2 additions, 1 deletion
                      </p>
                    </div>

                    <div className="p-2 border rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">styles.css</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        5 additions, 0 deletions
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Commit History</h3>
                  <div className="space-y-2">
                    <div className="p-2 border rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Fix authentication bug
                        </span>
                        <span className="text-sm text-muted-foreground">
                          2 hours ago
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        John Doe
                      </p>
                    </div>

                    <div className="p-2 border rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Add user profile page
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Yesterday
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Jane Smith
                      </p>
                    </div>
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
                          placeholder="Add your notes here... (Persisted in real-time via Yjs)"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Notes and code are autosaved in real-time using Yjs.
                        </p>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="output" className="m-0">
                      <OutputPanel
                        result={codeOutput}
                        isLoading={isLoading}
                        error={error}
                        theme={theme}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex items-center gap-2 z-10">
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`rounded-lg bg-transparent ${
                        theme === "light"
                          ? "hover:bg-gray-100 text-black"
                          : "hover:bg-gray-800 text-white"
                      } border border-gray-11`}
                      onClick={() => toggleCollapsible("fetch")}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Fetch Time
                    </Button>
                    <Collapsible open={activeCollapsible === "fetch"}>
                      <CollapsibleContent className="absolute top-10 right-0 z-10">
                        <Card
                          ref={fetchCardRef}
                          className={`w-72 ${
                            theme === "dark"
                              ? "bg-gray-800 text-white"
                              : "bg-white text-black"
                          } border`}
                        >
                          <CardHeader className="py-2">
                            <CardTitle className="text-sm">
                              Performance Metrics
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span>Fetch Time:</span>
                                <span>
                                  {codeOutput?.executionTime
                                    ? `${codeOutput.executionTime}s`
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Memory:</span>
                                <span>
                                  {codeOutput?.memory
                                    ? `${codeOutput.memory} KB`
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`rounded-lg bg-transparent ${
                        theme === "light"
                          ? "hover:bg-gray-100 text-black"
                          : "hover:bg-gray-800 text-white"
                      } border border-gray-11`}
                      onClick={() => toggleCollapsible("complexity")}
                    >
                      <Cpu className="h-4 w-4 mr-2" />
                      Complexity
                    </Button>
                    <Collapsible open={activeCollapsible === "complexity"}>
                      <CollapsibleContent className="absolute top-10 right-0 z-10">
                        <Card
                          ref={complexityCardRef}
                          className={`w-72 ${
                            theme === "dark"
                              ? "bg-gray-800 text-white"
                              : "bg-white text-black"
                          } border`}
                        >
                          <CardHeader className="py-2">
                            <CardTitle className="text-sm">
                              Complexity Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span>Time Complexity:</span>
                                <span>O(n)</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Space Complexity:</span>
                                <span>O(1)</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
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
              className="flex-1 overflow-hidden p-0 m-0"
            >
              <ScrollArea className="h-full p-2">
                {participants
                  .filter((p) => p.videoOn || p.isActive)
                  .map((participant) => (
                    <div
                      key={participant.id}
                      className="relative rounded-md bg-muted w-full mb-2"
                    >
                      <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
                        {participant.name}
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 bg-background/80 hover:bg-background"
                          onClick={() => {
                            if (pinnedVideo === participant.id) {
                              setPinnedVideo(null);
                            } else {
                              setPinnedVideo(participant.id);
                            }
                          }}
                        >
                          <PinIcon
                            className={`h-3 w-3 ${
                              theme === "light" ? "text-black" : "text-white"
                            }`}
                          />
                        </Button>
                      </div>
                      <div className="w-full aspect-video flex items-center justify-center">
                        {participant.videoOn ? (
                          <img
                            src={participant.avatar || "/placeholder.svg"}
                            alt={participant.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {participant.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="chat"
              className="flex-1 overflow-hidden p-0 m-0 flex flex-col"
            >
              <ScrollArea className="flex-1 p-2">
                {/* Chat messages placeholder */}
              </ScrollArea>

              <div className="p-2 border-t mb-12">
                <div className="flex gap-2">
                  <Input placeholder="Type a message..." className="flex-1" />
                  <Button
                    size="sm"
                    className="rounded-lg bg-black text-white hover:bg-gray-900"
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
            onClick={() => setMicEnabled(!micEnabled)}
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
            onClick={() => setVideoEnabled(!videoEnabled)}
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
          >
            <LogOut className="h-4 w-4 mr-2" />
            Leave Session
          </Button>
        </div>
      </div>

      {/* Pinned Video */}
      {pinnedVideo !== null && (
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
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 bg-background/80 hover:bg-background"
              onClick={() => setPinnedVideo(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {participants
            .filter((p) => p.id === pinnedVideo)
            .map((participant) => (
              <div
                key={participant.id}
                className="h-full flex items-center justify-center"
              >
                {participant.videoOn ? (
                  <img
                    src={participant.avatar || "/placeholder.svg"}
                    alt={participant.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback>
                        {participant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="mt-2 text-sm font-medium">
                      {participant.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
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