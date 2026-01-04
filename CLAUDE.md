# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

MathTeacher-OpenAI-Assistant is a CLI-based AI math tutoring application that uses OpenAI's Assistant API to provide interactive, personalized math help with step-by-step explanations.

## Commands

```bash
# Install dependencies
npm install

# Run web interface (opens at http://localhost:3000)
npm start

# Run CLI version
npm run cli
```

## Architecture

- **Single-file application**: `mathTeacher.js` (294 lines) contains all application logic
- **OpenAI Assistants API**: Uses threads for multi-turn conversations with context persistence
- **Code Interpreter**: Enabled for mathematical computations
- **Smart polling**: Exponential backoff when waiting for assistant responses

## Key Configuration

Environment variables (system env or `.env` file):
- `OPENAI_API_KEY` (required) - OpenAI API key
- `OPENAI_ASSISTANT_ID` (optional) - Reuse existing assistant to save costs
- `OPENAI_MODEL` (optional) - Default: "gpt-4-turbo"
- `POLLING_INTERVAL_MS` (optional) - Default: 1000
- `POLLING_TIMEOUT_MS` (optional) - Default: 120000

## Code Structure

```
mathTeacher.js
├── getApiKey()              - API key retrieval (env → .env fallback)
├── config                   - Configuration object with defaults
├── validateConfig()         - Validates required config
├── getOrCreateAssistant()   - Creates or retrieves OpenAI assistant
├── waitForRunCompletion()   - Polls run status with exponential backoff
├── extractMessageContent()  - Safely extracts text from API responses
├── getAssistantResponse()   - Gets assistant's response for a run
└── main()                   - Entry point with conversation loop
```

## Testing Notes

- The app uses readline for interactive input; piping input via echo doesn't work well
- Run interactively with `npm start` for proper testing
- Type "quit" or "exit" to end session

## Dependencies

- `openai` (^4.20.0) - OpenAI API SDK
- `dotenv` (^16.3.1) - Environment variable management
- Node.js >= 18.0.0 required
