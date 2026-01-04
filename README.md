# MathTeacher-OpenAI-Assistant

An interactive math tutoring platform powered by OpenAI's Assistant API. Get step-by-step guidance on math problems with LaTeX rendering support.

## Features

- **Interactive Problem Solving** - Real-time math tutoring with code execution
- **LaTeX Math Rendering** - Beautiful mathematical notation via KaTeX
- **Dark Mode** - System preference detection with manual toggle
- **Conversation Persistence** - Sessions saved to disk
- **Mobile Responsive** - Works on all screen sizes
- **Rate Limiting** - Built-in API abuse protection

## Prerequisites

- Node.js 18.0.0 or higher
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/RalphX1/MathTeacher_OpenAI_Assistant.git
   cd MathTeacher_OpenAI_Assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open in browser**

   Navigate to http://localhost:3000

## CLI Mode

For terminal-based interaction:
```bash
npm run cli
```

## Configuration

See `.env.example` for all available options:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | Your OpenAI API key |
| `OPENAI_ASSISTANT_ID` | No | - | Reuse existing assistant |
| `OPENAI_MODEL` | No | gpt-4-turbo | Model to use |
| `PORT` | No | 3000 | Server port |
| `RATE_LIMIT_MAX_REQUESTS` | No | 20 | Max requests per minute |
| `CORS_ALLOWED_ORIGINS` | No | * | Allowed CORS origins |

## Development

```bash
# Run linter
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for tests
npm run test:watch
```

## API Endpoints

### POST /api/ask
Submit a math question.

**Request:**
```json
{
  "question": "What is the derivative of x^2?",
  "sessionId": "session_abc123"
}
```

**Response:**
```json
{
  "answer": "The derivative of x^2 is 2x.",
  "threadId": "thread_xyz789"
}
```

### POST /api/clear
Clear a conversation session.

**Request:**
```json
{
  "sessionId": "session_abc123"
}
```

### GET /api/health
Health check endpoint.

## Project Structure

```
.
├── server.js          # Express server with API endpoints
├── mathTeacher.js     # CLI version
├── index.html         # Web frontend with KaTeX
├── style.css          # Styles with dark mode support
├── lib/
│   └── storage.js     # Persistent thread storage
├── __tests__/         # Jest tests
├── data/              # Session storage (gitignored)
├── .env.example       # Environment template
├── .eslintrc.json     # ESLint config
├── .prettierrc        # Prettier config
└── jest.config.js     # Jest config
```

## How It Works

1. **Student Inquiry** - Ask a math question via web or CLI
2. **AI Processing** - OpenAI Assistant API processes the request
3. **Step-by-Step Response** - Receive detailed explanations with math notation
4. **Conversation Context** - Follow-up questions maintain context

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run `npm run lint` and `npm test`
4. Submit a pull request

## License

MIT License
