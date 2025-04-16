import axios from "axios";

const API_KEY = `${import.meta.env.VITE_JUDGE0_KEY}`; // Use environment variables in production
const API_ENDPOINT = `${import.meta.env.VITE_JUDGE0_URL}`;

const languageToJudge0Id = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54, // Added C++ language ID
  typescript: 74,
  csharp: 51,
  php: 68,
  swift: 83,
  kotlin: 78,
  dart: 92,
  go: 60,
  ruby: 72,
  scala: 81,
  rust: 73,
  erlang: 58,
  elixir: 57,
};

// Safe base64 decode function that handles UTF-8 characters properly
function safeBase64Decode(base64String) {
  try {
    // For browsers
    if (typeof window !== "undefined") {
      const binary = atob(base64String);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    }
    // For Node.js (if needed)
    else {
      return Buffer.from(base64String, "base64").toString("utf8");
    }
  } catch (error) {
    console.error("Error decoding base64:", error);
    return "[Error decoding output]";
  }
}

/**
 * Submit code to Judge0 for execution
 * @param {string} sourceCode - The code to execute
 * @param {string} language - The programming language
 * @param {string} stdin - Optional input for the program
 * @returns {Promise<object>} - The execution result
 */
export async function executeCode(sourceCode, language, stdin = "") {
  const languageId = languageToJudge0Id[language];
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const data = {
    source_code: sourceCode,
    language_id: languageId,
    stdin: stdin,
  };

  try {
    const response = await axios.post(
      `${API_ENDPOINT}/submissions?base64_encoded=false&wait=true`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    );

    // Check HTTP status first
    if (!response.status === 200) {
      const errorText = await response.statusText;
      throw new Error(
        `API responded with status ${response.status}: ${errorText}`
      );
    }

    const result = response.data;

    // Decode base64 output if present
    let output = "";

    if (result.stdout) {
      output = result.stdout;
    } else if (result.stderr) {
      output = `Error: ${safeBase64Decode(result.stderr)}`;
    } else if (result.compile_output) {
      output = `Compilation Error: ${safeBase64Decode(result.compile_output)}`;
    } else {
      output = "No output generated";
    }

    // Return both the output and status information
    return {
      output,
      status: result.status ? result.status.description : "Unknown",
      executionTime: result.time,
      memory: result.memory,
      exitCode: result.exit_code,
    };
  } catch (error) {
    console.error("Error submitting code:", error);
    throw error;
  }
}
