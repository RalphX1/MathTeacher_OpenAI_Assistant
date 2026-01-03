# CLAUDE.md - AI Assistant Guide

## Project Overview

**MathTeacher-OpenAI-Assistant** is a Node.js-based AI math tutoring application that uses OpenAI's Assistant API to provide interactive, step-by-step math tutoring. This is a prototype/proof-of-concept project demonstrating conversational AI for educational purposes.

**Status:** Work in progress - early development stage

## Codebase Structure

```
MathTeacher_OpenAI_Assistant/
├── mathTeacher.js      # Main Node.js application (CLI-based tutor)
├── index.html          # Web UI template (incomplete integration)
├── style.css           # CSS styling for web interface
├── .env_sample         # Environment variable template
├── .gitignore          # Git ignore rules (.env excluded)
└── README.md           # Project documentation
```

### File Descriptions

| File | Purpose | Lines |
|------|---------|-------|
| `mathTeacher.js` | Core application logic - CLI math tutor using OpenAI Assistant API | 104 |
| `index.html` | Basic web form template for math questions | 18 |
| `style.css` | Minimal styling (green theme, centered layout) | 31 |
| `.env_sample` | Template for `OPENAI_API_KEY` configuration | 2 |

## Technology Stack

- **Runtime:** Node.js
- **API:** OpenAI Assistant API (Beta)
- **Model:** gpt-4-1106-preview
- **Dependencies (required but no package.json):**
  - `dotenv` - Environment variable management
  - `openai` - Official OpenAI Node.js client

## Development Setup

1. Clone the repository
2. Copy `.env_sample` to `.env`
3. Add your OpenAI API key to `.env`
4. Install dependencies: `npm install dotenv openai`
5. Run: `node mathTeacher.js`

## Code Patterns and Conventions

### JavaScript Patterns

- **Async/Await:** All OpenAI API calls use async/await pattern
- **Readline Interface:** User input via Node.js `readline` wrapped in Promises
- **Polling Pattern:** Status checking with 2-second intervals (acknowledged as needing improvement)
- **State Management:** Simple boolean flags for loop control

### OpenAI Assistant API Workflow

The application follows this flow:
1. Create an assistant with `code_interpreter` tool
2. Create a conversation thread
3. Add user messages to thread
4. Create a run and poll for completion
5. Retrieve and display assistant responses
6. Loop for follow-up questions

### Code Structure in mathTeacher.js

```javascript
// Lines 1-7: Dependencies (dotenv, openai, readline)
// Lines 9-13: OpenAI client initialization
// Lines 15-21: askQuestion() - Promise wrapper for readline
// Lines 23-101: main() - Core application logic
// Line 104: Entry point - main() call
```

## Key Code Locations

- **OpenAI Client Setup:** `mathTeacher.js:9-13`
- **Assistant Creation:** `mathTeacher.js:25-31`
- **Thread Management:** `mathTeacher.js:39`
- **Polling Logic:** `mathTeacher.js:64-67`
- **Response Extraction:** `mathTeacher.js:70-82`

## Known Issues and Limitations

1. **No package.json:** Dependencies must be installed manually
2. **CSS filename mismatch:** `index.html:5` references `styles.css` but file is named `style.css`
3. **Hardcoded model:** Uses `gpt-4-1106-preview` which may be deprecated
4. **Naive polling:** Status polling lacks timeout, error handling, or backoff
5. **No frontend-backend integration:** Web UI is disconnected from Node.js backend
6. **Missing features:** README mentions Progress Tracking and Personalized Learning, not implemented
7. **No error recovery:** Generic try-catch without specific error handling

## Conventions for AI Assistants

### When Making Changes

- **Maintain simplicity:** This is a prototype; avoid over-engineering
- **Preserve async/await pattern:** Keep consistent with existing code style
- **Use CommonJS:** Project uses `require()` syntax, not ES modules
- **No build step:** Code runs directly via Node.js

### Coding Style

- Use 2-space indentation (existing pattern)
- Use double quotes for strings
- Async functions for any API operations
- Add comments for complex logic

### Security Considerations

- Never commit `.env` files
- Keep API keys out of source code
- Validate user input before sending to API

### Testing

- No test framework configured
- Manual testing via CLI: `node mathTeacher.js`
- Web UI testing: Open `index.html` in browser (limited functionality)

## Suggested Improvements (for context)

When asked to improve this project, consider:

1. Add `package.json` for proper dependency management
2. Fix CSS filename reference in `index.html`
3. Add Express.js server for web UI integration
4. Implement proper error handling with retry logic
5. Add timeout to polling mechanism
6. Update to a current OpenAI model
7. Add streaming responses for better UX

## Git Workflow

- Main development on `main` branch
- `.env` files are gitignored
- Commit messages are descriptive (see history for examples)

## Quick Reference Commands

```bash
# Run the CLI tutor
node mathTeacher.js

# Install dependencies (no package.json yet)
npm install dotenv openai

# Check environment setup
cat .env
```

## API Rate Limits

Be aware of OpenAI API rate limits when testing. The polling mechanism makes multiple API calls per question.
