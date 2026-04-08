/**
 * One-time authentication script.
 *
 * Usage: npm run auth
 *   1. A QR code will appear in the terminal.
 *   2. Open WhatsApp on your phone → Linked Devices → Link a Device.
 *   3. Scan the QR code.
 *   4. Wait for "Authenticated!" then press Ctrl+C.
 *   5. Run: bash scripts/export_session.sh
 *
 * The session is saved to ./auth_info_baileys/ and reused by send.js.
 */

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

async function main() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', ({ connection, qr }) => {
        if (qr) {
            console.log('\n📱 Scan this QR code in WhatsApp → Linked Devices → Link a Device:\n');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'open') {
            console.log('\n✅ Authenticated! Session saved to ./auth_info_baileys/');
            console.log('👉 Press Ctrl+C, then run: bash scripts/export_session.sh\n');
        }
        if (connection === 'close') {
            console.log('🔌 Connection closed. If this was unexpected, try again.');
        }
    });
}

main().catch(console.error);
