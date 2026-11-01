// Screenshots a card page once it reports ready. Needs Playwright (PLAYWRIGHT_MODULE, or resolvable from here).
import { pathToFileURL } from 'node:url';
const [chrome, url, out] = process.argv.slice(2);
const spec = process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright';
const { chromium } = await import(spec);
const browser = await chromium.launch({ executablePath: chrome, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(url);
await page.waitForSelector('body[data-ready="true"]', { timeout: 90000 });
await page.screenshot({ path: out });
await browser.close();
