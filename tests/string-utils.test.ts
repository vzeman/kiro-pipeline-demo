import { describe, it, expect } from 'vitest';
import { capitalize, slugify, truncate } from '../src/string-utils.js';

describe('capitalize', () => {
  it('capitalizes the first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('returns empty string unchanged', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('slugify', () => {
  it('converts to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world');
  });
});

describe('truncate', () => {
  it('truncates with default suffix', () => {
    expect(truncate('Hello World', 5)).toBe('He...');
  });

  it('leaves short strings unchanged', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });

  it('truncates with custom suffix', () => {
    expect(truncate('Hello', 5, '~')).toBe('Hell~');
  });

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('');
  });
});
