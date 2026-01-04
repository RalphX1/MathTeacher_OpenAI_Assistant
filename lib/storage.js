const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const THREADS_FILE = path.join(DATA_DIR, 'threads.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadThreads() {
  ensureDataDir();
  if (!fs.existsSync(THREADS_FILE)) {
    return new Map();
  }
  try {
    const data = JSON.parse(fs.readFileSync(THREADS_FILE, 'utf8'));
    return new Map(Object.entries(data));
  } catch (error) {
    console.error('Error loading threads:', error.message);
    return new Map();
  }
}

function saveThreads(threads) {
  ensureDataDir();
  const data = Object.fromEntries(threads);
  fs.writeFileSync(THREADS_FILE, JSON.stringify(data, null, 2));
}

function getThread(sessionId) {
  const threads = loadThreads();
  return threads.get(sessionId) || null;
}

function setThread(sessionId, threadId) {
  const threads = loadThreads();
  threads.set(sessionId, threadId);
  saveThreads(threads);
}

function deleteThread(sessionId) {
  const threads = loadThreads();
  threads.delete(sessionId);
  saveThreads(threads);
}

function clearAllThreads() {
  saveThreads(new Map());
}

module.exports = {
  getThread,
  setThread,
  deleteThread,
  clearAllThreads,
  loadThreads,
};
