import { describe, it, expect } from 'vitest';

describe('Basic tests', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true);
  });

  it('should pass another simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should pass string test', () => {
    expect('hello').toBe('hello');
  });
});
