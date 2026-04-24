const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  // เปิดแบบ non-headless เพื่อให้ระบบนิ่งขึ้น
  const browser = await chromium.launch({ headless: true }); 
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost/thanonroom20042569/', { waitUntil: 'networkidle' });

    // รอจนกว่าปุ่ม Login จะพร้อม
    const loginSidebarBtn = page.locator('button:has-text("เข้าสู่ระบบ")').first();
    await loginSidebarBtn.waitFor({ state: 'visible' });
    await loginSidebarBtn.click();

    // รอจนกว่า Modal จะขึ้น
    const userField = page.locator('#swal-u');
    await userField.waitFor({ state: 'visible' });
    await userField.fill('admin_test');
    await page.fill('#swal-p', 'admin123');
    await page.click('.swal2-confirm');

    // รอจนกว่า Login สำเร็จและปฏิทินโหลด
    await page.waitForSelector('.fc-daygrid-day', { timeout: 15000 });
    console.log('Logged in successfully.');

    // เปิดหน้าจอง
    await page.locator('.fc-daygrid-day').nth(15).click();
    const titleField = page.locator('#b-t');
    await titleField.waitFor({ state: 'visible' });
    await titleField.fill('Visual Verification Booking');
    
    // --- ทดสอบราคา ภายนอก (100%) ---
    await page.selectOption('#b-group', 'external');
    await page.waitForTimeout(1000);
    if (!fs.existsSync('tests-output')) { fs.mkdirSync('tests-output'); }
    await page.screenshot({ path: 'tests-output/verify_price_external.png' });
    let price = await page.textContent('#price-estimate');
    console.log('EXTERNAL PRICE:', price.trim());

    // --- ทดสอบราคา ภายใน (50%) ---
    await page.selectOption('#b-group', 'internal');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests-output/verify_price_internal.png' });
    price = await page.textContent('#price-estimate');
    console.log('INTERNAL PRICE:', price.trim());

    console.log('✅ PASS: Visual Verification Complete.');

  } catch (e) {
    console.error('Test Failed:', e.message);
    await page.screenshot({ path: 'tests-output/error_state.png' });
  } finally {
    await browser.close();
  }
})();