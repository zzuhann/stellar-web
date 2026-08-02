#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Generates a version string that changes on every call.
 * Format matches YYYYMMDDTHHmmss (truncated to 14 chars), e.g. '20260802T12210'.
 */
export function generateVersion(date = new Date()) {
  return date.toISOString().replace(/[-:.]/g, '').slice(0, 14);
}

/**
 * Replaces the `const VERSION = '...'` line in a sw.js file's content with a
 * new version, leaving the rest of the content untouched.
 */
export function replaceVersion(swContent, version) {
  return swContent.replace(/const VERSION = '[^']*'/, `const VERSION = '${version}'`);
}

// Only touch the filesystem when this file is run directly (e.g. via `npm
// run build`), not when its functions are imported for testing.
const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const swPath = path.join(__dirname, '../public/sw.js');

  const version = generateVersion();
  const swContent = fs.readFileSync(swPath, 'utf8');
  fs.writeFileSync(swPath, replaceVersion(swContent, version));

  console.log(`✅ Service Worker version updated to: ${version}`);
}
