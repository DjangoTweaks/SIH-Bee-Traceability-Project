import { listHives } from '../../lib/api/hives.js';
import { logHarvest } from '../../lib/api/batches.js';
import { getDefaultCollector } from '../../lib/api/collectors.js';
import { toBatchViewModel } from '../../lib/batchViewModel.js';
import { emit, on } from '../../lib/eventBus.js';
import { todayISODate } from '../../lib/format.js';
import { goToTab } from '../nav.js';

export async function mountBeekeeperTab() {
  document.getElementById('harvest-date').value = todayISODate();
  wireForm();
  await refreshHiveSelect();
  on('hive:created', refreshHiveSelect);
  on('hive:verified', refreshHiveSelect);
}

async function refreshHiveSelect() {
  const select = document.getElementById('harvest-hive-select');
  const previous = select.value;
  const hives = await listHives();
  select.innerHTML = hives.length
    ? hives.map((h) => `<option value="${h.id}">${h.display_id} — ${h.trust_tier} (${h.location})</option>`).join('')
    : '<option value="">No hives provisioned yet</option>';
  if (previous && hives.some((h) => h.id === previous)) select.value = previous;
}

function wireForm() {
  const form = document.getElementById('form-log-harvest');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const hiveId = document.getElementById('harvest-hive-select').value;
    const qty = parseFloat(document.getElementById('harvest-qty').value);
    const harvestDate = document.getElementById('harvest-date').value;
    if (!hiveId) {
      alert('Provision a hive from the Cluster Collector tab before logging a harvest.');
      return;
    }
    if (Number.isNaN(qty) || qty <= 0) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      const collector = await getDefaultCollector();
      const batch = await logHarvest({ hiveId, quantityKg: qty, harvestDate, collectorId: collector?.id });
      const vm = toBatchViewModel(batch);
      alert(
        `Harvest Batch ${vm.batchId} logged successfully!` +
          (vm.isFlagged ? ' Yield exceeded 50kg — flagged for anomaly review.' : ' Click it in the Admin Dashboard to inspect full provenance.')
      );
      emit('batch:created', batch);
      document.getElementById('harvest-qty').value = '';
      document.getElementById('harvest-date').value = todayISODate();
      goToTab('admin');
    } catch (err) {
      alert(`Failed to log harvest: ${err.message}`);
    } finally {
      submitBtn.disabled = false;
    }
  });
}
