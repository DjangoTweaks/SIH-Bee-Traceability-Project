import { renderBatchDetailsHTML, wireCopyHashButton } from './batchDetails.js';

let currentOnPrimaryAction = null;
let initialized = false;

function getEls() {
  return {
    modal: document.getElementById('batch-modal'),
    card: document.getElementById('batch-modal-card'),
    tagBadge: document.getElementById('modal-batch-tag'),
    content: document.getElementById('modal-content'),
    primaryBtn: document.getElementById('modal-primary-btn'),
    ledgerState: document.getElementById('modal-ledger-state'),
  };
}

function open() {
  const { modal, card } = getEls();
  modal.classList.remove('hidden');
  requestAnimationFrame(() => {
    card.classList.remove('scale-95', 'opacity-0');
    card.classList.add('scale-100', 'opacity-100');
  });
}

export function closeAuditModal() {
  const { modal, card } = getEls();
  card.classList.remove('scale-100', 'opacity-100');
  card.classList.add('scale-95', 'opacity-0');
  setTimeout(() => modal.classList.add('hidden'), 150);
}

function applyFooterState(vm) {
  const { primaryBtn, ledgerState } = getEls();
  if (vm.isFlagged) {
    ledgerState.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span><span class="text-rose-700 font-semibold">Flagged for Verification Inspection</span>`;
    primaryBtn.className =
      'px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs rounded-xl cursor-pointer transition active:scale-[0.99] flex items-center gap-1.5';
    primaryBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>Resolve Anomaly Flag`;
  } else {
    ledgerState.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span><span>Network Block #4289 • Verified Pure</span>`;
    primaryBtn.className =
      'px-4 py-2.5 text-xs font-semibold text-white bg-honey-700 hover:bg-honey-800 shadow-xs rounded-xl cursor-pointer transition active:scale-[0.99] flex items-center gap-1.5';
    primaryBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Download Traceability Report`;
  }
}

export function showBatchModal(vm, { onPrimaryAction } = {}) {
  const { tagBadge, content } = getEls();
  tagBadge.textContent = vm.batchId;
  content.innerHTML = renderBatchDetailsHTML(vm);
  wireCopyHashButton(content);
  applyFooterState(vm);
  currentOnPrimaryAction = onPrimaryAction || null;
  open();
}

// Wires the modal chrome (close buttons, backdrop click) exactly once. This
// modal is shared global UI, mounted from main.js rather than owned by any
// single tab module.
export function initAuditModal() {
  if (initialized) return;
  initialized = true;

  const { modal, primaryBtn } = getEls();
  document.getElementById('modal-close-btn').addEventListener('click', closeAuditModal);
  document.getElementById('modal-close-footer-btn').addEventListener('click', closeAuditModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeAuditModal();
  });
  primaryBtn.addEventListener('click', () => currentOnPrimaryAction?.());
}
