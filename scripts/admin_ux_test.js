const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('1. Logging in...');
    await page.goto('http://localhost/thanonroom20042569/', { waitUntil: 'networkidle' });
    await page.click('button:has-text("เข้าสู่ระบบ")');
    await page.fill('#swal-u', 'admin_test');
    await page.fill('#swal-p', 'admin123');
    await page.click('.swal2-confirm');
    await page.waitForTimeout(2000);

    console.log('2. Navigating to Rooms Management...');
    await page.click('text=ห้องประชุม');
    await page.waitForTimeout(1000);

    console.log('3. Clicking Add New Room...');
    await page.click('button:has-text("เพิ่มห้องประชุมใหม่")');
    await page.fill('#swal-name', 'ห้องทดสอบ Agent v1');
    await page.fill('#swal-desc', 'อาคารทดสอบ ชั้น 99');
    await page.fill('#swal-cap', '50');
    await page.click('button:has-text("บันทึกข้อมูล")');
    await page.waitForTimeout(1000);
    await page.click('.swal2-confirm'); // Close success modal

    console.log('4. Uploading Photo to the new room...');
    // Find the edit button for our new room
    const editBtn = page.locator('.card:has-text("ห้องทดสอบ Agent v1") button:has-text("แก้ไขข้อมูล")');
    await editBtn.click();
    
    // Check if upload input is visible
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
        await fileInput.setInputFiles(path.join(process.cwd(), 'tests', 'dummy.png'));
        console.log('   Photo selected and uploading...');
        await page.waitForTimeout(3000); // Wait for upload API
    } else {
        console.log('   UX Issue: Upload input not found in Creation modal (Needs fix).');
    }

    await page.screenshot({ path: 'tests-output/admin_test_result.png', fullPage: true });
    console.log('✅ Testing finished. Captured results in tests-output/admin_test_result.png');

  } catch (e) {
    console.error('Test Failed:', e.message);
  } finally {
    await browser.close();
  }
})();