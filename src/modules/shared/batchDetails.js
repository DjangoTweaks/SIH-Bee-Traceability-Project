// Renders the rich audit-detail body shared by the Admin Dashboard modal and
// the consumer-facing Batch Verification "view full trail" action.
export function renderBatchDetailsHTML(vm) {
  const bannerClasses = vm.isFlagged
    ? 'bg-rose-50 border-rose-200 text-rose-900'
    : 'bg-emerald-50/80 border-emerald-200 text-emerald-900';
  const badgeClasses = vm.isFlagged ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white shadow-xs';
  const tierClasses =
    vm.trustTier === 'Lab-Verified'
      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
      : 'bg-amber-100 text-amber-800 border border-amber-300';
  const yieldClasses = vm.isFlagged ? 'text-rose-700' : 'text-emerald-700';
  const descriptionClasses = vm.isFlagged ? 'text-rose-800' : 'text-emerald-800';

  return `
    <div class="p-4 rounded-xl border ${bannerClasses}">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${badgeClasses}">
            ${vm.isFlagged ? '⚠️ ' + vm.status : '✓ ' + vm.status}
          </span>
          <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${tierClasses}">
            Tier: ${vm.trustTier}
          </span>
        </div>
        <span class="text-[11px] font-mono font-medium ${yieldClasses}">Yield: ${vm.quantity}</span>
      </div>
      <p class="text-xs leading-relaxed ${descriptionClasses}">${vm.statusDescription}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
      <div class="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
        <div class="flex items-center gap-2 pb-2 border-b border-slate-200">
          <div class="w-6 h-6 rounded-md bg-honey-100 text-honey-800 flex items-center justify-center font-bold text-xs">🐝</div>
          <div>
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider">Beekeeper Details</h4>
            <p class="text-[10px] text-slate-400">Hive Owner &amp; Producer</p>
          </div>
        </div>
        <div class="space-y-1.5 pt-1 text-xs">
          <div class="flex justify-between">
            <span class="text-slate-500">Name:</span>
            <span class="font-bold text-slate-900">${vm.beekeeper.name} <span class="text-honey-700 font-mono">(${vm.beekeeper.id})</span></span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Phone:</span>
            <a href="tel:${vm.beekeeper.phone}" class="font-semibold text-slate-800 hover:text-honey-700 font-mono">${vm.beekeeper.phone}</a>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Hive ID:</span>
            <span class="font-mono font-bold text-honey-800 bg-honey-50 px-1.5 py-0.5 rounded border border-honey-200">${vm.hiveId}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Location:</span>
            <span class="font-medium text-slate-700 text-right text-[11px] max-w-[180px] truncate">${vm.hiveLocation}</span>
          </div>
        </div>
      </div>

      <div class="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
        <div class="flex items-center gap-2 pb-2 border-b border-slate-200">
          <div class="w-6 h-6 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">📋</div>
          <div>
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider">Cluster Collector</h4>
            <p class="text-[10px] text-slate-400">Regional Verification Lead</p>
          </div>
        </div>
        <div class="space-y-1.5 pt-1 text-xs">
          <div class="flex justify-between">
            <span class="text-slate-500">Collector:</span>
            <span class="font-bold text-slate-900">${vm.collector.name}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Designation:</span>
            <span class="font-medium text-slate-700 text-right text-[11px]">${vm.collector.role}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Zone / Hub:</span>
            <span class="font-medium text-slate-800">${vm.collector.zone} (<span class="font-semibold text-honey-800">${vm.collector.hub}</span>)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Coordinator Cell:</span>
            <a href="tel:${vm.collector.contact}" class="font-semibold text-slate-800 hover:text-honey-700 font-mono">${vm.collector.contact}</a>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-amber-50/40 p-4 rounded-xl border border-amber-200/70 space-y-2.5">
      <div class="flex items-center justify-between pb-1.5 border-b border-amber-200/50">
        <span class="font-bold text-amber-950 text-xs uppercase tracking-wider">Traceability Chain &amp; Audit Log</span>
        <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          Cryptographically Attested
        </span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <span class="text-slate-500 block text-[11px]">Harvest Timestamp:</span>
          <span class="font-semibold text-slate-800">${vm.harvestTimestamp}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px]">Verification Timestamp:</span>
          <span class="font-semibold text-slate-800">${vm.verificationTimestamp}</span>
        </div>
      </div>
      <div class="pt-1">
        <span class="text-slate-500 block text-[10px] uppercase font-semibold">Digital Cryptographic Signature / Hash:</span>
        <div class="bg-white/80 p-2 rounded-lg border border-amber-200 font-mono text-[10px] text-slate-600 break-all select-all flex items-center justify-between gap-2 mt-0.5">
          <span>${vm.cryptoHash}</span>
          <button type="button" class="copy-hash-btn text-honey-700 hover:text-honey-900 shrink-0 font-sans font-semibold text-[11px] px-1.5 py-0.5 bg-amber-50 rounded hover:bg-amber-100 transition" data-hash="${vm.cryptoHash}">Copy</button>
        </div>
      </div>
    </div>
  `;
}

export function wireCopyHashButton(container) {
  const btn = container.querySelector('.copy-hash-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.hash);
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 1500);
    } catch {
      btn.textContent = 'Copy failed';
    }
  });
}
