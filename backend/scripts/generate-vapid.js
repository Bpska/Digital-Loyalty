import 'dotenv/config';
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');

async function run() {
  console.log('Generating VAPID keys...');
  const vapidKeys = webpush.generateVAPIDKeys();

  console.log('\n--- VAPID KEYS GENERATED ---');
  console.log('Public Key:\n', vapidKeys.publicKey);
  console.log('Private Key:\n', vapidKeys.privateKey);
  console.log('----------------------------\n');

  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Clean up any existing raw VAPID_ key lines
    envContent = envContent
      .split('\n')
      .filter(line => !line.startsWith('VAPID_PUBLIC_KEY=') && !line.startsWith('VAPID_PRIVATE_KEY=') && !line.startsWith('VAPID_SUBJECT='))
      .join('\n');

    const additions = `\n# ─── Web Push / VAPID ─────────────────────────────────────────\nVAPID_PUBLIC_KEY="${vapidKeys.publicKey}"\nVAPID_PRIVATE_KEY="${vapidKeys.privateKey}"\nVAPID_SUBJECT="mailto:admin@logisaar.in"`;

    fs.writeFileSync(envPath, envContent + additions, 'utf8');
    console.log('Successfully appended VAPID keys to backend/.env file!');
  } else {
    console.warn('.env file not found at:', envPath);
  }
}

run().catch(err => {
  console.error('Error generating VAPID keys:', err);
});
