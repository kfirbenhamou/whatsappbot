/**
 * WhatsApp bridge — called by agent/main.py via subprocess.
 * Reads MESSAGE and WIFE_PHONE from environment variables, sends the message,
 * then exits cleanly.
 *
 * Environment variables:
 *   MESSAGE     - the text to send
 *   WIFE_PHONE  - recipient in WhatsApp format, e.g. "972501234567@s.whatsapp.net"
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

const phone   = process.env.WIFE_PHONE;
const message = process.env.MESSAGE;

if (!phone || !message) {
    console.error('❌ Missing required env vars: WIFE_PHONE and MESSAGE');
    process.exit(1);
}

async function main() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    await new Promise((resolve, reject) => {
        sock.ev.on('connection.update', async ({ connection, qr, lastDisconnect }) => {
            if (qr) {
                reject(new Error('❌ Session expired — re-run npm run auth and update WA_SESSION_B64 secret.'));
                return;
            }

            if (connection === 'open') {
                console.log('🔐 Connected to WhatsApp. Sending message...');
                try {
                    await sock.sendMessage(phone, { text: message });
                    console.log(`✅ Message sent to ${phone}: "${message}"`);
                    await sock.end();
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                if (statusCode === DisconnectReason.loggedOut) {
                    reject(new Error('❌ Logged out — re-run npm run auth and update WA_SESSION_B64 secret.'));
                } else {
                    reject(new Error(`❌ Connection closed: ${lastDisconnect?.error?.message}`));
                }
            }
        });
    });
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err.message);
        process.exit(1);
    });
