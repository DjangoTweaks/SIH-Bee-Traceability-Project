import { listBatches, resolveAnomalyFlag } from '../../lib/api/batches.js';
import { toBatchViewModel } from '../../lib/batchViewModel.js';
import { showBatchModal, closeAuditModal } from '../shared/auditModal.js';
import { on } from '../../lib/eventBus.js';

let batchesById = new Map();

export async function mountAdminTab() {
  document.getElementById('batches-tbody').addEventListener('click', handleTableClick);
  await refresh();
  on('batch:created', refresh);
  on('hive:verified', refresh);
}

async function refresh() {
  const tbody = document.getElementById('batches-tbody');
  const countEl = document.getElementById('batches-count');
  try {
    const rows = await listBatches();
    const vms = rows.map(toBatchViewModel);
    batchesById = new Map(vms.map((vm) => [vm.id, vm]));
    tbody.innerHTML = vms.map(renderRow).join('') || emptyRowHTML();
    countEl.textContent = `Showing ${vms.length} of ${vms.length} logged harvests`;
  } catch (err) {
    tbody.innerHTML = `<tr><td class="py-6 px-4 text-center text-rose-600" colspan="7">Failed to load batches: ${err.message}</td></tr>`;
    countEl.textContent = 'Error loading batches';
  }
}

function emptyRowHTML() {
  return `<tr><td class="py-6 px-4 text-center text-slate-400" colspan="7">No harvests logged yet. Log one from the Harvest Logging tab.</td></tr>`;
}

function renderRow(vm) {
  const rowClass = vm.isFlagged ? 'flagged-row transition-colors' : 'hover:bg-amber-50/40 transition-colors';
  const idClass = vm.isFlagged ? 'text-rose-800' : 'text-honey-800';
  const hiveNameClass = vm.isFlagged ? 'text-rose-900' : 'text-slate-900';
  const hiveLocClass = vm.isFlagged ? 'text-rose-600' : 'text-slate-500';
  const qtyClass = vm.isFlagged ? 'text-rose-900 font-bold' : 'text-slate-900';
  const kgClass = vm.isFlagged ? 'text-rose-500 font-semibold' : 'text-slate-400';
  const tierClass =
    vm.trustTier === 'Lab-Verified'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-amber-100 text-amber-800 border-amber-300';

  const statusBadge = vm.isFlagged
    ? `<button type="button" data-batch-id="${vm.id}" class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs transition cursor-pointer">
        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/></svg>Flagged
       </button>`
    : `<button type="button" data-batch-id="${vm.id}" class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer">OK</button>`;

  const auditButton = vm.isFlagged
    ? `<button type="button" data-batch-id="${vm.id}" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs hover:shadow transition cursor-pointer active:scale-[0.99]">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>Review Anomaly
       </button>`
    : `<button type="button" data-batch-id="${vm.id}" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 shadow-xs hover:shadow transition cursor-pointer active:scale-[0.99]">
        <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>Audit Passed
       </button>`;

  return `
    <tr class="${rowClass}">
      <td class="py-3.5 px-4"><button type="button" data-batch-id="${vm.id}" class="text-left group cursor-pointer"><span class="font-mono font-bold ${idClass} group-hover:underline text-sm block">${vm.batchId}</span></button></td>
      <td class="py-3.5 px-4">
        <div class="font-semibold ${hiveNameClass}">${vm.hiveId}</div>
        <div class="text-[11px] ${hiveLocClass}">${vm.hiveLocation}</div>
      </td>
      <td class="py-3.5 px-4">
        <span class="text-sm font-semibold ${qtyClass}">${vm.quantityKg.toFixed(1)}</span>
        <span class="${kgClass}">kg ${vm.isYieldSpike ? '(! Yield Spike)' : ''}</span>
      </td>
      <td class="py-3.5 px-4 text-slate-600">${vm.harvestDate}</td>
      <td class="py-3.5 px-4"><span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${tierClass}">${vm.trustTier}</span></td>
      <td class="py-3.5 px-4">${statusBadge}</td>
      <td class="py-3.5 px-4 text-right">${auditButton}</td>
    </tr>
  `;
}

function handleTableClick(event) {
  const btn = event.target.closest('[data-batch-id]');
  if (!btn) return;
  const vm = batchesById.get(btn.dataset.batchId);
  if (!vm) return;
  showBatchModal(vm, { onPrimaryAction: () => handlePrimaryAction(vm) });
}

async function handlePrimaryAction(vm) {
  if (vm.isFlagged) {
    try {
      await resolveAnomalyFlag(vm.id);
      alert(`Audit flag resolved for Batch ${vm.batchId}! Status updated to Audit Passed.`);
      closeAuditModal();
      await refresh();
    } catch (err) {
      alert(`Failed to resolve flag: ${err.message}`);
    }
  } else {
    alert(`Generating official PDF Traceability & Provenance Certificate for ${vm.batchId}... (not implemented in this prototype)`);
  }
}
