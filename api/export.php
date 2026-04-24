<?php
// api/export.php
require_once __DIR__ . '/base.php';

requireLogin();

// Export All Bookings as CSV (Admin/Staff Only)
if (isset($_GET['action']) && $_GET['action'] === 'all_csv') {
    requireRole(['admin', 'approver', 'staff']);
    
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
    SELECT b.*, r.name as room_name 
    FROM bookings b 
    JOIN rooms r ON b.room_id = r.id 
    WHERE b.id = ?
");
$stmt->execute([$id]);
$b = $stmt->fetch();

if (!$b) die("Booking not found");

// Check if print mode
if (isset($_GET['type']) && $_GET['type'] === 'print') {
    ?>
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <title>ใบขอใช้ห้องประชุม - <?php echo $b['title']; ?></title>
        <style>
            @font-face { font-family: 'Sarabun'; src: url('https://cdn.jsdelivr.net/font-sarabun/1.0.0/Sarabun-Regular.ttf'); }
            body { font-family: 'Sarabun', sans-serif; line-height: 1.6; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .section { margin-bottom: 25px; }
            .section-title { font-weight: bold; border-left: 4px solid #4f46e5; padding-left: 10px; margin-bottom: 15px; color: #4f46e5; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .item { margin-bottom: 10px; }
            .label { font-weight: bold; color: #666; }
            .footer { margin-top: 50px; text-align: right; }
            .sign-area { margin-top: 60px; display: inline-block; width: 250px; border-bottom: 1px dotted #000; text-align: center; }
            @media print { .no-print { display: none; } body { padding: 0; } }
        </style>
    </head>
    <body onload="window.print()">
        <div class="header">
            <div class="title">แบบฟอร์มขอใช้ห้องประชุมและสิ่งอำนวยความสะดวก</div>
            <div>มหาวิทยาลัยราชภัฏราชนครินทร์ (RRU)</div>
        </div>

        <div class="section">
            <div class="section-title">ข้อมูลโครงการ / งาน</div>
            <div class="item"><span class="label">ชื่อโครงการ:</span> <?php echo $b['title']; ?></div>
            <div class="grid">
                <div class="item"><span class="label">สถานที่:</span> <?php echo $b['room_name']; ?></div>
                <div class="item"><span class="label">จำนวนผู้เข้าร่วม:</span> <?php echo $b['participants_count']; ?> ท่าน</div>
            </div>
            <div class="grid">
                <div class="item"><span class="label">เริ่มเวลา:</span> <?php echo date('d/m/Y H:i', strtotime($b['start_time'])); ?></div>
                <div class="item"><span class="label">สิ้นสุดเวลา:</span> <?php echo date('d/m/Y H:i', strtotime($b['end_time'])); ?></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">ข้อมูลผู้ประสานงาน</div>
            <div class="grid">
                <div class="item"><span class="label">ผู้แจ้ง:</span> <?php echo $b['fullname'] ?: $b['username']; ?></div>
                <div class="item"><span class="label">ตำแหน่ง:</span> <?php echo $b['position']; ?></div>
            </div>
            <div class="grid">
                <div class="item"><span class="label">หน่วยงาน/สังกัด:</span> <?php echo $b['department']; ?></div>
                <div class="item"><span class="label">โทรศัพท์:</span> <?php echo $b['phone']; ?></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">การจัดเตรียมสถานที่และอุปกรณ์</div>
            <div class="grid">
                <div class="item"><span class="label">รูปแบบห้อง:</span> แบบ <?php echo $b['room_layout']; ?></div>
                <div class="item">
                    <span class="label">อุปกรณ์:</span> 
                    <?php 
                        $eq = [];
                        if ($b['equip_audio']) $eq[] = "เครื่องเสียง";
                        if ($b['equip_projector']) $eq[] = "โปรเจคเตอร์";
                        if ($b['equip_visualizer']) $eq[] = "วิชวลไลเซอร์";
                        echo implode(", ", $eq) ?: "-";
                    ?>
                </div>
            </div>
            <div class="grid">
                <div class="item"><span class="label">ผู้เข้าร่วม:</span> <?php echo $b['setup_participants']; ?> ที่นั่ง</div>
                <div class="item"><span class="label">วิทยากร:</span> <?php echo $b['setup_speakers']; ?> ท่าน</div>
            </div>
        </div>

        <div class="footer">
            <div style="margin-bottom: 20px;">ลงชื่อ..........................................................ผู้ขอใช้</div>
            <div>( <?php echo $b['fullname'] ?: $b['username']; ?> )</div>
            <div style="margin-top: 10px;">วันที่ <?php echo date('d/m/Y'); ?></div>
        </div>

        <center class="no-print" style="margin-top: 50px;">
            <button onclick="window.print()" class="btn">พิมพ์หน้านี้ (Print to PDF)</button>
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
