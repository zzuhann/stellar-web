import { describe, it, expect } from 'vitest';
import { generateVersion, replaceVersion } from './update-sw-version.mjs';

describe('generateVersion', () => {
  it('formats a date as a 14-character YYYYMMDDTHHmmss-style string', () => {
    const date = new Date('2026-08-02T12:21:05.123Z');
    expect(generateVersion(date)).toBe('20260802T12210');
  });

  it('produces a different value for a different timestamp', () => {
    const a = generateVersion(new Date('2026-07-12T07:56:12.000Z'));
    const b = generateVersion(new Date('2026-08-02T12:21:05.123Z'));
    expect(a).not.toBe(b);
  });
});

describe('replaceVersion', () => {
  const swContent = `// Service Worker for STELLAR PWA
const VERSION = '20260712T07562';
const CACHE_NAME = \`stellar-cache-v\${VERSION}\`;
const STATIC_CACHE_URLS = [
  '/',
];
`;

  it('replaces only the VERSION line with the new value', () => {
    const result = replaceVersion(swContent, '20260802T12210');
    expect(result).toContain("const VERSION = '20260802T12210';");
    expect(result).not.toContain("const VERSION = '20260712T07562';");
  });

  it('leaves every other line unchanged', () => {
    const result = replaceVersion(swContent, '20260802T12210');
    const originalLines = swContent.split('\n');
    const resultLines = result.split('\n');

    expect(resultLines).toHaveLength(originalLines.length);
    resultLines.forEach((line, i) => {
      if (i === 1) return; // the VERSION line itself
      expect(line).toBe(originalLines[i]);
    });
  });

  it('is idempotent-safe: replacing twice yields the latest version only once', () => {
    const once = replaceVersion(swContent, '20260802T12210');
    const twice = replaceVersion(once, '20260803T00000');

    expect(twice).toContain("const VERSION = '20260803T00000';");
    expect(twice.match(/const VERSION = /g)).toHaveLength(1);
  });
});
