# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

MathTeacher-OpenAI-Assistant is an AI math tutoring application with both web and CLI interfaces. It uses OpenAI's Assistant API for interactive, personalized math help with step-by-step explanations and LaTeX math rendering.

## Commands

```bash
# Install dependencies
npm install

# Run web interface (opens at http://localhost:3000)
npm start

# Run CLI version
npm run cli

# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test
```

## Architecture

- **Web server**: `server.js` - Express server with API endpoints, CORS, rate limiting
- **CLI app**: `mathTeacher.js` - Terminal-based interactive tutor
- **Frontend**: `index.html` + `style.css` - KaTeX math rendering, dark mode, responsive
- **Storage**: `lib/storage.js` - Persistent conversation threads (JSON file)
- **Tests**: `__tests__/` - Jest unit tests

## Key Files

| File | Purpose |
|------|---------|
| `server.js` | Express API server with /api/ask, /api/clear, /api/health |
| `mathTeacher.js` | CLI version with readline interface |
| `index.html` | Web frontend with KaTeX, dark mode toggle |
| `style.css` | CSS with custom properties for theming |
| `lib/storage.js` | File-based thread persistence |

## Configuration

See `.env.example` for all options. Key variables:
- `OPENAI_API_KEY` (required) - OpenAI API key
- `OPENAI_ASSISTANT_ID` (optional) - Reuse existing assistant
- `OPENAI_MODEL` (optional) - Default: "gpt-4-turbo"
- `PORT` (optional) - Default: 3000
- `RATE_LIMIT_MAX_REQUESTS` (optional) - Default: 20/min
- `CORS_ALLOWED_ORIGINS` (optional) - Default: *

## API Endpoints

- `POST /api/ask` - Submit question, returns answer
- `POST /api/clear` - Clear conversation session
- `GET /api/health` - Health check

## Testing

```bash
npm test              # Run all tests
npm run test:coverage # With coverage report
npm run test:watch    # Watch mode
```

Tests cover:
- `lib/storage.js` - Thread persistence
- Validation functions - Input validation, message extraction

## Dependencies

**Production**: express, openai, dotenv, cors, express-rate-limit
**Dev**: eslint, prettier, jest
