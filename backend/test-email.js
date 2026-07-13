import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const config = {
  host: process.env.SMTP_HOST || 'mail.logisaar.in',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  user: process.env.SMTP_USER || 'verify@logisaar.in',
  pass: process.env.SMTP_PASS,
  from: process.env.SMTP_FROM || 'ScanLoyal <verify@logisaar.in>'
};

console.log('=== SMTP Debugger ===');
console.log('SMTP Host:', config.host);
console.log('SMTP Port:', config.port);
console.log('SMTP User:', config.user);
console.log('SMTP From:', config.from);
console.log('Password length:', config.pass ? config.pass.length : 0);
console.log('---------------------');

if (!config.pass) {
  console.error('❌ Error: SMTP_PASS is not set in your .env file!');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: config.port === 465,
  auth: {
    user: config.user,
    pass: config.pass,
  },
  tls: {
    rejectUnauthorized: false, // Bypass SSL certificate validation issues
  },
});

console.log('Connecting to SMTP server...');

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Failed!');
    console.error('Error Details:', error);
  } else {
    console.log('✅ SMTP Connection Successful!');
    console.log('Server is ready to take our messages.');
    
    // Now try to send a test email to the user
    console.log('\nSending test email...');
    transporter.sendMail({
      from: config.from,
      to: config.user, // Send to yourself as a test
      subject: 'ScanLoyal SMTP Test',
      text: 'If you are reading this, your SMTP settings on the VPS are working perfectly!'
    }, (sendError, info) => {
      if (sendError) {
        console.error('❌ Failed to send test email!');
        console.error('Error Details:', sendError);
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
      }
    });
  }
});
