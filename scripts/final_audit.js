const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('--- Starting UI Audit ---');
  
  // Capture console logs from browser
  page.on('console', msg => console.log(`BROWSER_LOG: ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`BROWSER_ERROR: ${err.message}`));

  try {
    await page.goto('http://localhost/thanonroom20042569/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Give it a moment to render

    // 1. Check Loading Screen
    const loadingVisible = await page.isVisible('#loading-screen');
    console.log(`Loading Screen Visible: ${loadingVisible}`);

    // 2. Check Auth Box
    const authHtml = await page.innerHTML('#auth-box-sidebar');
    console.log(`Auth Box HTML: ${authHtml.trim()}`);

    // 3. Take Screenshot
    if (!fs.existsSync('tests-output')) { fs.mkdirSync('tests-output'); }
    await page.screenshot({ path: 'tests-output/final_audit.png', fullPage: true });
    console.log('Screenshot saved to tests-output/final_audit.png');

    // 4. Find Login Button
    const loginBtn = page.locator('button:has-text("เข้าสู่ระบบ")');
    const isLoginVisible = await loginBtn.isVisible();
    console.log(`Is Login Button Visible: ${isLoginVisible}`);

  } catch (e) {
    console.error(`Audit Failed: ${e.message}`);
  } finally {
    await browser.close();
  }
})();