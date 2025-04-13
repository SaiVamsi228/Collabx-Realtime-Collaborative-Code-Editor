// src/components/OutputPanel.jsx
import { ScrollArea } from "./ui/scroll-area";

const OutputPanel = ({
  result,
  isLoading,
  error,
  theme,
  fetchTime,
  complexity,
}) => {
  return (
    <>
      <style>
        {`
          .output-panel {
            height: 200px;
            padding: 16px;
          }
        `}
      </style>
      <ScrollArea
        className={`output-panel ${
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
    </>
  );
};

export default OutputPanel;
