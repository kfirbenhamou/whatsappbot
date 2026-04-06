/**
 * WhatsApp bridge — called by agent/main.py via subprocess.
 * Reads MESSAGE and WIFE_PHONE from environment variables, sends the message,
 * then exits cleanly.
 *
 * Environment variables:
 *   MESSAGE     - the text to send
 *   WIFE_PHONE  - recipient in WhatsApp format, e.g. "972501234567@c.us"
 */

const { Client, LocalAuth } = require('whatsapp-web.js');

const phone   = process.env.WIFE_PHONE;
const message = process.env.MESSAGE;

if (!phone || !message) {
    console.error('❌ Missing required env vars: WIFE_PHONE and MESSAGE');
    process.exit(1);
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', () => {
    console.error('❌ Session expired — re-run auth.js locally and update WA_SESSION_B64 secret.');
    process.exit(1);
});

client.on('ready', async () => {
    try {
        await client.sendMessage(phone, message);
        console.log(`✅ Message sent to ${phone}`);
    } catch (err) {
        console.error('❌ Failed to send message:', err.message);
        process.exitCode = 1;
    } finally {
        await client.destroy();
        process.exit(process.exitCode || 0);
    }
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
    process.exit(1);
});

client.initialize();
