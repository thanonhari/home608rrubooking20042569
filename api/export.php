<?php
// api/export.php
require_once __DIR__ . '/base.php';

// Check for secret token bypass (for automated PDF generation)
$token = $_GET['token'] ?? null;
$secret = getenv('EXPORT_SECRET') ?: 'rru_secret_2024';

if ($token !== $secret) {
    requireLogin();
}

// Export All Bookings as CSV (Admin/Staff Only)
if (isset($_GET['action']) && $_GET['action'] === 'all_csv') {
    if ($token !== $secret) {
        requireRole(['admin', 'approver', 'staff']);
    }
    
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="room-bookings-export-' . date('Y-m-d') . '.csv"');
    
    // Add UTF-8 BOM for Excel
    echo "\xEF\xBB\xBF";
    
    $output = fopen('php://output', 'w');
    
    // Header
    fputcsv($output, [
        'ID', 'Title', 'Purpose Type', 'Room', 'Start', 'End', 
        'User', 'User Type', 'Org/Dept', 'Phone', 
        'Status', 'Total Amount', 'Deposit Amount', 'Payment Status', 'Created At'
    ]);
    
    $stmt = $pdo->query("
        SELECT b.id, b.title, b.purpose_type, r.name as room_name, b.start_time, b.end_time, 
               u.fullname, u.user_type, COALESCE(b.organization, b.department) as unit, b.phone,
               b.status, b.total_amount, b.deposit_amount, b.payment_status, b.created_at
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN users u ON b.user_id = u.id
        ORDER BY b.created_at DESC
    ");
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($output, $row);
    }
    
    fclose($output);
    exit;
}

$id = $_GET['id'] ?? null;
if (!$id) die("ID required");

