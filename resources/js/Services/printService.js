import qz from 'qz-tray';

let connected = false;

export async function connectPrinter() {
    if (qz.websocket.isActive()) {
        connected = true;
        return;
    }

    try {
        // ── Bypass certificate untuk localhost ──
        qz.security.setCertificatePromise(function(callback) {
            callback();
        });

        // ── Bypass sign promise ──
        qz.security.setSignaturePromise(function(toSign) {
            return function(callback) {
                callback("");
            };
        });

        await qz.websocket.connect();
        connected = true;
    } catch (err) {
        connected = false;
        throw new Error('QZ Tray belum aktif. Silakan buka aplikasi QZ Tray terlebih dahulu.');
    }
}

export async function disconnectPrinter() {
    if (qz.websocket.isActive()) {
        await qz.websocket.disconnect();
        connected = false;
    }
}

export function isConnected() {
    return connected && qz.websocket.isActive();
}

export async function getAvailablePrinters() {
    if (!qz.websocket.isActive()) {
        throw new Error('QZ Tray tidak aktif.');
    }
    return await qz.printers.find();
}

export async function getDefaultPrinter() {
    const printers = await getAvailablePrinters();
    if (!printers || printers.length === 0) {
        throw new Error('Tidak ada printer yang ditemukan. Pastikan printer sudah terhubung.');
    }
    const excluded = ['microsoft', 'pdf', 'onenote', 'notes', 'fax', 'xps'];
    const thermal = printers.find((p) =>
        p.name && !excluded.some((e) => p.name.toLowerCase().includes(e))
    );
    if (!thermal) {
        throw new Error('Printer thermal tidak ditemukan. Cek console (F12) untuk daftar printer.');
    }
    return thermal;
}

export async function printReceipt(base64Data, printerName = null) {
    if (!qz.websocket.isActive()) {
        throw new Error('QZ Tray tidak aktif. Silakan buka QZ Tray terlebih dahulu.');
    }

    let printer;
    if (printerName) {
        const printers = await getAvailablePrinters();
        printer = printers.find((p) => p.name === printerName);
        if (!printer) {
            throw new Error(`Printer "${printerName}" tidak ditemukan.`);
        }
    } else {
        printer = await getDefaultPrinter();
    }

    const config = qz.configs.create(printer, { type: 'raw' });
    const bytes = base64ToBytes(base64Data);
    const data = [{ data: bytes, options: { type: 'raw' } }];

    await qz.print(config, data);
}

function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
