import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Users,
  Play,
  Share,
  Settings,
  GitBranch,
  FileInputIcon,
  Sun,
  Moon,
  Video,
  MessageSquare,
  Wifi,
} from "lucide-react";

const TopBar = ({
  theme,
  leftSidebarOpen,
  setLeftSidebarOpen,
  rightSidebarOpen,
  setRightSidebarOpen,
  rightSidebarTab,
  selectedLanguage,
  setSelectedLanguage,
  handleRunCode,
  isLoading,
  showRunWithInput,
  setShowRunWithInput,
  toggleTheme,
  setVersionControlExpanded,
  versionControlExpanded,
  setSettingsExpanded,
  settingsExpanded,
  sessionId,
  languages,
  websocketStatus, // New prop
}) => {
  // Map WebSocket status to display properties
  const statusConfig = {
    disconnected: {
      color: "bg-red-500",
      text: "WebSocket Disconnected",
      animation: "",
    },
    connecting: {
      color: "bg-yellow-500",
      text: "WebSocket Connecting",
      animation: "animate-pulse",
    },
    connected: {
      color: "bg-green-500",
      text: "WebSocket Connected",
      animation: "active-status",
    },
    error: {
      color: "bg-red-500",
      text: "WebSocket Error",
      animation: "",
    },
  };

  const currentStatus = statusConfig[websocketStatus] || statusConfig.disconnected;

  return (
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
          <Users className="w-5 h-5 bg-transparent" />
        </Button>
        <div className="w-[215px] h-[50px] flex items-center justify-center bg-transparent">
          {/* Placeholder for SVG logo */}
          [Logo SVG Placeholder]
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

        {/* WebSocket Status Indicator */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-transparent border border-gray-200 ${
                  theme === "light"
                    ? "hover:bg-gray-100 text-black"
                    : "hover:bg-gray-800 text-white"
                } ${currentStatus.animation}`}
              >
                <Wifi className="h-4 w-4" />
                <div
                  className={`h-2 w-2 rounded-full ${currentStatus.color}`}
                ></div>
              </div>
            </TooltipTrigger>
            <TooltipContent>{currentStatus.text}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                className="rounded-lg bg-green-700 hover:bg-green-600 text-white"
                onClick={handleRunCode}
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
                } border border-gray-200`}
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
                } border border-gray-200`}
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
                } border border-gray-200`}
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
                } border border-gray-200`}
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
                } border border-gray-200`}
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
  );
};

export default TopBar;