$stmt = $pdo->prepare("
    SELECT b.*, r.name as room_name, u.fullname, u.user_type, u.organization as user_org
    FROM bookings b 
    JOIN rooms r ON b.room_id = r.id 
    JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
");
$stmt->execute([$id]);
$b = $stmt->fetch();

if (!$b) die("Booking not found");

// Check if print or invoice mode
$type = $_GET['type'] ?? '';

if ($type === 'print' || $type === 'invoice') {
    $isInvoice = ($type === 'invoice');
    ?>
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <title><?php echo $isInvoice ? 'ใบแจ้งหนี้/ยืนยันการจอง' : 'ใบขอใช้ห้องประชุม'; ?> - <?php echo $b['title']; ?></title>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Sarabun', sans-serif; line-height: 1.5; padding: 40px; color: #333; font-size: 14px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; position: relative; }
            .logo { position: absolute; left: 0; top: 0; width: 80px; }
            .header-title { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
            .header-sub { font-size: 16px; }
            
            .invoice-meta { margin-bottom: 30px; display: flex; justify-content: space-between; }
            .invoice-no { font-weight: bold; }
            
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; background: #f3f4f6; padding: 5px 10px; margin-bottom: 10px; border-left: 5px solid #333; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background: #f9fafb; }
            
            .amount-table td { text-align: right; }
            .amount-table td:first-child { text-align: left; }
            .total-row { font-weight: bold; font-size: 16px; background: #f3f4f6; }
            
            .footer { margin-top: 40px; display: flex; justify-content: space-between; }
            .footer-col { width: 45%; text-align: center; }
            .sign-line { border-bottom: 1px dotted #000; margin-top: 40px; margin-bottom: 10px; }
            
            .note { font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
            .highlight { color: #e11d48; font-weight: bold; }

            @media print { 
                .no-print { display: none; } 
                body { padding: 20px; } 
                .btn { display: none; }
            }
            .btn { padding: 10px 20px; border-radius: 8px; cursor: pointer; border: none; font-weight: bold; }
            .btn-primary { background: #4f46e5; color: white; }
        </style>
    </head>
    <body>
        <div class="header">
            <!-- <img src="assets/img/rru-logo.png" class="logo"> -->
            <div class="header-title"><?php echo $isInvoice ? 'ใบแจ้งค่าใช้จ่ายและยืนยันการจองห้องประชุม' : 'แบบฟอร์มขอใช้ห้องประชุมและสิ่งอำนวยความสะดวก'; ?></div>
            <div class="header-sub">มหาวิทยาลัยราชภัฏราชนครินทร์ (RRU)</div>
            <div>42 ถนนทหารบก ตำบลหน้าเมือง อำเภอเมือง จังหวัดฉะเชิงเทรา 24000</div>
        </div>

        <div class="invoice-meta">
            <div>
                <div class="invoice-no">เลขที่อ้างอิง: BK-<?php echo str_pad($b['id'], 6, '0', STR_PAD_LEFT); ?></div>
                <div>วันที่ออกเอกสาร: <?php echo date('d/m/Y'); ?></div>
            </div>
            <div style="text-align: right;">
                <div class="invoice-no">สถานะ: <?php echo strtoupper($b['status']); ?></div>
                <div>รหัสผู้จอง: <?php echo $b['user_id']; ?></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">ข้อมูลผู้ขอใช้บริการ</div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 250px;">
                    <div><b>ชื่อ-นามสกุล:</b> <?php echo $b['fullname']; ?></div>
                    <div><b>หน่วยงาน/องค์กร:</b> <?php echo $b['user_org'] ?: $b['department']; ?></div>
                </div>
                <div style="flex: 1; min-width: 200px;">
                    <div><b>เบอร์โทรศัพท์:</b> <?php echo $b['phone']; ?></div>
                    <div><b>ประเภทผู้ใช้งาน:</b> <?php echo strtoupper($b['user_type']); ?></div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">รายละเอียดการจอง</div>
            <table>
                <tr>
                    <th>โครงการ/งาน</th>
                    <td><?php echo $b['title']; ?></td>
                </tr>
                <tr>
                    <th>สถานที่</th>
                    <td><?php echo $b['room_name']; ?></td>
                </tr>
                <tr>
                    <th>วัน-เวลา</th>
                    <td>
                        <?php echo date('d/m/Y H:i', strtotime($b['start_time'])); ?> - 
                        <?php echo date('d/m/Y H:i', strtotime($b['end_time'])); ?>
                    </td>
                </tr>
                <tr>
                    <th>จำนวนผู้เข้าร่วม</th>
                    <td><?php echo $b['participants_count']; ?> ท่าน</td>
                </tr>
            </table>
        </div>

        <?php if ($isInvoice && $b['total_amount'] > 0): ?>
        <div class="section">
            <div class="section-title">ข้อมูลค่าใช้จ่าย</div>
            <table class="amount-table">
                <thead>
                    <tr>
                        <th>รายการ</th>
                        <th>จำนวนเงิน (บาท)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>ค่าบำรุงรักษาห้องประชุมและอุปกรณ์</td>
                        <td><?php echo number_format($b['total_amount'], 2); ?></td>
                    </tr>
                    <tr class="total-row">
                        <td>รวมทั้งสิ้น</td>
                        <td><?php echo number_format($b['total_amount'], 2); ?></td>
                    </tr>
                    <tr>
                        <td><b class="highlight">ค่ามัดจำที่ต้องชำระ (50%)</b></td>
                        <td class="highlight"><?php echo number_format($b['total_amount'] * 0.5, 2); ?></td>
                    </tr>
                </tbody>
            </table>
            <div style="text-align: right; font-style: italic;">
                (<?php 
                    // Optional: Thai Baht Text function could be added here
                    echo "--- " . number_format($b['total_amount'], 2) . " บาท ---"; 
                ?>)
            </div>
        </div>
        <?php endif; ?>

        <div class="footer">
            <div class="footer-col">
                <div class="sign-line"></div>
                <div>( .......................................................... )</div>
                <div style="margin-top: 5px;">ผู้ขอใช้บริการ</div>
                <div>วันที่ ........./........./.........</div>
            </div>
            <div class="footer-col">
                <div class="sign-line"></div>
                <div>( .......................................................... )</div>
                <div style="margin-top: 5px;">เจ้าหน้าที่ผู้อนุมัติ/ผู้รับเงิน</div>
                <div>วันที่ ........./........./.........</div>
            </div>
        </div>

        <div class="note">
            <b>หมายเหตุ:</b><br>
            1. กรุณาชำระค่ามัดจำจำนวน 50% ภายใน 3 วันหลังจากได้รับการอนุมัติ<br>
            2. หากไม่ชำระค่ามัดจำตามกำหนด มหาวิทยาลัยขอสงวนสิทธิ์ในการยกเลิกการจอง<br>
            3. กรณีมีการใช้อุปกรณ์เพิ่มเติมหรือเกินเวลาที่กำหนด จะมีการเรียกเก็บค่าใช้จ่ายเพิ่มเติมตามจริง
        </div>

        <center class="no-print" style="margin-top: 30px;">
            <button onclick="window.print()" class="btn btn-primary">พิมพ์เอกสาร (Print to PDF)</button>
            <button onclick="window.close()" class="btn">ปิดหน้าต่าง</button>
        </center>
    </body>
    </html>
    <?php
    exit;
}

// ICS File generation (default)
$start = date("Ymd\THis", strtotime($b['start_time']));
$end = date("Ymd\THis", strtotime($b['end_time']));
$stamp = date("Ymd\THis");
$uid = uniqid();
$summary = $b['title'];
$location = $b['room_name'];

header('Content-Type: text/calendar; charset=utf-8');
header('Content-Disposition: attachment; filename="booking-' . $id . '.ics"');

echo "BEGIN:VCALENDAR\r\n";
echo "VERSION:2.0\r\n";
echo "PRODID:-//RoomBooking//NONSGML v1.0//EN\r\n";
echo "BEGIN:VEVENT\r\n";
echo "UID:$uid\r\n";
echo "DTSTAMP:$stamp\r\n";
echo "DTSTART:$start\r\n";
echo "DTEND:$end\r\n";
echo "SUMMARY:$summary\r\n";
echo "LOCATION:$location\r\n";
echo "END:VEVENT\r\n";
echo "END:VCALENDAR\r\n";
exit;

