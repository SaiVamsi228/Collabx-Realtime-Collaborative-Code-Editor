import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { X } from "lucide-react";
import OutputPanel from "./OutputPanel";

const EditorArea = ({
  selectedLanguage,
  theme,
  monacoTheme,
  fontSize,
  tabSize,
  showRunWithInput,
  setShowRunWithInput,
  codeInput,
  setCodeInput,
  notesHeight,
  setNotesHeight,
  isResizing,
  setIsResizing,
  settingsExpanded,
  setSettingsExpanded,
  versionControlExpanded,
  setVersionControlExpanded,
  codeOutput,
  isLoading,
  error,
  fetchTime,
  complexity,
  handleRunCode,
  handleEditorDidMount,
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
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

    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeEnd);
    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [isResizing, setNotesHeight]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {!settingsExpanded && !versionControlExpanded && (
        <div
          className="flex-1 overflow-auto"
          style={{
            height: `calc(100% - ${notesHeight + (showRunWithInput ? 100 : 0)}px)`,
          }}
        >
          <Editor
            height="100%"
            language={selectedLanguage}
            theme={monacoTheme}
            onMount={(editor, monaco) => {
              editorRef.current = editor;
              monacoRef.current = monaco;
              handleEditorDidMount(editor, monaco);
            }}
            options={{
              minimap: { enabled: true },
              fontSize,
              tabSize,
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
                      className={theme === "dark" ? "bg-gray-800" : "bg-white"}
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
                      className={theme === "dark" ? "bg-gray-800" : "bg-white"}
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
                      className={theme === "dark" ? "bg-gray-800" : "bg-white"}
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
        <div className="border-t relative" style={{ height: `${notesHeight}px` }}>
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
  );
};

export default EditorArea;