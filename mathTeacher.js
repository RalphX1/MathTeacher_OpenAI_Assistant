const OpenAI = require("openai");
const readline = require("readline");

// Get API key: first check system environment, then try .env file
function getApiKey() {
  // First, check if OPENAI_API_KEY is already set in system environment
  if (process.env.OPENAI_API_KEY) {
    console.log("Using OPENAI_API_KEY from system environment variables.");
    return process.env.OPENAI_API_KEY;
  }

  // If not found, try loading from .env file
  try {
    require("dotenv").config();
    if (process.env.OPENAI_API_KEY) {
      console.log("Using OPENAI_API_KEY from .env file.");
      return process.env.OPENAI_API_KEY;
    }
  } catch {
    // dotenv not available or .env file doesn't exist
  }

  return null;
}

// Configuration from environment variables with defaults
const config = {
  apiKey: getApiKey(),
  assistantId: process.env.OPENAI_ASSISTANT_ID || null,
  model: process.env.OPENAI_MODEL || "gpt-4-turbo",
  assistantName: process.env.ASSISTANT_NAME || "Math Tutor",
  assistantInstructions:
    process.env.ASSISTANT_INSTRUCTIONS ||
    "You are a personal math tutor. Write and run code to answer math questions.",
  pollingIntervalMs: parseInt(process.env.POLLING_INTERVAL_MS, 10) || 1000,
  pollingTimeoutMs: parseInt(process.env.POLLING_TIMEOUT_MS, 10) || 120000,
  maxPollingRetries: parseInt(process.env.MAX_POLLING_RETRIES, 10) || 60,
};

// Validate required configuration
function validateConfig() {
  if (!config.apiKey) {
    throw new Error(
      "OPENAI_API_KEY not found. Please set it as a system environment variable or in a .env file."
    );
  }
}

// Create OpenAI client
function createOpenAIClient() {
  return new OpenAI({ apiKey: config.apiKey });
}

// Create readline interface
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

// Promisified question function
function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Validate user input
function validateInput(input) {
  if (!input || typeof input !== "string") {
    return { valid: false, error: "Input is required." };
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Question cannot be empty." };
  }

  if (trimmed.length > 10000) {
    return { valid: false, error: "Question is too long (max 10000 characters)." };
  }

  return { valid: true, value: trimmed };
}

// Get or create assistant
async function getOrCreateAssistant(openai) {
  // If assistant ID is provided, verify it exists
  if (config.assistantId) {
    try {
      const assistant = await openai.beta.assistants.retrieve(config.assistantId);
      console.log(`Using existing assistant: ${assistant.name} (${assistant.id})`);
      return assistant;
    } catch (error) {
      if (error.status === 404) {
        console.warn(
          `Assistant ${config.assistantId} not found. Creating a new one...`
        );
      } else {
        throw error;
      }
    }
  }

  // Create new assistant
  const assistant = await openai.beta.assistants.create({
    name: config.assistantName,
    instructions: config.assistantInstructions,
    tools: [{ type: "code_interpreter" }],
    model: config.model,
  });

  console.log(`Created new assistant: ${assistant.name} (${assistant.id})`);
  console.log(`Tip: Set OPENAI_ASSISTANT_ID=${assistant.id} in .env to reuse it.\n`);

  return assistant;
}

// Terminal states for a run
const TERMINAL_STATES = ["completed", "failed", "cancelled", "expired"];

