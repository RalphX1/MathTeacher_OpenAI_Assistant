const express = require("express");
const OpenAI = require("openai");
const path = require("path");

// Load environment variables
try {
  require("dotenv").config();
} catch {
  // dotenv not required if env vars are set
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configuration
const config = {
  apiKey: process.env.OPENAI_API_KEY,
  assistantId: process.env.OPENAI_ASSISTANT_ID || null,
  model: process.env.OPENAI_MODEL || "gpt-4-turbo",
  assistantName: process.env.ASSISTANT_NAME || "Math Tutor",
  assistantInstructions:
    process.env.ASSISTANT_INSTRUCTIONS ||
    "You are a personal math tutor. Write and run code to answer math questions.",
  pollingIntervalMs: parseInt(process.env.POLLING_INTERVAL_MS, 10) || 1000,
  pollingTimeoutMs: parseInt(process.env.POLLING_TIMEOUT_MS, 10) || 120000,
};

// Validate API key
if (!config.apiKey) {
  console.error("OPENAI_API_KEY not found. Please set it as an environment variable.");
  process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: config.apiKey });

// Store assistant and threads (in-memory for simplicity)
let assistant = null;
const threads = new Map();

// Terminal states for a run
const TERMINAL_STATES = ["completed", "failed", "cancelled", "expired"];

// Get or create assistant
async function getOrCreateAssistant() {
  if (assistant) return assistant;

  if (config.assistantId) {
    try {
      assistant = await openai.beta.assistants.retrieve(config.assistantId);
      console.log(`Using existing assistant: ${assistant.name} (${assistant.id})`);
      return assistant;
    } catch (error) {
      if (error.status !== 404) throw error;
      console.warn(`Assistant ${config.assistantId} not found. Creating new one...`);
    }
  }

  assistant = await openai.beta.assistants.create({
    name: config.assistantName,
    instructions: config.assistantInstructions,
    tools: [{ type: "code_interpreter" }],
    model: config.model,
  });

  console.log(`Created new assistant: ${assistant.name} (${assistant.id})`);
  console.log(`Tip: Set OPENAI_ASSISTANT_ID=${assistant.id} to reuse it.`);
  return assistant;
}

// Poll for run completion
async function waitForRunCompletion(threadId, runId) {
  const startTime = Date.now();
  let currentInterval = config.pollingIntervalMs;

  while (true) {
    if (Date.now() - startTime > config.pollingTimeoutMs) {
      throw new Error("Request timed out. Please try again.");
    }

    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (TERMINAL_STATES.includes(runStatus.status)) {
      if (runStatus.status === "completed") {
        return runStatus;
      }
      throw new Error(`Run ${runStatus.status}: ${runStatus.last_error?.message || "Unknown error"}`);
    }

    await new Promise((resolve) => setTimeout(resolve, currentInterval));
    currentInterval = Math.min(currentInterval * 1.5, 5000);
  }
}

// Extract message content
function extractMessageContent(message) {
  if (!message?.content?.length) return null;

  return message.content
    .filter((part) => part.type === "text" && part.text?.value)
    .map((part) => part.text.value)
    .join("\n") || null;
}

// Get assistant response
async function getAssistantResponse(threadId, runId) {
  const messages = await openai.beta.threads.messages.list(threadId);
  const assistantMessage = messages.data.find(
    (msg) => msg.run_id === runId && msg.role === "assistant"
  );

  if (!assistantMessage) return "No response received.";
  return extractMessageContent(assistantMessage) || "No text content in response.";
}

// API endpoint for asking questions
app.post("/api/ask", async (req, res) => {
  try {
    const { question, sessionId } = req.body;

    // Validate input
    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return res.status(400).json({ error: "Question is required." });
    }

    if (question.length > 10000) {
      return res.status(400).json({ error: "Question is too long (max 10000 characters)." });
    }

    // Get or create assistant
    const currentAssistant = await getOrCreateAssistant();

    // Get or create thread for this session
    let threadId = threads.get(sessionId);
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      if (sessionId) threads.set(sessionId, threadId);
    }

    // Send message
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: question.trim(),
    });

    // Create and wait for run
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: currentAssistant.id,
    });

    await waitForRunCompletion(threadId, run.id);

    // Get response
    const response = await getAssistantResponse(threadId, run.id);

    res.json({ answer: response, threadId });
  } catch (error) {
    console.error("Error:", error.message);

    if (error.status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded. Please wait and try again." });
    }
    if (error.status === 401) {
      return res.status(401).json({ error: "Authentication failed. Check API key." });
    }

    res.status(500).json({ error: error.message || "An error occurred." });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Math Tutor server running at http://localhost:${PORT}`);
  console.log("Open this URL in your browser to use the web interface.");
});
