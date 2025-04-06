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
  const [pinnedVideoPosition, setPinnedVideoPosition] = useState({
    x: 20,
    y: 20,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showRunWithInput, setShowRunWithInput] = useState(false);
  const [codeInput, setCodeInput] = useState("");
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
            <Code className="h-5 w-5" />
          </Button>
          <svg
            width="215.39307556152343"
            height="50.626132567226996"
            viewBox="0 0 383.8999938964844 90.23211137541728"
            class="looka-1j8o68f"
          >
            <defs id="SvgjsDefs4865"></defs>
            <g
              id="SvgjsG4866"
              featurekey="symbolFeature-0"
              transform="matrix(0.6898787855261039,0,0,0.6898787855261039,-13.310095387583845,-2.90760899534669)"
              fill={`${theme === "dark" ? "#fff" : "#000"}`}
            >
              <path
                xmlns="http://www.w3.org/2000/svg"
                d="M96.63 57.12q11.83 7.36 23.98 14.42c4.75 2.76 4.29 5.89-.18 8.46q-3.3 1.89-6.48 3.64-.8.44-.02.91l6.97 4.19a4.64 4.63-74.5 0 1 2.24 3.97v17.42a4.2 4.2 0 0 1-2.05 3.61q-10.37 6.18-21.01 12.58c-2.5 1.51-3.82 1.71-6.39.13q-13.16-8.08-21.94-13.31a.63.63 0 0 0-.64 0l-23.23 13.88a4.18 4.15 45 0 1-4.27-.01l-21.55-12.96a3.87 3.86 15.6 0 1-1.87-3.31q.01-11.33-.01-17.49-.02-3.31 2.55-4.76 3.07-1.73 6.62-4.05a.31.31 0 0 0-.02-.53q-6.07-3.54-8.62-5.19-1.57-1.02-1.4-3.41c.15-1.92 1.7-2.78 3.31-3.74q9.73-5.76 23.85-14.27.46-.28.16-.73c-.49-.73-1.02-1.43-1.03-2.51q-.02-17.99.01-25.14a4.73 4.72 74.6 0 1 2.28-4.03q9.96-5.99 20.84-12.4 2.97-1.75 5.04-.52 15.95 9.45 20.69 12.07 3.17 1.74 3.2 4.7.1 12.03-.04 25.02-.01.82-1.17 2.58-.31.48.18.78m-25.56-12.7q.53-2.61 2.69-3.93 5.89-3.61 17.45-11.03a.31.31 0 0 0-.01-.53L72.17 17.49a.79.79 0 0 0-.82 0L52.33 28.85a1.95 1.95 0 0 0-.94 1.67v22.29a2.23 2.22 15.7 0 0 1.07 1.9l18.03 10.84a.36.35-74.5 0 0 .54-.31l.02-20.56a1.77 1.64-42.8 0 1 .02-.26m26.42 28.32c2.06 1.44 2.23 4.4-.02 5.75Q79.09 89.54 73.35 92.96a3.74 3.72 44.9 0 1-3.83-.01Q59.11 86.71 47.76 79.7c-1.31-.81-2.87-1.56-3.41-2.97-.87-2.26.63-3.76 2.48-4.89q5.13-3.1 11.23-6.78a.16.16 0 0 0 0-.27l-6.3-3.78q-.24-.15-.48 0L27.46 75.24a.47.47 0 0 0-.01.81l43.38 26.09a1.14 1.12 44.6 0 0 1.15 0l43.89-26.22a.3.3 0 0 0 0-.52L91.29 60.62q-.17-.11-.34 0l-6.4 3.82a.18.17 44 0 0 .01.3q8.83 5.14 12.93 8m-32 11.01q0 .18.08.23 2.9 1.66 5.73 3.44.01.01.14.02.06.01.12.01t.12-.01q.13-.01.14-.02 2.83-1.78 5.73-3.44.07-.05.07-.23t-.07-.23q-2.9-1.66-5.73-3.44-.01-.01-.14-.02-.06-.01-.12-.01t-.12.01q-.13.01-.14.02-2.83 1.78-5.73 3.44-.08.05-.08.23M45.6 121.56a.35.35 0 0 0 .36 0l22.62-13.51a.35.35 0 0 0 0-.6l-19.1-11.48a.35.35 0 0 0-.36 0l-22.62 13.5a.35.35 0 0 0 0 .6zm70.54-11.46a.34.34 0 0 0 0-.58L93.65 95.99a.34.34 0 0 0-.34 0l-19.13 11.43a.34.34 0 0 0 0 .58l22.49 13.53a.34.34 0 0 0 .34 0z"
              ></path>
            </g>
            <g
              id="SvgjsG4867"
              featurekey="textGroupContainer"
              transform="matrix(1,0,0,1,92,4)"
              fill={`${theme === "dark" ? "#fff" : "#000"}`}
            >
              <rect
                xmlns="http://www.w3.org/2000/svg"
                y="0"
                x="0"
                height="1"
                width="1"
                opacity="0"
              ></rect>
              <rect
                xmlns="http://www.w3.org/2000/svg"
                y="80.88"
                x="0"
                width="28"
                height="2"
              ></rect>
              <rect
                xmlns="http://www.w3.org/2000/svg"
                y="80.88"
                x="263.9"
                width="28"
                height="2"
              ></rect>
            </g>
            <g
              id="SvgjsG4868"
              featurekey="nameFeature-0"
              transform="matrix(2.189502365161019,0,0,2.189502365161019,96.37259705740317,-26.274026293860054)"
              fill={`${theme === "dark" ? "#fff" : "#000"}`}
            >
              <path d="M4.92 40 l-3.72 -3.72 l0 -20.56 l3.72 -3.72 l8.8 0 l3.72 3.72 l0 5.24 l-5.04 0 l0 -3.16 l-0.76 -0.76 l-4.64 0 l-0.76 0.76 l0 16.4 l0.76 0.76 l4.64 0 l0.76 -0.76 l0 -3.16 l5.04 0 l0 5.24 l-3.72 3.72 l-8.8 0 z M24.137999999999998 40 l-3.72 -3.72 l0 -20.56 l3.72 -3.72 l9.08 0 l3.72 3.72 l0 20.56 l-3.72 3.72 l-9.08 0 z M26.218 34.96 l4.92 0 l0.76 -0.76 l0 -16.4 l-0.76 -0.76 l-4.92 0 l-0.76 0.76 l0 16.4 z M39.916000000000004 40 l0 -4.48 l0.84 -0.56 l0 -17.92 l-0.84 -0.56 l0 -4.48 l6.72 0 l0 4.48 l-0.84 0.56 l0 17.92 l2.8 0 l0.56 -0.84 l4.48 0 l0 5.88 l-13.72 0 z M56.614000000000004 40 l0 -4.48 l0.84 -0.56 l0 -17.92 l-0.84 -0.56 l0 -4.48 l6.72 0 l0 4.48 l-0.84 0.56 l0 17.92 l2.8 0 l0.56 -0.84 l4.48 0 l0 5.88 l-13.72 0 z M72.512 40 l0 -4.48 l0.84 -0.56 l3.64 -17.92 l-0.84 -0.56 l0 -4.48 l10.64 0 l0 4.48 l-0.84 0.56 l3.64 17.92 l0.84 0.56 l0 4.48 l-4.96 0 l-1.24 -6.16 l-5.52 0 l-1.24 6.16 l-4.96 0 z M79.752 28.8 l3.44 0 l-1.72 -8.56 z M92.61 40 l0 -4.48 l0.84 -0.56 l0 -17.92 l-0.84 -0.56 l0 -4.48 l12.52 0 l3.72 3.72 l0 8.24 l-2.04 2.04 l2.04 2.04 l0 8.24 l-3.72 3.72 l-12.52 0 z M98.49 34.96 l4.56 0 l0.76 -0.76 l0 -4.08 l-1.6 -1.6 l-3.72 0 l0 6.44 z M98.49 23.48 l3.72 0 l1.6 -1.6 l0 -4.08 l-0.76 -0.76 l-4.56 0 l0 6.44 z M111.828 40 l0 -4.48 l1.16 -0.76 l3.16 -8.76 l-3.16 -8.76 l-1.16 -0.76 l0 -4.48 l4.6 0 l3.52 9.68 l3.52 -9.68 l4.6 0 l0 4.48 l-1.16 0.76 l-3.16 8.76 l3.16 8.76 l1.16 0.76 l0 4.48 l-4.6 0 l-3.52 -9.68 l-3.52 9.68 l-4.6 0 z"></path>
            </g>
            <g
              id="SvgjsG4869"
              featurekey="sloganFeature-0"
              transform="matrix(0.7101623092992436,0,0,0.7101623092992436,126.28983769070075,75.94364511632456)"
              fill={`${theme === "dark" ? "#fff" : "#000"}`}
            >
              <path d="M1.26 20 c-0.16 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.1 -0.26 0.26 -0.26 l4.88 0 c1.52 0 2.72 0.38 3.56 1.16 c1.24 1.12 1.66 3.24 1.06 4.8 c-0.22 0.56 -0.6 1.08 -1.08 1.46 c-0.28 0.22 -0.58 0.38 -0.88 0.54 c0.86 1.36 2.16 4.12 2.16 4.12 c0.02 0.04 0.06 0.1 0.06 0.16 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.96 0 c-0.08 0 -0.18 -0.06 -0.22 -0.14 l-1.74 -3.82 c-0.62 0.04 -1.1 0.02 -1.74 0.02 l0 3.68 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.58 0 z M4.1 13.280000000000001 c0 0 2.52 0.28 3.4 -0.3 c0.34 -0.22 0.54 -0.76 0.54 -1.16 c-0.02 -0.44 -0.24 -0.9 -0.6 -1.18 c-0.38 -0.32 -1.32 -0.42 -1.8 -0.42 l-1.54 0.04 l0 3.02 z M14.1455 20 l0 -11.98 c0 -0.5 0.1 -0.6 0.26 -0.6 l8.76 0 c0.14 0 0.26 0.1 0.26 0.24 l0 2.26 c0 0.14 -0.12 0.26 -0.26 0.26 l-5.92 0 l0 2.08 l3.74 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-3.74 0 l0 2.14 l5.9 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-8.74 0 z M26.791 20 c-0.08 0 -0.16 -0.04 -0.2 -0.12 c-0.06 -0.06 -0.06 -0.16 -0.04 -0.24 l4.66 -11.98 c0.04 -0.1 0.14 -0.16 0.24 -0.16 l2.68 0 c0.1 0 0.2 0.06 0.24 0.16 l4.58 11.98 c0.02 0.08 0.02 0.16 -0.04 0.24 c-0.04 0.08 -0.12 0.12 -0.2 0.12 l-2.78 0 c-0.1 0 -0.2 -0.06 -0.24 -0.16 l-0.74 -1.84 l-4.5 0.02 l-0.74 1.82 c-0.04 0.1 -0.14 0.16 -0.24 0.16 l-2.68 0 z M31.271 15.5 l2.88 0 l-1.44 -4.24 z M42.1365 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.6 0 c0.14 0 0.26 0.12 0.26 0.26 l0 9.36 l4.5 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.36 c0 0.14 -0.12 0.26 -0.26 0.26 l-7.36 0 z M62.6075 20 c-0.14 0 -0.24 -0.12 -0.24 -0.26 l0 -9.44 l-2.74 0 c-0.14 0 -0.26 -0.1 -0.26 -0.24 l0 -2.3 c0 -0.14 0.12 -0.26 0.26 -0.26 l8.58 0 c0.16 0 0.26 0.12 0.26 0.26 l0 2.3 c0 0.14 -0.1 0.24 -0.26 0.24 l-2.74 0 l0 9.44 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.6 0 z M71.833 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.6 0 c0.14 0 0.26 0.12 0.26 0.26 l0 11.98 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.6 0 z M78.0585 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.88 0 c0.1 0 0.2 0.06 0.24 0.14 l3 7.4 l2.98 -7.4 c0.04 -0.08 0.14 -0.14 0.24 -0.14 l2.88 0 c0.14 0 0.26 0.12 0.26 0.26 l0 11.98 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.34 0 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -6.44 l-2.44 6.2 c-0.04 0.08 -0.14 0.14 -0.22 0.14 l-1.68 0 c-0.1 0 -0.2 -0.06 -0.24 -0.14 l-2.46 -6.2 l0 6.44 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.32 0 z M93.64399999999999 20 l0 -11.98 c0 -0.5 0.1 -0.6 0.26 -0.6 l8.76 0 c0.14 0 0.26 0.1 0.26 0.24 l0 2.26 c0 0.14 -0.12 0.26 -0.26 0.26 l-5.92 0 l0 2.08 l3.74 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-3.74 0 l0 2.14 l5.9 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-8.74 0 c-0.16 0 -0.26 -0.12 -0.26 0.08 z M118.83499999999998 20 c-1.18 0 -2.26 -0.28 -3.22 -0.84 c-0.96 -0.58 -1.72 -1.36 -2.26 -2.34 s-0.82 -2.08 -0.82 -3.3 c0 -1.18 0.28 -2.28 0.84 -3.26 c0.56 -0.96 1.34 -1.74 2.3 -2.3 c0.98 -0.56 2.08 -0.84 3.24 -0.84 c0.88 0 1.74 0.2 2.58 0.56 c0.84 0.38 1.56 0.88 2.16 1.52 c0.08 0.1 0.08 0.24 0 0.34 l-1.9 1.56 c-0.06 0.06 -0.12 0.1 -0.2 0.1 s-0.16 -0.04 -0.2 -0.1 c-1.02 -1.24 -2.66 -1.5 -4.04 -0.64 c-1.2 0.74 -1.64 2.1 -1.58 3.46 c0.06 1.38 1.06 2.56 2.38 2.96 c1.2 0.36 2.38 0.08 3.24 -0.84 c0.06 -0.04 0.12 -0.08 0.2 -0.06 c0.08 0 0.14 0.02 0.18 0.08 l1.94 1.36 c0.08 0.1 0.08 0.24 0 0.34 c-0.64 0.68 -1.4 1.24 -2.24 1.64 c-0.86 0.4 -1.74 0.6 -2.6 0.6 z M133.2805 20 c-1.2 0 -2.3 -0.28 -3.26 -0.84 c-0.98 -0.56 -1.76 -1.36 -2.34 -2.32 c-0.56 -0.98 -0.84 -2.1 -0.84 -3.3 c0 -1.18 0.28 -2.28 0.84 -3.26 c0.58 -0.98 1.34 -1.76 2.32 -2.32 s2.08 -0.84 3.28 -0.84 c1.18 0 2.28 0.28 3.26 0.84 s1.76 1.34 2.32 2.32 c0.58 0.98 0.86 2.08 0.86 3.26 c0 1.2 -0.28 2.3 -0.86 3.28 c-0.56 0.98 -1.34 1.76 -2.32 2.34 c-0.98 0.56 -2.08 0.84 -3.26 0.84 z M133.32049999999998 17.12 c0.58 0 1.12 -0.16 1.6 -0.46 c0.5 -0.32 0.9 -0.74 1.18 -1.3 c0.3 -0.54 0.44 -1.16 0.44 -1.82 c0 -0.64 -0.14 -1.26 -0.44 -1.8 c-0.28 -0.54 -0.68 -0.96 -1.18 -1.28 c-0.48 -0.3 -1.02 -0.46 -1.6 -0.46 c-0.6 0 -1.14 0.16 -1.64 0.46 c-0.52 0.32 -0.92 0.74 -1.22 1.28 c-0.3 0.56 -0.44 1.16 -0.44 1.8 c0 0.66 0.14 1.28 0.44 1.82 c0.32 0.54 0.72 0.98 1.22 1.28 c0.5 0.32 1.04 0.48 1.64 0.48 z M143.08599999999996 20 c-0.16 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.1 -0.26 0.26 -0.26 l4.54 0 c1.2 0 2.3 0.26 3.26 0.8 c0.96 0.52 1.7 1.26 2.24 2.22 c0.52 0.94 0.8 2.02 0.8 3.22 c0 1.22 -0.28 2.3 -0.82 3.24 c-0.54 0.96 -1.3 1.7 -2.28 2.22 c-0.96 0.54 -2.08 0.8 -3.3 0.8 l-4.44 0 z M145.92599999999996 17.2 l1.76 0 c0.58 0 1.12 -0.14 1.58 -0.42 c0.46 -0.3 0.84 -0.7 1.1 -1.22 s0.4 -1.12 0.4 -1.8 c0 -0.66 -0.14 -1.28 -0.42 -1.8 c-0.28 -0.54 -0.66 -0.94 -1.14 -1.24 c-0.48 -0.28 -1.04 -0.44 -1.64 -0.44 l-1.64 0 l0 6.92 z M157.29149999999996 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.6 0 c0.14 0 0.26 0.12 0.26 0.26 l0 11.98 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.6 0 z M163.51699999999997 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.36 0 c0.08 0 0.16 0.04 0.22 0.1 l4.6 7.1 l0 -6.94 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.46 0 c0.14 0 0.26 0.12 0.26 0.26 l0 11.98 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.36 0 c-0.08 0 -0.16 -0.04 -0.22 -0.1 l-4.58 -7.06 l0 6.9 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.48 0 z M183.16249999999997 20 c-1.18 0 -2.28 -0.28 -3.24 -0.84 c-0.98 -0.58 -1.74 -1.36 -2.3 -2.32 c-0.56 -0.98 -0.84 -2.1 -0.84 -3.3 s0.28 -2.3 0.86 -3.26 c0.56 -0.98 1.36 -1.76 2.34 -2.32 c1 -0.56 2.12 -0.84 3.34 -0.84 c0.88 0 1.74 0.16 2.6 0.5 c0.84 0.32 1.58 0.78 2.18 1.36 c0.1 0.08 0.12 0.22 0.04 0.34 l-1.46 1.92 c-0.06 0.06 -0.12 0.1 -0.2 0.12 c-0.06 0 -0.14 -0.04 -0.2 -0.08 c-0.4 -0.4 -0.86 -0.72 -1.4 -0.94 c-0.52 -0.22 -1.04 -0.34 -1.56 -0.34 c-0.62 0 -1.2 0.16 -1.7 0.46 c-0.52 0.32 -0.92 0.74 -1.22 1.28 s-0.44 1.14 -0.44 1.8 s0.14 1.28 0.44 1.82 s0.72 0.98 1.22 1.3 c0.52 0.3 1.1 0.46 1.7 0.46 c0.32 0 0.66 -0.06 1.04 -0.16 c0.32 -0.1 0.66 -0.24 0.96 -0.4 l0 -0.92 l-1.38 0 c-0.08 0 -0.14 -0.02 -0.18 -0.08 c-0.06 -0.04 -0.08 -0.1 -0.08 -0.18 l0.02 -2.24 c0 -0.14 0.12 -0.26 0.26 -0.26 l3.88 0 c0.14 0 0.26 0.12 0.26 0.26 l0 5.02 c0 0.08 -0.04 0.16 -0.12 0.22 c-0.62 0.48 -1.38 0.88 -2.26 1.16 c-0.88 0.3 -1.74 0.46 -2.56 0.46 z M203.0135 20 c-1.08 0 -1.86 -0.22 -2.68 -0.66 c-0.8 -0.44 -1.44 -1.06 -1.88 -1.88 c-0.44 -0.8 -0.66 -1.76 -0.66 -2.86 l0 -7.04 c0 -0.14 0.12 -0.24 0.26 -0.24 l2.6 0 c0.14 0 0.24 0.1 0.24 0.24 l0 7.04 c0 0.8 0.22 1.42 0.64 1.86 s0.8 0.66 1.5 0.66 s1.06 -0.22 1.46 -0.64 c0.4 -0.44 0.6 -1.08 0.6 -1.88 l0 -7.04 c0 -0.14 0.12 -0.24 0.26 -0.24 l2.6 0 c0.14 0 0.26 0.1 0.26 0.24 l0 7.04 c0 1.1 -0.22 2.06 -0.66 2.86 c-0.42 0.82 -1.06 1.44 -1.86 1.88 s-1.6 0.66 -2.68 0.66 z M211.57899999999998 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.36 0 c0.08 0 0.16 0.04 0.22 0.1 l4.6 7.1 l0 -6.94 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.46 0 c0.14 0 0.26 0.12 0.26 0.26 l0 11.98 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.36 0 c-0.08 0 -0.16 -0.04 -0.22 -0.1 l-4.58 -7.06 l0 6.9 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.48 0 z M225.10449999999997 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.6 0 c0.14 0 0.26 0.12 0.26 0.26 l0 9.36 l4.5 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.36 c0 0.14 -0.12 0.26 -0.26 0.26 l-7.36 0 z M235.82999999999998 20 l0 -11.98 c0 -0.5 0.1 -0.6 0.26 -0.6 l8.76 0 c0.14 0 0.26 0.1 0.26 0.24 l0 2.26 c0 0.14 -0.12 0.26 -0.26 0.26 l-5.92 0 l0 2.08 l3.74 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-3.74 0 l0 2.14 l5.9 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-8.74 0 c-0.16 0 -0.26 -0.12 -0.26 0.08 z M248.47549999999998 20 c-0.08 0 -0.16 -0.04 -0.2 -0.12 c-0.06 -0.06 -0.06 -0.16 -0.04 -0.24 l4.66 -11.98 c0.04 -0.1 0.14 -0.16 0.24 -0.16 l2.68 0 c0.1 0 0.2 0.06 0.24 0.16 l4.58 11.98 c0.02 0.08 0.02 0.16 -0.04 0.24 c-0.04 0.08 -0.12 0.12 -0.2 0.12 l-2.78 0 c-0.1 0 -0.2 -0.06 -0.24 -0.16 l-0.74 -1.84 l-4.5 0.02 l-0.74 1.82 c-0.04 0.1 -0.14 0.16 -0.24 0.16 l-2.68 0 z M252.9555 15.5 l2.88 0 l-1.44 -4.24 z M268.70099999999996 20.12 c-0.96 0 -1.92 -0.18 -2.84 -0.54 c-0.92 -0.34 -1.74 -0.84 -2.42 -1.44 c-0.08 -0.08 -0.1 -0.2 -0.06 -0.3 l0.7 -2.38 c0.04 -0.08 0.1 -0.14 0.18 -0.14 c0.08 -0.02 0.16 0 0.22 0.06 c1.06 1 2.26 1.9 3.76 1.98 c0.4 0.02 0.84 0.04 1.22 -0.08 c1.18 -0.38 0.68 -1.58 -0.2 -1.94 c-0.3 -0.12 -0.72 -0.26 -1.26 -0.42 c-0.8 -0.22 -1.46 -0.46 -1.96 -0.7 c-0.54 -0.24 -1 -0.62 -1.4 -1.12 c-0.38 -0.52 -0.58 -1.2 -0.58 -2.02 c0 -0.78 0.2 -1.46 0.6 -2.04 s0.96 -1.04 1.66 -1.34 s1.52 -0.46 2.44 -0.46 c0.82 0 1.62 0.12 2.42 0.38 c0.78 0.24 1.48 0.58 2.1 0.98 c0.1 0.08 0.14 0.2 0.08 0.32 l-0.66 2.24 c-0.02 0.08 -0.08 0.12 -0.16 0.14 c-0.06 0.02 -0.14 0.02 -0.2 -0.02 c-0.9 -0.56 -1.8 -1.24 -2.86 -1.38 c-0.7 -0.1 -1.76 -0.06 -2 0.78 c-0.3 1.08 1.28 1.36 2 1.58 c0.8 0.24 1.46 0.48 1.98 0.72 c0.54 0.26 1.02 0.66 1.4 1.16 c0.4 0.52 0.6 1.22 0.6 2.06 c0 0.82 -0.22 1.52 -0.64 2.12 c-0.4 0.6 -0.98 1.04 -1.7 1.36 c-0.72 0.28 -1.52 0.44 -2.42 0.44 z M276.82649999999995 20 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.6 0 c0.14 0 0.26 0.12 0.26 0.26 l0 4.92 l4.52 0 l0 -4.92 c0 -0.14 0.12 -0.26 0.26 -0.26 l2.6 0 c0.14 0 0.26 0.12 0.26 0.26 l0 11.98 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.6 0 c-0.14 0 -0.26 -0.12 -0.26 -0.26 l0 -4.3 l-4.52 0 l0 4.3 c0 0.14 -0.12 0.26 -0.26 0.26 l-2.6 0 z M290.43199999999996 20 l0 -11.98 c0 -0.5 0.1 -0.6 0.26 -0.6 l8.76 0 c0.14 0 0.26 0.1 0.26 0.24 l0 2.26 c0 0.14 -0.12 0.26 -0.26 0.26 l-5.92 0 l0 2.08 l3.74 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-3.74 0 l0 2.14 l5.9 0 c0.14 0 0.26 0.12 0.26 0.26 l0 2.24 c0 0.14 -0.12 0.26 -0.26 0.26 l-8.74 0 c-0.16 0 -0.26 -0.12 -0.26 0.08 z M303.07749999999993 20 c-0.16 0 -0.26 -0.12 -0.26 -0.26 l0 -11.98 c0 -0.14 0.1 -0.26 0.26 -0.26 l4.54 0 c1.2 0 2.3 0.26 3.26 0.8 c0.96 0.52 1.7 1.26 2.24 2.22 c0.52 0.94 0.8 2.02 0.8 3.22 c0 1.22 -0.28 2.3 -0.82 3.24 c-0.54 0.96 -1.3 1.7 -2.28 2.22 c-0.96 0.54 -2.08 0.8 -3.3 0.8 l-4.44 0 z M305.91749999999996 17.2 l1.76 0 c0.58 0 1.12 -0.14 1.58 -0.42 c0.46 -0.3 0.84 -0.7 1.1 -1.22 s0.4 -1.12 0.4 -1.8 c0 -0.66 -0.14 -1.28 -0.42 -1.8 c-0.28 -0.54 -0.66 -0.94 -1.14 -1.24 c-0.48 -0.28 -1.04 -0.44 -1.64 -0.44 l-1.64 0 l0 6.92 z"></path>
            </g>
          </svg>
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
                  className={`rounded-lg bg-transparent font-semibold bg-green-700 hover:bg-green-600 text-white `}
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
            className={`rounded-lg  bg-transparent ${
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
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted ${
                    !leftSidebarOpen && "justify-center"
                  }`}
                >
                  <div className="relative">
                    <Avatar
                      className={
                        participant.isActive ? "border-2 border-green-500" : ""
                      }
                    >
                      <AvatarImage
                        src={participant.avatar}
                        alt={participant.name}
                      />
                      <AvatarFallback>
                        {participant.name.charAt(0)}
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
                consoleExpanded
                  ? "h-1/2"
                  : showRunWithInput
                  ? "h-[calc(100%-300px)]"
                  : "h-[calc(100%-200px)]"
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
          )}

          {/* Settings Panel */}
          {settingsExpanded && (
            <div className="flex-1 p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Settings</h2>
                <Button
                  variant="ghost"
                  className={`rounded-xl bg-transparent  border border-gray-600 ${
                    theme === "light"
                      ? "hover:bg-gray-100 text-black"
                      : "hover:bg-gray-800 text-white"
                  }`}
                  size="sm"
                  onClick={() => setSettingsExpanded(false)}
                >
                  <X className="h-4 w-4 " />
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
                  <h3 className="text-lg font-medium mb-2">
                    Collaboration Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Auto-save</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`rounded-lg border border-gray-11 bg-transparent ${
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
                        className={`rounded-lg border border-gray-11 bg-transparent ${
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
                        className={`rounded-lg border border-gray-11 bg-transparent ${
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

          {/* Version Control Panel */}
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

                    <div className="p-2 border rounded-md ">
                      <div className="flex items-center justify-between ">
                        <span className="font-medium ">styles.css</span>
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

          {/* Console */}
          {!settingsExpanded && !versionControlExpanded && (
            <div
              className={`border-t transition-all duration-300 ${
                consoleExpanded ? "h-1/2" : "h-[200px]"
              }`}
            >
              <div className="flex items-center justify-between p-2 border-b">
                <div className="flex items-center gap-2">
                  <Tabs defaultValue="console">
                    <TabsList>
                      <TabsTrigger className="rounded-lg " value="console">
                        Console
                      </TabsTrigger>
                      <TabsTrigger className="rounded-lg" value="output">
                        Output
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-lg bg-transparent ${
                      theme === "light"
                        ? "hover:bg-gray-100 text-black"
                        : "hover:bg-gray-800 text-white"
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
                    className={`rounded-lg bg-transparent ${
                      theme === "light"
                        ? "hover:bg-gray-100 text-black"
                        : "hover:bg-gray-800 text-white"
                    } border border-gray-11`}
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSettingsExpanded(true);
                      setVersionControlExpanded(false);
                      setConsoleExpanded(false);
                    }}
                  >
                    <Settings className="h-4 w-4 " />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConsoleExpanded(!consoleExpanded)}
                    className={`rounded-lg bg-transparent ${
                      theme === "light"
                        ? "hover:bg-gray-100 text-black"
                        : "hover:bg-gray-800 text-white"
                    } border border-gray-11`}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 h-[calc(100%-45px)] overflow-auto font-mono text-sm ">
                <div className="text-muted-foreground">{">"} Console ready</div>
              </div>

              {/* Performance Metrics */}
              {/* Performance Metrics */}
              <div className="absolute bottom-12 right-4 flex gap-2">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`rounded-lg border border-gray-11 bg-transparent ${
                        theme === "light"
                          ? "hover:bg-gray-100 text-black"
                          : "hover:bg-gray-800 text-white"
                      }`}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Fetch Time: 120ms
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="absolute bottom-full right-0 mb-2 w-64 z-50">
                    <Card
                      className={`${
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
                          <div className="flex justify-between rounded-lg">
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
                      className={`rounded-lg border border-gray-11 bg-transparent ${
                        theme === "light"
                          ? "hover:bg-gray-100 text-black"
                          : "hover:bg-gray-800 text-white"
                      }`}
                    >
                      <Cpu className="h-4 w-4 mr-2" />
                      Complexity
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="absolute bottom-full right-0 mb-2 w-64 z-50">
                    <Card
                      className={`${
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

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`rounded-lg border border-gray-11 bg-transparent ${
                        theme === "light"
                          ? "hover:bg-gray-100 text-black"
                          : "hover:bg-gray-800 text-white"
                      }`}
                    >
                      <Languages className="h-4 w-4 mr-2" />
                      Translate
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="absolute bottom-full right-0 mb-2 w-64 z-50">
                    <Card
                      className={`${
                        theme === "dark"
                          ? "bg-gray-800 text-white"
                          : "bg-white text-black"
                      } border`}
                    >
                      <CardHeader className="py-2">
                        <CardTitle className="text-sm">
                          Code Translation
                        </CardTitle>
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
        <div
          className={`border-l transition-all duration-300 ${
            rightSidebarOpen ? "w-64" : "w-0 overflow-hidden"
          }`}
        >
          <Tabs
            value={rightSidebarTab}
            onValueChange={setRightSidebarTab}
            className="h-full flex flex-col "
          >
            <div className="p-2 border-b">
              <TabsList className="w-full">
                <TabsTrigger value="video" className="flex-1 rounded-lg ">
                  Video
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex-1 rounded-lg">
                  Chat
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="video"
              className="flex-1 overflow-hidden p-0 m-0 flex flex-col"
            >
              <div className="grid grid-cols-2 gap-2 p-2 flex-1 overflow-auto">
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
                          <PinIcon className="h-3 w-3" />
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
                            <AvatarFallback>
                              {participant.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent
              value="chat"
              className="flex-1 overflow-hidden p-0 m-0 flex flex-col"
            >
              <ScrollArea className="flex-1 p-2">
                {messages.map((message) => (
                  <div key={message.id} className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {message.sender}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {message.time}
                      </span>
                    </div>
                    <div className="bg-muted p-2 rounded-md text-sm">
                      {message.text}
                    </div>
                  </div>
                ))}
              </ScrollArea>

              <div className="p-2 border-t">
                <div className="flex gap-2">
                  <Input placeholder="Type a message..." className="flex-1" />
                  <Button
                    size="sm"
                    className="rounded-lg bg-black text-white hover:bg-gray-900 "
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
            className={`rounded-full  border border-gray-400 hover:bg-${
              micEnabled ? "gray-100" : "gray-800"
            } bg-${micEnabled ? "white" : "black"}`}
            size="icon"
            onClick={() => setMicEnabled(!micEnabled)}
          >
            {micEnabled ? (
              <Mic
                className={`h-7 w-7 text-${
                  micEnabled ? "black" : "white"
                } bg-transparent
                }`}
              />
            ) : (
              <MicOff
                className={`h-7 w-7 bg-transparent text-${
                  micEnabled ? "black" : "white"
                } `}
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
                className={`h-7 w-7   text-${
                  videoEnabled ? "black" : "white"
                } bg-transparent`}
              />
            ) : (
              <VideoOff
                className={`h-7 w-7 text-${
                  videoEnabled ? "black" : "white"
                } bg-transparent}`}
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
