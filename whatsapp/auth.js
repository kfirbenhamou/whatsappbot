/**
 * Run this ONCE locally to authenticate with WhatsApp.
 * It will display a QR code in the terminal — scan it with your WhatsApp.
 * The session is saved to .wwebjs_auth/ and you then base64-encode it
 * to store as a GitHub Actions secret (WA_SESSION_B64).
 *
 * Usage:
 *   npm run auth
 *
 * After the "Client is ready!" message appears, press Ctrl+C.
 * Then run:
 *   tar -czf session.tar.gz .wwebjs_auth/
 *   base64 -i session.tar.gz | pbcopy   (macOS — copies to clipboard)
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('\n📱 Scan this QR code with WhatsApp on your phone:\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\n✅ Client is ready! Session saved to .wwebjs_auth/');
    console.log('You can now Ctrl+C and follow the instructions at the top of this file.\n');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
    process.exit(1);
});

client.initialize();
