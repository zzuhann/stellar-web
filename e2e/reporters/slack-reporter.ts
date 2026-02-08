import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';

type FailedTest = {
  title: string;
  file: string;
  error: string;
};

class SlackReporter implements Reporter {
  private failedTests: FailedTest[] = [];
  private webhookUrl: string | undefined;
  private baseURL: string;

  constructor(options: { webhookUrl?: string } = {}) {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || options.webhookUrl;
    this.baseURL = process.env.BASE_URL || 'http://localhost:3000';
  }

  onBegin(_config: FullConfig, _suite: Suite) {
    this.failedTests = [];
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status !== 'passed' && result.status !== 'skipped') {
      const error = result.error?.message || result.error?.stack || String(result.status);
      this.failedTests.push({
        title: test.title,
        file: test.location.file,
        error: error.slice(0, 500),
      });
    }
  }

  async onEnd(result: FullResult) {
    if (!this.webhookUrl || this.failedTests.length === 0) return;

    const blocks = [
      {
        type: 'header',
        text: { type: 'plain_text', text: '🔴 E2E 測試失敗 (STELLAR)', emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*環境*\n${this.baseURL}` },
          { type: 'mrkdwn', text: `*失敗數*\n${this.failedTests.length}` },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: this.failedTests
            .slice(0, 10)
            .map(
              (t, i) =>
                `• *${i + 1}. ${t.title}*\n   \`${t.file}\`\n   _${t.error.replace(/\n/g, ' ')}_`
            )
            .join('\n\n'),
        },
      },
    ];

    if (this.failedTests.length > 10) {
      blocks.push({
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `… 還有 ${this.failedTests.length - 10} 個失敗` }],
      });
    }

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      });
    } catch (e) {
      console.warn('Slack reporter failed to send:', e);
    }
  }
}

export default SlackReporter;
