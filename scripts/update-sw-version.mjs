#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 使用當前時間戳作為版本號
const version = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
const swPath = path.join(__dirname, '../public/sw.js');

// 讀取 SW 文件
let swContent = fs.readFileSync(swPath, 'utf8');

// 替換版本號
swContent = swContent.replace(/const VERSION = '[^']*'/, `const VERSION = '${version}'`);

// 寫回文件
fs.writeFileSync(swPath, swContent);

console.log(`✅ Service Worker version updated to: ${version}`);
