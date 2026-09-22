#!/usr/bin/env node
// Dev helper: generates a QR code PNG encoding a Batch ID, for testing the
// bottle-QR upload flow on the Verification tab without a real printed label.
import QRCode from 'qrcode';

const [, , rawId, outPath] = process.argv;

if (!rawId) {
  console.error('Usage: npm run qr -- <batch-id> [output-file]');
  console.error('Example: npm run qr -- MK-8921');
  process.exit(1);
}

const batchId = rawId.trim().toUpperCase().replace(/^#/, '');
const file = outPath || `qr-${batchId}.png`;

await QRCode.toFile(file, batchId, { width: 300 });
console.log(`QR code for ${batchId} written to ${file}`);
