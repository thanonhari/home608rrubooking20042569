const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function generatePDF(bookingId) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    const secret = 'rru_secret_2024'; // Matches .env
    const baseUrl = 'http://localhost/thanonroom20042569/';
    const url = `${baseUrl}api/export.php?id=${bookingId}&type=invoice&token=${secret}`;
    
    console.log(`Navigating to: ${url}`);
    
    try {
        await page.goto(url, { waitUntil: 'networkidle' });
        
        const pdfPath = path.join(__dirname, '..', 'uploads', 'invoices', `BK-${bookingId.toString().padStart(6, '0')}.pdf`);
        
        // Ensure directory exists
        const dir = path.dirname(pdfPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });
        
        console.log(`PDF generated successfully: ${pdfPath}`);
    } catch (error) {
        console.error(`Error generating PDF: ${error.message}`);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

const id = process.argv[2];
if (!id) {
    console.error('Booking ID required');
    process.exit(1);
}

generatePDF(id);
