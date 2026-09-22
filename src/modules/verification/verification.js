import jsQR from 'jsqr';
import { getBatchByDisplayId } from '../../lib/api/batches.js';
import { toBatchViewModel } from '../../lib/batchViewModel.js';
import { showBatchModal } from '../shared/auditModal.js';

export async function mountVerificationTab() {
  const input = document.getElementById('verify-batch-input');
  const btn = document.getElementById('verify-batch-btn');
  const qrUpload = document.getElementById('verify-qr-upload');

  const run = () => runLookup(input.value);
  btn.addEventListener('click', run);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      run();
    }
  });

  qrUpload.addEventListener('change', async () => {
    const file = qrUpload.files?.[0];
    if (!file) return;
    try {
      const decodedText = await decodeQRImage(file);
      const batchId = extractBatchId(decodedText);
      if (!batchId) {
        document.getElementById('verification-result').innerHTML = messageCardHTML(
          `QR code scanned, but it doesn't contain a recognizable Batch ID ("${decodedText}").`,
          true
        );
        return;
      }
      input.value = batchId;
      await runLookup(batchId);
    } catch (err) {
      document.getElementById('verification-result').innerHTML = messageCardHTML(`Could not read QR code: ${err.message}`, true);
    } finally {
      qrUpload.value = '';
    }
  });

  // Pre-populate with the example batch shown as placeholder text.
  await runLookup(input.value);
}

// Batch IDs are printed on the bottle as "MK-XXXX" (optionally "#"-prefixed),
// and may be embedded inside a longer QR payload (e.g. a verification URL),
// so pull just that token out rather than requiring an exact match.
function extractBatchId(decodedText) {
  const match = decodedText.match(/#?MK-?\d+/i);
  return match ? match[0].replace(/^#/, '').toUpperCase() : null;
}

function decodeQRImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height);
      URL.revokeObjectURL(image.src);
      if (!result) {
        reject(new Error('No QR code detected in the image.'));
        return;
      }
      resolve(result.data);
    };
    image.onerror = () => reject(new Error('Could not read the uploaded file as an image.'));
    image.src = URL.createObjectURL(file);
  });
}

async function runLookup(rawValue) {
  const container = document.getElementById('verification-result');
  const code = rawValue.trim().toUpperCase();

  if (!code) {
    container.innerHTML = messageCardHTML('Please enter a valid Batch ID (e.g. MK-8921)');
    return;
  }

  container.innerHTML = messageCardHTML('Looking up batch…');

  try {
    const batch = await getBatchByDisplayId(code);
    if (!batch) {
      container.innerHTML = messageCardHTML(`No batch found for "${code}". Double-check the ID printed on the bottle.`, true);
      return;
    }
    const vm = toBatchViewModel(batch);
    container.innerHTML = renderTraceabilityCard(vm);
    document.getElementById('view-full-trail-btn')?.addEventListener('click', () => {
      showBatchModal(vm, {
        onPrimaryAction: () =>
          alert(`Generating official PDF Traceability & Provenance Certificate for ${vm.batchId}... (not implemented in this prototype)`),
      });
    });
  } catch (err) {
    container.innerHTML = messageCardHTML(`Lookup failed: ${err.message}`, true);
  }
}

function messageCardHTML(message, isError = false) {
  return `
    <div class="border ${isError ? 'border-rose-200 bg-rose-50/60 text-rose-800' : 'border-slate-200 bg-slate-50 text-slate-500'} rounded-2xl p-6 text-center text-sm">
      ${message}
    </div>
  `;
}

function renderTraceabilityCard(vm) {
  const authenticityLabel = vm.isFlagged ? 'Flagged for Anomaly Investigation' : 'Authentic Raw Forest Honey';
  const iconWrapClass = vm.isFlagged ? 'bg-rose-500' : 'bg-emerald-500';

  return `
    <div class="border ${vm.isFlagged ? 'border-rose-200 bg-rose-50/50' : 'border-emerald-200 bg-emerald-50/50'} rounded-2xl p-6 space-y-4" id="verification-card">
      <div class="flex items-center justify-between pb-3 border-b ${vm.isFlagged ? 'border-rose-100' : 'border-emerald-100'}">
        <div class="flex items-center space-x-2">
          <span class="p-1 rounded-full ${iconWrapClass} text-white">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
          </span>
          <span class="font-bold text-slate-900 text-sm">${authenticityLabel}</span>
        </div>
        <span class="font-mono text-xs font-bold text-slate-500">${vm.batchId}</span>
      </div>

      <div class="space-y-3 pt-2">
        <div class="flex items-start gap-3">
          <span class="w-2.5 h-2.5 mt-1.5 rounded-full bg-honey-600 shrink-0"></span>
          <div>
            <p class="text-xs font-semibold text-slate-800">Beekeeper: ${vm.beekeeper.name} (ID: ${vm.beekeeper.id})</p>
            <p class="text-[11px] text-slate-500">Region: ${vm.beekeeper.region}</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <span class="w-2.5 h-2.5 mt-1.5 rounded-full bg-honey-600 shrink-0"></span>
          <div>
            <p class="text-xs font-semibold text-slate-800">Hive: ${vm.hiveId}</p>
            <p class="text-[11px] text-slate-500">Extracted: ${vm.harvestDate} | Weight: ${vm.quantity}</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <span class="w-2.5 h-2.5 mt-1.5 rounded-full bg-honey-600 shrink-0"></span>
          <div><p class="text-xs font-semibold text-slate-800">Purity Tier: ${vm.trustTier}</p></div>
        </div>
      </div>

      <div class="pt-2 text-right">
        <button type="button" id="view-full-trail-btn" class="text-xs font-semibold text-honey-700 hover:text-honey-900 underline underline-offset-2">
          View full audit trail →
        </button>
      </div>
    </div>
  `;
}
