const { chromium } = require('playwright');

(async () => {
  // เปิดเบราว์เซอร์แบบมองเห็นได้ (headless: false) และหน่วงเวลา 1.5 วินาทีต่อก้าว (slowMo)
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1500 
  }); 
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('ขั้นตอนที่ 1: เข้าสู่หน้าเว็บ');
    await page.goto('http://localhost/thanonroom20042569/', { waitUntil: 'networkidle' });

    console.log('ขั้นตอนที่ 2: คลิกปุ่มเข้าสู่ระบบ');
    const loginSidebarBtn = page.locator('button:has-text("เข้าสู่ระบบ")').first();
    await loginSidebarBtn.click();

    console.log('ขั้นตอนที่ 3: พิมพ์ข้อมูลแอดมิน');
    await page.fill('#swal-u', 'admin_test');
    await page.fill('#swal-p', 'admin123');
    
    console.log('ขั้นตอนที่ 4: กดยืนยันการเข้าระบบ');
    await page.click('.swal2-confirm');

    console.log('ขั้นตอนที่ 5: รอหน้าจอโหลดข้อมูลสักครู่...');
    await page.waitForSelector('.fc-daygrid-day');

    console.log('ขั้นตอนที่ 6: ไปที่เมนูจัดการห้องประชุม');
    // คลิกเมนู "ห้องประชุม" (ใช้ Text)
    const roomMenu = page.locator('text=ห้องประชุม').first();
    await roomMenu.click();

    console.log('ขั้นตอนที่ 7: กดปุ่มเพิ่มห้องประชุมใหม่');
    // รอให้หน้าจัดการโหลดขึ้นมา
    await page.waitForTimeout(2000);
    // เนื่องจากเราเขียน app.js ใหม่ ปุ่มเพิ่มห้องอาจจะอยู่ในการ RenderRooms
    // ผมจะลองมองหาปุ่ม "จัดการรูปภาพ" หรือปุ่มที่เกี่ยวข้อง
    const addBtn = page.locator('button:has-text("แก้ไขข้อมูล")').first();
    if (await addBtn.isVisible()) {
        await addBtn.click();
        console.log('ขั้นตอนที่ 8: แสดงหน้าต่างแก้ไข/เพิ่มห้องประชุม');
    }

    console.log('การแสดงขั้นตอนเสร็จสิ้น คุณสามารถลองกดต่อเองได้ในหน้าต่างนี้ครับ');
    // ไม่สั่งปิดเบราว์เซอร์ เพื่อให้คุณได้ดูและทดสอบต่อเอง
    await page.waitForTimeout(60000); 

  } catch (e) {
    console.error('การแสดงผลติดขัด:', e.message);
  }
})();