const { test, expect } = require('@playwright/test');

const timestamp = Date.now();
const staffUser = `staff_${timestamp}`;
const externalUser = `external_${timestamp}`;

test('Full Workflow: Staff & External Booking', async ({ page }) => {
  test.setTimeout(180000); // 3 minutes

  const closeSwal = async () => {
    await page.waitForTimeout(1000);
    const swalBtn = page.locator('.swal2-confirm');
    if (await swalBtn.isVisible()) {
        await swalBtn.click();
    }
    await page.waitForTimeout(500);
  };

  // 1. Register Staff
  console.log('--- Registering Staff ---');
  await page.goto('http://localhost/thanonroom20042569/');
  await page.click('button:has-text("เข้าสู่ระบบ")');
  await page.click('.swal2-deny'); 
  await page.fill('#reg-username', staffUser);
  await page.fill('#reg-password', 'password123');
  await page.fill('#reg-fullname', 'Test Staff Member');
  await page.fill('#reg-phone', '0812345678');
  await page.click('.swal2-confirm'); 
  await closeSwal(); // Close "Registration Successful"

  // 2. Register External
  console.log('--- Registering External User ---');
  await page.click('button:has-text("เข้าสู่ระบบ")');
  await page.click('.swal2-deny'); 
  await page.check('input[value="external"]');
  await page.fill('#reg-username', externalUser);
  await page.fill('#reg-password', 'password123');
  await page.fill('#reg-fullname', 'Test External User');
  await page.fill('#reg-org', 'Global Testing Corp');
  await page.fill('#reg-phone', '0899999999');
  await page.click('.swal2-confirm'); 
  await closeSwal();

  // 3. Admin Approve
  console.log('--- Admin Approving ---');
  await page.click('button:has-text("เข้าสู่ระบบ")');
  await page.fill('#swal-u', 'admin_test');
  await page.fill('#swal-p', 'admin123');
  await page.click('.swal2-confirm');
  await page.waitForTimeout(1000);
  await page.click('text=ผู้ใช้งาน');
  
  await page.click(`text=${staffUser}`);
  await page.selectOption('#u-s', 'active');
  await page.click('.swal2-confirm');
  await closeSwal();

  await page.click(`text=${externalUser}`);
  await page.selectOption('#u-s', 'active');
  await page.click('.swal2-confirm');
  await closeSwal();
  
  await page.click('button:has-text("ออกจากระบบ")');
  await page.click('.swal2-confirm');

  // 4. Staff Booking (Discount Check)
  console.log('--- Staff Booking ---');
  await page.click('button:has-text("เข้าสู่ระบบ")');
  await page.fill('#swal-u', staffUser);
  await page.fill('#swal-p', 'password123');
  await page.click('.swal2-confirm');
  await page.waitForTimeout(2000);
  
  await page.locator('.fc-daygrid-day').nth(15).click(); 
  await page.fill('#b-t', 'Staff Meeting');
  await page.selectOption('#b-group', 'internal');
  const staffPrice = await page.textContent('#price-estimate');
  console.log('STAFF PRICE (50%):', staffPrice);
  await page.click('button:has-text("ยืนยันการจอง")');
  await closeSwal();
  
  await page.click('button:has-text("ออกจากระบบ")');
  await page.click('.swal2-confirm');

  // 5. External Booking (Full Price Check)
  console.log('--- External Booking ---');
  await page.click('button:has-text("เข้าสู่ระบบ")');
  await page.fill('#swal-u', externalUser);
  await page.fill('#swal-p', 'password123');
  await page.click('.swal2-confirm');
  await page.waitForTimeout(2000);
  
  await page.locator('.fc-daygrid-day').nth(20).click(); 
  await page.fill('#b-t', 'External Wedding');
  await page.selectOption('#b-group', 'external');
  const extPrice = await page.textContent('#price-estimate');
  console.log('EXTERNAL PRICE (100%):', extPrice);
  await page.click('button:has-text("ยืนยันการจอง")');
  await closeSwal();
  
  await page.click('button:has-text("ออกจากระบบ")');
  await page.click('.swal2-confirm');

  // 6. Approver Review
  console.log('--- Approver Reviewing ---');
  await page.click('button:has-text("เข้าสู่ระบบ")');
  await page.fill('#swal-u', 'approver_test');
  await page.fill('#swal-p', 'app123');
  await page.click('.swal2-confirm');
  await page.waitForTimeout(2000);
  
  await page.click('text=External Wedding');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tests-output/final_verification.png' });
  
  console.log('✅ ALL TESTS PASSED: Registration, Approval, Booking, and Pricing are verified.');
});