const fs = require('fs');
const path = require('path');

// Mock fs module
jest.mock('fs');

// Import after mocking
const storage = require('../lib/storage');

describe('Storage Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
  });

  describe('loadThreads', () => {
    it('should return empty Map when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      const result = storage.loadThreads();
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should parse and return threads from file', () => {
      const mockData = { session_1: 'thread_abc', session_2: 'thread_xyz' };
      fs.readFileSync.mockReturnValue(JSON.stringify(mockData));

      const result = storage.loadThreads();
      expect(result.get('session_1')).toBe('thread_abc');
      expect(result.get('session_2')).toBe('thread_xyz');
    });

    it('should handle JSON parse errors gracefully', () => {
      fs.readFileSync.mockReturnValue('invalid json');

      const result = storage.loadThreads();
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should handle file read errors gracefully', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const result = storage.loadThreads();
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });
  });

  describe('getThread', () => {
    it('should return null for non-existent session', () => {
      fs.existsSync.mockReturnValue(false);
      const result = storage.getThread('nonexistent');
      expect(result).toBeNull();
    });

    it('should return thread ID for existing session', () => {
      const mockData = { session_1: 'thread_abc' };
      fs.readFileSync.mockReturnValue(JSON.stringify(mockData));

      const result = storage.getThread('session_1');
      expect(result).toBe('thread_abc');
    });
  });

  describe('setThread', () => {
    it('should save thread to storage', () => {
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockReturnValue(undefined);
      fs.writeFileSync.mockReturnValue(undefined);

      storage.setThread('new_session', 'new_thread');

      expect(fs.writeFileSync).toHaveBeenCalled();
      const writtenData = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
      expect(writtenData.new_session).toBe('new_thread');
    });

    it('should create data directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockReturnValue(undefined);
      fs.writeFileSync.mockReturnValue(undefined);

      storage.setThread('session', 'thread');

      expect(fs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe('deleteThread', () => {
    it('should remove thread from storage', () => {
      const mockData = { session_1: 'thread_abc', session_2: 'thread_xyz' };
      fs.readFileSync.mockReturnValue(JSON.stringify(mockData));
      fs.writeFileSync.mockReturnValue(undefined);

      storage.deleteThread('session_1');

      expect(fs.writeFileSync).toHaveBeenCalled();
      const writtenData = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
      expect(writtenData.session_1).toBeUndefined();
      expect(writtenData.session_2).toBe('thread_xyz');
    });
  });

  describe('clearAllThreads', () => {
    it('should clear all threads', () => {
      fs.existsSync.mockReturnValue(true);
      fs.writeFileSync.mockReturnValue(undefined);

      storage.clearAllThreads();

      expect(fs.writeFileSync).toHaveBeenCalled();
      const writtenData = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
      expect(Object.keys(writtenData).length).toBe(0);
    });
  });
});
