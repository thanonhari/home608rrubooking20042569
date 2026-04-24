const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Listen for console logs
  page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.type()}: ${msg.text()}`));
  
  // Listen for uncaught exceptions
  page.on('pageerror', exception => {
    console.error(`BROWSER UNCAUGHT EXCEPTION: ${exception}`);
  });

  try {
    console.log('Navigating to http://localhost/thanonroom20042569/ ...');
    await page.goto('http://localhost/thanonroom20042569/', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait a bit to let any async functions finish
    await page.waitForTimeout(3000);
    
    console.log('Taking screenshot to tests-output/debug_full.png');
    if (!fs.existsSync('tests-output')) { fs.mkdirSync('tests-output'); }
    await page.screenshot({ path: 'tests-output/debug_full.png', fullPage: true });

    // Extract auth box html
    const authSidebar = await page.locator('#auth-box-sidebar').innerHTML();
    console.log('Auth Sidebar HTML:', authSidebar.trim());
    
  } catch (e) {
    console.error('Test script failed:', e);
  } finally {
    await browser.close();
  }
})();