// Poll for run completion with timeout and exponential backoff
async function waitForRunCompletion(openai, threadId, runId) {
  const startTime = Date.now();
  let pollCount = 0;
  let currentInterval = config.pollingIntervalMs;

  while (true) {
    // Check timeout
    const elapsed = Date.now() - startTime;
    if (elapsed > config.pollingTimeoutMs) {
      throw new Error(
        `Run timed out after ${config.pollingTimeoutMs / 1000} seconds.`
      );
    }

    // Check max retries
    if (pollCount >= config.maxPollingRetries) {
      throw new Error(`Max polling retries (${config.maxPollingRetries}) exceeded.`);
    }

    // Retrieve run status
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

    // Check for terminal states
    if (TERMINAL_STATES.includes(runStatus.status)) {
      if (runStatus.status === "completed") {
        return runStatus;
      }

      // Handle error states
      const errorMessage = runStatus.last_error?.message || "Unknown error";
      throw new Error(
        `Run ${runStatus.status}: ${errorMessage}`
      );
    }

    // Handle requires_action state (for function calling)
    if (runStatus.status === "requires_action") {
      throw new Error(
        "Run requires action (function calling not implemented in this version)."
      );
    }

    // Wait before next poll with exponential backoff (max 5 seconds)
    await new Promise((resolve) => setTimeout(resolve, currentInterval));
    currentInterval = Math.min(currentInterval * 1.5, 5000);
    pollCount++;
  }
}

// Extract text content from assistant message safely
function extractMessageContent(message) {
  if (!message || !message.content || !Array.isArray(message.content)) {
    return null;
  }

  const textParts = message.content
    .filter((part) => part.type === "text" && part.text?.value)
    .map((part) => part.text.value);

  return textParts.length > 0 ? textParts.join("\n") : null;
}

// Get the assistant's response for a specific run
async function getAssistantResponse(openai, threadId, runId) {
  const messages = await openai.beta.threads.messages.list(threadId);

  const assistantMessage = messages.data.find(
    (message) => message.run_id === runId && message.role === "assistant"
  );

  if (!assistantMessage) {
    return "No response received from assistant.";
  }

  const content = extractMessageContent(assistantMessage);
  return content || "Response received but no text content found.";
}

// Main application
async function main() {
  let rl = null;

  try {
    // Validate configuration
    validateConfig();

    // Initialize clients
    const openai = createOpenAIClient();
    rl = createReadlineInterface();

    // Get or create assistant
    const assistant = await getOrCreateAssistant(openai);

    // Create a thread for the conversation
    const thread = await openai.beta.threads.create();

    console.log(
      "\nHello! I'm your personal math tutor. Ask me any math questions.\n"
    );
    console.log('Type "quit" or "exit" to end the session.\n');

    // Main conversation loop
    let keepAsking = true;
    while (keepAsking) {
      const userInput = await askQuestion(rl, "Your question: ");

      // Check for exit commands
      const normalizedInput = userInput.trim().toLowerCase();
      if (normalizedInput === "quit" || normalizedInput === "exit") {
        console.log("\nGoodbye! I hope you learned something today.\n");
        break;
      }

      // Validate input
      const validation = validateInput(userInput);
      if (!validation.valid) {
        console.log(`\nError: ${validation.error}\n`);
        continue;
      }

      try {
        // Send message to thread
        await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: validation.value,
        });

        // Create and wait for run
        console.log("\nThinking...\n");
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: assistant.id,
        });

        await waitForRunCompletion(openai, thread.id, run.id);

        // Get and display response
        const response = await getAssistantResponse(openai, thread.id, run.id);
        console.log(`${response}\n`);
      } catch (error) {
        // Handle API errors gracefully
        if (error.status === 429) {
          console.log("\nRate limit exceeded. Please wait a moment and try again.\n");
        } else if (error.status >= 500) {
          console.log("\nOpenAI service error. Please try again later.\n");
        } else {
          console.log(`\nError: ${error.message}\n`);
        }
      }
    }
  } catch (error) {
    // Handle fatal errors
    if (error.status === 401) {
      console.error("\nAuthentication failed. Please check your API key.\n");
    } else if (error.code === "ENOTFOUND") {
      console.error("\nNetwork error. Please check your internet connection.\n");
    } else {
      console.error(`\nFatal error: ${error.message}\n`);
    }
    process.exit(1);
  } finally {
    // Clean up resources
    if (rl) {
      rl.close();
    }
  }
}

main();
