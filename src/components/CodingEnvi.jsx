import { useState, useRef, useEffect } from "react";
import {
  Code,
  Play,
  Share2,
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
import { executeCode } from "../api/judge0Service"; // Assuming this exists

const OutputPanel = ({ result, isLoading, error, theme }) => {
  if (isLoading) {
    return (
      <div className={`p-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
          <p>Compiling and running code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
        <h3 className="text-lg font-semibold text-red-500">Compilation Failed</h3>
        <pre className="mt-2 text-sm">
          {error.message || "Something went wrong while running your code."}
        </pre>
        <div className="mt-4">
          <h4 className="text-sm font-medium">Quick things to look at:</h4>
          <ul className="list-disc pl-5 text-sm mt-1">
            <li>Did you forget a semicolon (;) at the end of a line?</li>
            <li>Are all your brackets { } ( ) [ ] closed properly?</li>
            <li>Did you spell variable or function names wrong?</li>
            <li>Did you forget to define a variable before using it?</li>
            <li>Are you missing quotes "" around text (strings)?</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={`p-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        <p>Run your code to see output here</p>
      </div>
    );
  }

  return (
    <div className={`p-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
      <div className="mb-4">
        <p className={`text-sm ${result.isError ? "text-red-500" : "text-green-500"}`}>
          <strong>Status:</strong> {result.isError ? "Compilation Failed" : "Compiled Successfully"}
        </p>
        {result.executionTime && (
          <p className="text-sm"><strong>Time:</strong> {result.executionTime}s</p>
        )}
        {result.memory && (
          <p className="text-sm"><strong>Memory:</strong> {result.memory} KB</p>
        )}
      </div>

      {result.isError ? (
        <div>
          <h3 className="text-lg font-semibold">Error Details</h3>
          <pre className="mt-2 text-sm bg-muted p-2 rounded">{result.output}</pre>
          <div className="mt-4">
            <h4 className="text-sm font-medium">Common mistakes to check:</h4>
            <ul className="list-disc pl-5 text-sm mt-1">
              <li>Missing semicolon (;) at the end of a line</li>
              <li>Unclosed brackets: { }, ( ), or [ ]</li>
              <li>Typo in a variable or function name</li>
              <li>Using a variable before creating it</li>
              <li>Forgetting quotes "" around text (strings)</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold">Output</h3>
          <pre className="mt-2 text-sm bg-muted p-2 rounded">{result.output}</pre>
        </div>
      )}
    </div>
  );
};

const CodingEnvi = () => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [consoleExpanded, setConsoleExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [versionControlExpanded, setVersionControlExpanded] = useState(false);
  const [rightSidebarTab, setRightSidebarTab] = useState("video");
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(
    "// Write your code here\nconsole.log('Hello, world!');\n"
  );
  const [pinnedVideo, setPinnedVideo] = useState(null);
  const [pinnedVideoPosition, setPinnedVideoPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showRunWithInput, setShowRunWithInput] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeOutput, setCodeOutput] = useState(null);
  const [error, setError] = useState(null);
  const { theme, setTheme } = useTheme();

  const pinnedVideoRef = useRef(null);

  const participants = [
    {
      id: 1,
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      micOn: true,
      videoOn: true,
      isActive: true,
    },
    {
      id: 2,
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
      micOn: false,
      videoOn: true,
      isActive: true,
    },
    {
      id: 3,
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      micOn: true,
      videoOn: false,
      isActive: false,
    },
    {
      id: 4,
      name: "Sam Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      micOn: false,
      videoOn: false,
      isActive: false,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "Jane Smith",
      text: "Hey everyone, I'm working on the authentication module",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: "John Doe",
      text: "I'll handle the API integration",
      time: "10:32 AM",
    },
    {
      id: 3,
      sender: "Alex Johnson",
      text: "Let me know if you need help with the UI components",
      time: "10:35 AM",
    },
    {
      id: 4,
      sender: "Sam Wilson",
      text: "I found a bug in the login flow, check line 42",
      time: "10:40 AM",
    },
  ];

  const handleRunCode = async (stdin = "") => {
    try {
      setIsLoading(true);
      setError(null);
      setCodeOutput(null);

      if (!code.trim()) {
        throw new Error("No code to execute!");
      }

      const result = await executeCode(code, selectedLanguage, stdin);
      result.isError = result.status !== "Accepted" && 
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

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalMouseMove = (e) => {
      if (isDragging && pinnedVideoRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        setPinnedVideoPosition({ x: newX, y: newY });
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("mousemove", handleGlobalMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      className={`flex flex-col h-screen coding-envi ${theme === "dark" ? "dark" : ""}`}
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
              theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
            }`}
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          >
            <Code className="h-5 w-5" />
          </Button>
          {/* Placeholder for Logo SVG */}
          <div className="w-[215px] h-[50px] bg-gray-200 flex items-center justify-center">
            <span className="text-sm text-gray-500">[Logo SVG Placeholder]</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="csharp">C#</SelectItem>
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
                    theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
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
                    theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
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
                    theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
                  } border border-gray-11`}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share this session</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            className={`rounded-lg bg-transparent ${
              theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
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
        <div className={`border-r transition-all duration-300 ${leftSidebarOpen ? "w-64" : "w-16"}`}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className={`font-semibold ${!leftSidebarOpen && "sr-only"}`}>
                Participants
              </h2>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted ${
                    !leftSidebarOpen && "justify-center"
                  }`}
                >
                  <div className="relative">
                    <Avatar
                      className={participant.isActive ? "border-2 border-green-500" : ""}
                    >
                      <AvatarImage src={participant.avatar} alt={participant.name} />
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
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
                    <span className="text-sm">{participant.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Code Editor */}
          {!settingsExpanded && !versionControlExpanded && (
            <div
              className={`flex-1 overflow-auto transition-all duration-300 ${
                consoleExpanded ? "h-1/2" : showRunWithInput ? "h-[calc(100%-300px)]" : "h-[calc(100%-200px)]"
              }`}
            >
              <Textarea
                className="w-full h-full font-mono p-4 resize-none border-0 rounded-none focus-visible:ring-0"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          )}

          {/* Run with Input */}
          {showRunWithInput && !settingsExpanded && !versionControlExpanded && (
            <div className="border-t h-[100px] p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Input</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowRunWithInput(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                className="w-full h-[60px] font-mono resize-none"
                placeholder="Enter input for your code..."
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
              />
              <Button
                className="mt-2 bg-green-700 hover:bg-green-600 text-white"
                onClick={() => handleRunCode(codeInput)}
                disabled={isLoading}
              >
                Run with Input
              </Button>
            </div>
          )}

          {/* Settings Panel */}
          {settingsExpanded && (
            <div className="flex-1 p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Settings</h2>
                <Button
                  variant="ghost"
                  className={`rounded-xl bg-transparent border border-gray-600 ${
                    theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
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
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Font Size</label>
                      <Select defaultValue="14">
                        <SelectTrigger>
                          <SelectValue placeholder="Select font size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12px</SelectItem>
                          <SelectItem value="14">14px</SelectItem>
                          <SelectItem value="16">16px</SelectItem>
                          <SelectItem value="18">18px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tab Size</label>
                      <Select defaultValue="2">
                        <SelectTrigger>
                          <SelectValue placeholder="Select tab size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 spaces</SelectItem>
                          <SelectItem value="4">4 spaces</SelectItem>
                          <SelectItem value="tab">Tab</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Collaboration Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Auto-save</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`rounded-lg bg-transparent ${
                          theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
                        } border border-gray-11`}
                      >
                        Enabled
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Show cursor names</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`rounded-lg bg-transparent ${
                          theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
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
                          theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
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

          {/* Version Control Panel */}
          {versionControlExpanded && (
            <div className="flex-1 p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Version Control</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-xl bg-transparent border border-gray-600 ${
                    theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
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
                    <Button variant="outline" size="sm" className="rounded-xl border border-gray-400">
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
                        <span className="font-medium">Fix authentication bug</span>
                        <span className="text-sm text-muted-foreground">2 hours ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">John Doe</p>
                    </div>

                    <div className="p-2 border rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Add user profile page</span>
                        <span className="text-sm text-muted-foreground">Yesterday</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Jane Smith</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Console */}
          {!settingsExpanded && !versionControlExpanded && (
            <div
              className={`border-t transition-all duration-300 ${
                consoleExpanded ? "h-1/2" : "h-[200px]"
              }`}
            >
              <div className="flex items-center justify-between p-2 border-b">
                <div className="flex items-center gap-2">
                  <Tabs defaultValue="output">
                    <TabsList>
                      <TabsTrigger className="rounded-lg" value="console">
                        Console
                      </TabsTrigger>
                      <TabsTrigger className="rounded-lg" value="output">
                        Output
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="console" className="m-0">
                      <div className="p-4 h-[calc(100%-45px)] overflow-auto font-mono text-sm">
                        <div className="text-muted-foreground">{">"} Console ready</div>
                      </div>
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

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-lg bg-transparent ${
                      theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
                    } border border-gray-11`}
                    onClick={() => {
                      setVersionControlExpanded(true);
                      setSettingsExpanded(false);
                      setConsoleExpanded(false);
                    }}
                  >
                    <GitBranch className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-lg bg-transparent ${
                      theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
                    } border border-gray-11`}
                    onClick={() => {
                      setSettingsExpanded(true);
                      setVersionControlExpanded(false);
                      setConsoleExpanded(false);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-lg bg-transparent ${
                      theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
                    } border border-gray-11`}
                    onClick={() => setConsoleExpanded(!consoleExpanded)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="absolute bottom-12 right-4 flex gap-2">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`rounded-lg bg-transparent ${
                        theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
                      } border border-gray-11`}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Fetch Time: 120ms
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="absolute bottom-full right-0 mb-2 w-64 z-50">
                    <Card className={`${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"} border`}>
                      <CardHeader className="py-2">
                        <CardTitle className="text-sm">Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Fetch Time:</span>
                            <span>120ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Execution Time:</span>
                            <span>45ms</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`rounded-lg bg-transparent ${
                        theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
                      } border border-gray-11`}
                    >
                      <Cpu className="h-4 w-4 mr-2" />
                      Complexity
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="absolute bottom-full right-0 mb-2 w-64 z-50">
                    <Card className={`${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"} border`}>
                      <CardHeader className="py-2">
                        <CardTitle className="text-sm">Complexity Analysis</CardTitle>
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

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`rounded-lg bg-transparent ${
                        theme === "light" ? "hover:bg-gray-100 text-black" : "hover:bg-gray-800 text-white"
                      } border border-gray-11`}
                    >
                      <Languages className="h-4 w-4 mr-2" />
                      Translate
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="absolute bottom-full right-0 mb-2 w-64 z-50">
                    <Card className={`${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"} border`}>
                      <CardHeader className="py-2">
                        <CardTitle className="text-sm">Code Translation</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <Select defaultValue="python">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Translate to" />
                          </SelectTrigger>
                          <SelectContent className="select-content">
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="csharp">C#</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className={`border-l transition-all duration-300 ${rightSidebarOpen ? "w-64" : "w-0 overflow-hidden"}`}>
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

            <TabsContent value="video" className="flex-1 overflow-hidden p-0 m-0 flex flex-col">
              <div className="grid grid-cols-1 gap-2 p-2 flex-1 overflow-auto">
                {participants
                  .filter((p) => p.videoOn || p.isActive)
                  .map((participant) => (
                    <div
                      key={participant.id}
                      className="relative rounded-md bg-muted aspect-video"
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
                          <PinIcon className={`h-3 w-3 ${theme === "light" ? "text-black" : "text-white"}`} />
                        </Button>
                      </div>
                      <div className="h-full flex items-center justify-center">
                        {participant.videoOn ? (
                          <img
                            src={participant.avatar || "/placeholder.svg"}
                            alt={participant.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 overflow-hidden p-0 m-0 flex flex-col">
              <ScrollArea className="flex-1 p-2">
                {messages.map((message) => (
                  <div key={message.id} className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{message.sender}</span>
                      <span className="text-xs text-muted-foreground">{message.time}</span>
                    </div>
                    <div className="bg-muted p-2 rounded-md text-sm">{message.text}</div>
                  </div>
                ))}
              </ScrollArea>

              <div className="p-2 border-t">
                <div className="flex gap-2">
                  <Input placeholder="Type a message..." className="flex-1" />
                  <Button size="sm" className="rounded-lg bg-black text-white hover:bg-gray-900">
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
              <Mic className={`h-7 w-7 text-${micEnabled ? "black" : "white"} bg-transparent`} />
            ) : (
              <MicOff className={`h-7 w-7 bg-transparent text-${micEnabled ? "black" : "white"}`} />
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
              <Video className={`h-7 w-7 text-${videoEnabled ? "black" : "white"} bg-transparent`} />
            ) : (
              <VideoOff className={`h-7 w-7 text-${videoEnabled ? "black" : "white"} bg-transparent`} />
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
              <div key={participant.id} className="h-full flex items-center justify-center">
                {participant.videoOn ? (
                  <img
                    src={participant.avatar || "/placeholder.svg"}
                    alt={participant.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="mt-2 text-sm font-medium">{participant.name}</span>
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