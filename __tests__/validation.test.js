/**
 * Tests for validation and utility functions
 * These test the core logic used in both server.js and mathTeacher.js
 */

describe('Input Validation', () => {
  // Validation function extracted from server.js logic
  function validateInput(input) {
    if (!input || typeof input !== 'string') {
      return { valid: false, error: 'Input is required.' };
    }

    const trimmed = input.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'Question cannot be empty.' };
    }

    if (trimmed.length > 10000) {
      return { valid: false, error: 'Question is too long (max 10000 characters).' };
    }

    return { valid: true, value: trimmed };
  }

  it('should reject null input', () => {
    const result = validateInput(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Input is required.');
  });

  it('should reject undefined input', () => {
    const result = validateInput(undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Input is required.');
  });

  it('should reject non-string input', () => {
    expect(validateInput(123).valid).toBe(false);
    expect(validateInput({}).valid).toBe(false);
    expect(validateInput([]).valid).toBe(false);
  });

  it('should reject empty string', () => {
    const result = validateInput('');
    expect(result.valid).toBe(false);
    // Empty string is falsy, so it fails the first check
    expect(result.error).toBe('Input is required.');
  });

  it('should reject whitespace-only string', () => {
    const result = validateInput('   \n\t  ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Question cannot be empty.');
  });

  it('should accept valid input', () => {
    const result = validateInput('What is 2 + 2?');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('What is 2 + 2?');
  });

  it('should trim whitespace from valid input', () => {
    const result = validateInput('  What is 2 + 2?  ');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('What is 2 + 2?');
  });

  it('should reject input exceeding 10000 characters', () => {
    const longInput = 'a'.repeat(10001);
    const result = validateInput(longInput);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Question is too long (max 10000 characters).');
  });

  it('should accept input at exactly 10000 characters', () => {
    const maxInput = 'a'.repeat(10000);
    const result = validateInput(maxInput);
    expect(result.valid).toBe(true);
  });
});

describe('Message Content Extraction', () => {
  // Function extracted from server.js logic
  function extractMessageContent(message) {
    if (!message?.content?.length) return null;

    return (
      message.content
        .filter((part) => part.type === 'text' && part.text?.value)
        .map((part) => part.text.value)
        .join('\n') || null
    );
  }

  it('should return null for null message', () => {
    expect(extractMessageContent(null)).toBeNull();
  });

  it('should return null for undefined message', () => {
    expect(extractMessageContent(undefined)).toBeNull();
  });

  it('should return null for message without content', () => {
    expect(extractMessageContent({})).toBeNull();
    expect(extractMessageContent({ content: null })).toBeNull();
  });

  it('should return null for empty content array', () => {
    expect(extractMessageContent({ content: [] })).toBeNull();
  });

  it('should extract single text content', () => {
    const message = {
      content: [{ type: 'text', text: { value: 'Hello World' } }],
    };
    expect(extractMessageContent(message)).toBe('Hello World');
  });

  it('should join multiple text contents with newline', () => {
    const message = {
      content: [
        { type: 'text', text: { value: 'Line 1' } },
        { type: 'text', text: { value: 'Line 2' } },
      ],
    };
    expect(extractMessageContent(message)).toBe('Line 1\nLine 2');
  });

  it('should filter out non-text content', () => {
    const message = {
      content: [
        { type: 'image', url: 'http://example.com/img.png' },
        { type: 'text', text: { value: 'Hello' } },
        { type: 'file', file_id: 'abc123' },
      ],
    };
    expect(extractMessageContent(message)).toBe('Hello');
  });

  it('should handle text content without value', () => {
    const message = {
      content: [
        { type: 'text', text: {} },
        { type: 'text', text: { value: 'Valid' } },
      ],
    };
    expect(extractMessageContent(message)).toBe('Valid');
  });

  it('should return null when no valid text content exists', () => {
    const message = {
      content: [{ type: 'image', url: 'http://example.com/img.png' }],
    };
    expect(extractMessageContent(message)).toBeNull();
  });
});

describe('Terminal States', () => {
  const TERMINAL_STATES = ['completed', 'failed', 'cancelled', 'expired'];

  it('should include completed state', () => {
    expect(TERMINAL_STATES).toContain('completed');
  });

  it('should include failed state', () => {
    expect(TERMINAL_STATES).toContain('failed');
  });

  it('should include cancelled state', () => {
    expect(TERMINAL_STATES).toContain('cancelled');
  });

  it('should include expired state', () => {
    expect(TERMINAL_STATES).toContain('expired');
  });

  it('should not include in_progress state', () => {
    expect(TERMINAL_STATES).not.toContain('in_progress');
  });

  it('should not include queued state', () => {
    expect(TERMINAL_STATES).not.toContain('queued');
  });
});
