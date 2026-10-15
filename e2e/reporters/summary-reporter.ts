import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * QA 交付用 reporter：跑完後產生 e2e/reports/summary.md，讓 PM 直接交給工程師。
 * - 依 project 分區：regression / regression-mobile = 「該綠」桶；known-issues = 「故意紅」桶。
 * - 把 regression 失敗的截圖 / 影片 / trace 複製到無 hash 的乾淨路徑（Playwright 原生 test-results 帶 hash、難讀）。
 * - 「路由」欄是近似值，顆粒度到「頁面類型」（dynamic 測試的具體 slug 每次不同，不記錄）。
 */

const REPORTS_DIR = path.resolve('e2e/reports');
const ARTIFACTS_DIR = path.join(REPORTS_DIR, 'artifacts');
const SUMMARY_PATH = path.join(REPORTS_DIR, 'summary.md');

const REGRESSION_PROJECTS = new Set(['regression', 'regression-mobile']);

// spec 檔 → 頁面類型（近似）。找不到時退回從標題抓 /path。
const FILE_ROUTE: Record<string, string> = {
  'shell.spec.ts': '全站骨架（A 系列 / H-7）',
  'home.spec.ts': '/（首頁）',
  'event-detail.spec.ts': '/event/[slug]',
  'venues-list.spec.ts': '/venues',
  'venue-detail.spec.ts': '/venues/[id]',
  'map.spec.ts': '/map/[artist]',
  'responsive.spec.ts': '全站 RWD（多路由 × 寬度）',
  'responsive.mobile.spec.ts': '全站橫向捲動區（觸控）',
  'submit-venue.spec.ts': '/submit-venue',
  'admin-review.admin.spec.ts': '/admin-new/review',
  'venues-filter-url.spec.ts': '/venues（篩選 URL）',
  'overlay-focusable.spec.ts': '全站 overlay',
  'page-metadata.spec.ts': '多路由 <title>',
};

// known-issues：spec 檔 → { 問題描述, 首次記錄日期 }。新增 known-issue 時在此加一列。
const KNOWN_ISSUES: Record<string, { label: string; since: string }> = {
  // venues-filter-url（D-6）已於 2026-08 部署修復（region/capacity/sort 改用 useQueryState），
  // 測試已搬回 e2e/regression/venues-filter-url.spec.ts。
  'overlay-focusable.spec.ts': {
    label: '關閉狀態的 overlay（選單 / 登入 / 搜尋）內部仍可鍵盤聚焦',
    since: '2026-07-21',
  },
  'page-metadata.spec.ts': {
    label: '部分頁面 <title> 沿用首頁泛用標題（如 /submit-event、/submit-artist）',
    since: '2026-07-21',
  },
};

function projectOf(test: TestCase): string {
  let s: Suite | undefined = test.parent;
  while (s) {
    const proj = (s as unknown as { project?: () => { name: string } }).project?.();
    if (proj?.name) return proj.name;
    s = s.parent;
  }
  return '';
}

function routeFor(file: string, title: string): string {
  if (FILE_ROUTE[file]) return FILE_ROUTE[file];
  const m = title.match(/\/[A-Za-z][\w-]*(?:\/\[[\w-]+\])?/);
  return m ? m[0] : file;
}

function stripAnsi(text: string): string {
  return text.replace(/\[[0-9;]*m/g, '');
}

function slugify(text: string): string {
  return stripAnsi(text)
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/\s+/g, '-')
    .replace(/_+/g, '_')
    .slice(0, 80);
}

