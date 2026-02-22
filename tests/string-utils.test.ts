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
  it('truncates long strings', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
  });

  it('leaves short strings unchanged', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });
});
