const { test, expect } = require('@playwright/test');

test('Verification: Registration Dynamic UI Logic', async ({ page }) => {
  // 1. ไปหน้าแรกและรอจนกว่า Network นิ่ง
  await page.goto('http://localhost/thanonroom20042569/', { waitUntil: 'networkidle' });

  // 2. ตรวจสอบสถานะการเข้าสู่ระบบ
  // ถ้าเจอข้อมูล User ใน Sidebar ให้ทำการ Logout ก่อนเพื่อทดสอบสมัครสมาชิก
  const authBox = page.locator('#auth-box-sidebar');
  const hasUser = await authBox.locator('.avatar').count() > 0;
  
  if (hasUser) {
    console.log('User detected. Logging out first...');
    await page.click('button:has-text("ออกจากระบบ")');
    await page.click('.swal2-confirm'); // ยืนยันใน Swal
    await page.waitForLoadState('networkidle');
  }

  // 3. คลิกปุ่ม "เข้าสู่ระบบ" (ตอนนี้ต้องเป็นหน้าว่าง)
  const loginBtn = page.locator('button:has-text("เข้าสู่ระบบ")').first();
  await loginBtn.waitFor({ state: 'visible', timeout: 10000 });
  await loginBtn.click();

  // 4. คลิกปุ่ม "สมัครสมาชิก" ใน Modal Login
  const registerBtn = page.locator('.swal2-deny');
  await registerBtn.waitFor({ state: 'visible' });
  await registerBtn.click();

  // 5. ทดสอบ Logic การสลับประเภทผู้ใช้
  const orgArea = page.locator('#reg-external-area');
  
  // -- สถานะเริ่มต้น: ต้องซ่อนอยู่ --
  await expect(orgArea).not.toBeVisible();

  // -- เลือกบุคคลภายนอก: ต้องแสดง --
  await page.locator('input[value="external"]').check();
  await expect(orgArea).toBeVisible();
  await expect(page.locator('#reg-org')).toBeVisible();
  
  // ถ่ายรูปยืนยันผลการทดสอบ
  if (!require('fs').existsSync('tests-output')) { require('fs').mkdirSync('tests-output'); }
  await page.screenshot({ path: 'tests-output/verify_external_ui.png' });

  // -- เลือกบุคลากรภายใน: ต้องซ่อนกลับ --
  await page.locator('input[value="internal"]').check();
  await expect(orgArea).not.toBeVisible();

  console.log('✅ PASS: Registration UI Logic Verified.');
});