function escapeCell(text: string): string {
  return stripAnsi(text).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function errorSummary(result: TestResult | undefined): string {
  if (!result || !result.errors || result.errors.length === 0) {
    return String(result?.status ?? '');
  }
  return stripAnsi(result.errors[0].message ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 5)
    .join(' ｜ ')
    .slice(0, 300);
}

type Row = {
  test: TestCase;
  project: string;
  result?: TestResult;
  passed: boolean;
  skipped: boolean;
};

class SummaryReporter implements Reporter {
  private rootSuite!: Suite;
  private startedAt = new Date();

  onBegin(_config: FullConfig, suite: Suite) {
    this.rootSuite = suite;
    this.startedAt = new Date();
    // 清掉上一輪的乾淨產物，避免累積
    fs.rmSync(ARTIFACTS_DIR, { recursive: true, force: true });
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  onEnd(_result: FullResult) {
    const rows: Row[] = this.rootSuite.allTests().map((t) => {
      const outcome = t.outcome(); // 'expected' | 'unexpected' | 'flaky' | 'skipped'
      return {
        test: t,
        project: projectOf(t),
        result: t.results[t.results.length - 1],
        passed: outcome === 'expected' || outcome === 'flaky',
        skipped: outcome === 'skipped',
      };
    });

    const regRows = rows.filter((r) => REGRESSION_PROJECTS.has(r.project) && !r.skipped);
    const kiRows = rows.filter((r) => r.project === 'known-issues' && !r.skipped);

    // 🔴 regression 失敗
    const failLines: string[] = [];
    for (const r of regRows.filter((r) => !r.passed)) {
      const file = path.basename(r.test.location.file);
      const route = routeFor(file, r.test.title);
      const links = this.copyArtifacts(r.test, r.project, r.result);
      failLines.push(
        `| ${escapeCell(r.test.title)} | ${escapeCell(route)} | ${escapeCell(errorSummary(r.result))} | ${links || '—'} |`
      );
    }

    // 🟡 known-issues（依 spec 檔分組成「問題」）
    const byFile = new Map<string, Row[]>();
    for (const r of kiRows) {
      const f = path.basename(r.test.location.file);
      if (!byFile.has(f)) byFile.set(f, []);
      byFile.get(f)!.push(r);
    }
    const kiLines: string[] = [];
    for (const [file, group] of byFile) {
      const meta = KNOWN_ISSUES[file] ?? { label: file, since: '—' };
      const redCount = group.filter((r) => !r.passed).length;
      const status = redCount === 0 ? '✅ 已修復' : `仍存在（${redCount}/${group.length} 條紅）`;
      kiLines.push(`| ${escapeCell(meta.label)} | ${status} | ${meta.since} |`);
    }

    // ✅ 通過（regression + regression-mobile）
    const regTotal = regRows.length;
    const regPass = regRows.filter((r) => r.passed).length;

    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(SUMMARY_PATH, this.render(failLines, kiLines, regPass, regTotal), 'utf-8');
    console.log(`\n📄 QA summary 已產生：${SUMMARY_PATH}`);
  }

  /** 複製失敗測試的截圖 / 影片 / trace 到無 hash 的乾淨資料夾，回傳 markdown 連結 */
  private copyArtifacts(test: TestCase, project: string, result?: TestResult): string {
    if (!result) return '';
    const folder = `${project}__${slugify(test.title)}`;
    const dest = path.join(ARTIFACTS_DIR, folder);
    const filename: Record<string, string> = {
      screenshot: 'screenshot.png',
      video: 'video.webm',
      trace: 'trace.zip',
    };
    const label: Record<string, string> = { screenshot: '截圖', video: '影片', trace: 'trace' };
    const links: string[] = [];
    for (const att of result.attachments) {
      const out = filename[att.name];
      if (!out || !att.path || !fs.existsSync(att.path)) continue;
      fs.mkdirSync(dest, { recursive: true });
      const outPath = path.join(dest, out);
      fs.copyFileSync(att.path, outPath);
      links.push(`[${label[att.name]}](${path.relative(REPORTS_DIR, outPath)})`);
    }
    return links.join(' · ');
  }

  private render(
    failLines: string[],
    kiLines: string[],
    regPass: number,
    regTotal: number
  ): string {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    let sha = 'unknown';
    try {
      sha = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    } catch {
      /* 非 git 環境時保持 unknown */
    }
    const when = this.startedAt.toLocaleString('sv-SE'); // YYYY-MM-DD HH:MM:SS

    const failSection = failLines.length
      ? [
          '| 測試 | 路由 | 實際 vs 預期 | 產物（截圖 / 影片 / trace） |',
          '| --- | --- | --- | --- |',
          ...failLines,
        ].join('\n')
      : '無 🎉（regression 全綠）';

    const kiSection = kiLines.length
      ? ['| 問題 | 狀態 | 首次記錄日期 |', '| --- | --- | --- |', ...kiLines].join('\n')
      : '（本次未執行 known-issues）';

    return `# STELLAR Regression 測試結果
執行時間：${when}｜環境：${baseURL}｜commit：${sha}

## 🔴 新發現的問題（regression bucket 失敗）
${failSection}

## 🟡 已知問題現況（known-issues bucket）
${kiSection}

## ✅ 通過
${regPass} / ${regTotal}（regression + regression-mobile）
`;
  }
}

export default SummaryReporter;
