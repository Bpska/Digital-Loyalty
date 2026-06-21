import PDFDocument from 'pdfkit';

/**
 * Generates a beautiful, printable A4 PDF poster containing the branch QR code
 * and customer check-in instructions.
 *
 * @param businessName  - Name of the business tenant
 * @param branchName    - Name of the physical outlet branch
 * @param branchAddress - Location address of the branch
 * @param qrBuffer      - PNG Buffer of the generated QR code
 * @returns Buffer containing the raw PDF bytes
 */
export async function generateQrPdf(
  businessName,
  branchName,
  branchAddress,
  qrBuffer
) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // ── Page Borders ───────────────────────────────────────────
      // Outer dark border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(3)
        .strokeColor('#1e1b4b') // Indigo-950
        .stroke();

      // Inner subtle border
      doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50)
        .lineWidth(1)
        .strokeColor('#c7d2fe') // Indigo-200
        .stroke();

      // ── Top Header Banner ──────────────────────────────────────
      const bannerHeight = 110;
      doc.rect(26, 26, doc.page.width - 52, bannerHeight)
        .fillColor('#09090b') // Zinc-950
        .fill();

      // Business Name
      doc.fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(26)
        .text(businessName.toUpperCase(), 40, 45, { align: 'center', width: doc.page.width - 80 });

      // Branch Name
      doc.fillColor('#818cf8') // Indigo-400
        .font('Helvetica-Bold')
        .fontSize(14)
        .text(branchName, 40, 80, { align: 'center', width: doc.page.width - 80 });

      // Branch Address
      if (branchAddress) {
        doc.fillColor('#a1a1aa') // Zinc-400
          .font('Helvetica')
          .fontSize(9)
          .text(branchAddress, 40, 102, { align: 'center', width: doc.page.width - 80 });
      }

      // ── Sub-header Call to Action ──────────────────────────────
      doc.fillColor('#0f172a') // Slate-900
        .font('Helvetica-Bold')
        .fontSize(20)
        .text('SCAN TO EARN LOYALTY POINTS', 40, 165, { align: 'center', width: doc.page.width - 80 });

      doc.fillColor('#475569') // Slate-600
        .font('Helvetica')
        .fontSize(11)
        .text('Scan this QR code with your phone camera to check-in and earn stamps!', 40, 192, { align: 'center', width: doc.page.width - 80 });

      // ── QR Code Rendering ──────────────────────────────────────
      const qrWidth = 240;
      const qrX = (doc.page.width - qrWidth) / 2;
      const qrY = 225;

      // Draw light background card behind the QR code
      doc.rect(qrX - 15, qrY - 15, qrWidth + 30, qrWidth + 30)
        .lineWidth(1)
        .strokeColor('#f1f5f9')
        .fillColor('#ffffff')
        .fillAndStroke();

      // Embed the QR Code image buffer
      doc.image(qrBuffer, qrX, qrY, { width: qrWidth, height: qrWidth });

      // Draw "LS" logo in the center of the QR code
      const logoSize = 34;
      const logoX = qrX + (qrWidth - logoSize) / 2;
      const logoY = qrY + (qrWidth - logoSize) / 2;

      // Draw a white rectangle with a border in the center
      doc.roundedRect(logoX, logoY, logoSize, logoSize, 6)
        .fillColor('#ffffff')
        .strokeColor('#FF6A00')
        .lineWidth(1.5)
        .fillAndStroke();

      // Draw "LS" text inside the white rectangle
      doc.fillColor('#FF6A00')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('LS', logoX, logoY + 10, { align: 'center', width: logoSize });

      // ── Instructions Panel ─────────────────────────────────────
      const ibY = 505;
      const ibWidth = doc.page.width - 120;
      const ibHeight = 195;

      // Fill instructions background card
      doc.roundedRect(60, ibY, ibWidth, ibHeight, 8)
        .fillColor('#f8fafc') // Slate-50
        .fill()
        .lineWidth(1)
        .strokeColor('#e2e8f0') // Slate-200
        .stroke();

      // Panel Header
      doc.fillColor('#0f172a') // Slate-900
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('CUSTOMER CHECK-IN INSTRUCTIONS', 80, ibY + 15, { align: 'left' });

      // Step-by-Step details
      const steps = [
        '1. Open your mobile phone camera or any QR reader application.',
        '2. Scan the QR code and tap the link to open the Loyalty PWA.',
        '3. Sign in to your account (or register if it is your first time).',
        '4. Grant location permission when prompted to verify your physical presence.',
        '5. Earn loyalty points instantly and track your rewards progress!'
      ];

      let stepY = ibY + 40;
      steps.forEach((step, idx) => {
        // Highlight the final step in Indigo for visual appeal
        const isFinal = idx === 4;
        doc.fillColor(isFinal ? '#4f46e5' : '#334155');
        doc.font(isFinal ? 'Helvetica-Bold' : 'Helvetica');
        doc.fontSize(9.5);
        
        doc.text(step, 80, stepY, { width: ibWidth - 40 });
        stepY += doc.font('Helvetica').fontSize(9.5).currentLineHeight() + 10;
      });

      // ── Footer ──────────────────────────────────────────────────
      doc.fillColor('#94a3b8') // Slate-400
        .font('Helvetica')
        .fontSize(8.5)
        .text('Powered by Logisaar Loyalty SaaS', 40, doc.page.height - 50, { align: 'center', width: doc.page.width - 80 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
