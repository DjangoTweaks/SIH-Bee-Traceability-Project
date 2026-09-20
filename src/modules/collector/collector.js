import { registerBeekeeper, listBeekeepers } from '../../lib/api/beekeepers.js';
import { addHive, listHives, verifyHive, previewNextHiveDisplayId } from '../../lib/api/hives.js';
import { getDefaultCollector } from '../../lib/api/collectors.js';
import { emit, on } from '../../lib/eventBus.js';
import { showStatus } from '../shared/statusBox.js';

export async function mountCollectorTab() {
  wireRegisterBeekeeperForm();
  wireAddHiveForm();
  wireVerifyHiveForm();

  await Promise.all([refreshBeekeeperSelect(), refreshVerifyHiveSelect(), refreshHivePreview()]);

  on('beekeeper:created', refreshBeekeeperSelect);
  on('hive:created', () => {
    refreshVerifyHiveSelect();
    refreshHivePreview();
  });
  on('hive:verified', refreshVerifyHiveSelect);
}

async function refreshBeekeeperSelect() {
  const select = document.getElementById('hive-beekeeper-select');
  const previous = select.value;
  const beekeepers = await listBeekeepers();
  select.innerHTML = beekeepers.length
    ? beekeepers.map((bk) => `<option value="${bk.id}">${bk.name} (${bk.display_id})</option>`).join('')
    : '<option value="">Register a beekeeper first</option>';
  if (previous && beekeepers.some((bk) => bk.id === previous)) select.value = previous;
}

async function refreshVerifyHiveSelect() {
  const select = document.getElementById('verify-hive-select');
  const previous = select.value;
  const hives = await listHives();
  select.innerHTML = hives.length
    ? hives.map((h) => `<option value="${h.id}">${h.display_id} — ${h.trust_tier} (${h.location})</option>`).join('')
    : '<option value="">No hives provisioned yet</option>';
  if (previous && hives.some((h) => h.id === previous)) select.value = previous;
}

async function refreshHivePreview() {
  const el = document.getElementById('next-hive-id-preview');
  try {
    el.textContent = await previewNextHiveDisplayId();
  } catch {
    el.textContent = 'Auto-generated';
  }
}

function wireRegisterBeekeeperForm() {
  const form = document.getElementById('form-register-beekeeper');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('bk-name').value.trim();
    const phone = document.getElementById('bk-phone').value.trim();
    const region = document.getElementById('bk-region').value.trim();
    if (!name || !phone) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      const collector = await getDefaultCollector();
      const beekeeper = await registerBeekeeper({ name, phone, region, registeredBy: collector?.id });
      showStatus('bk-status-box', `✓ Beekeeper '${beekeeper.name}' registered with phone ${beekeeper.phone} in ${beekeeper.region} (${beekeeper.display_id})`);
      document.getElementById('bk-name').value = '';
      document.getElementById('bk-phone').value = '';
      emit('beekeeper:created', beekeeper);
    } catch (err) {
      showStatus('bk-status-box', `✗ Failed to register beekeeper: ${err.message}`, { error: true });
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function wireAddHiveForm() {
  const form = document.getElementById('form-add-hive');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const select = document.getElementById('hive-beekeeper-select');
    const beekeeperId = select.value;
    if (!beekeeperId) {
      showStatus('hive-status-box', 'Register a beekeeper before provisioning a hive.', { error: true });
      return;
    }
    const beekeeperLabel = select.options[select.selectedIndex].textContent;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      const hive = await addHive({ beekeeperId });
      showStatus('hive-status-box', `✓ Generated & registered ${hive.display_id} for ${beekeeperLabel}`);
      emit('hive:created', hive);
    } catch (err) {
      showStatus('hive-status-box', `✗ Failed to add hive: ${err.message}`, { error: true });
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function wireVerifyHiveForm() {
  const form = document.getElementById('form-verify-hive');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const hiveId = document.getElementById('verify-hive-select').value;
    const trustTierRaw = document.getElementById('verify-trust-tier').value;
    const trustTier = trustTierRaw === 'Lab-verified' ? 'Lab-Verified' : 'Self-Attested';
    if (!hiveId) {
      showStatus('verify-hive-status-box', 'Select a hive to verify.', { error: true });
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      const collector = await getDefaultCollector();
      const hive = await verifyHive({ hiveId, trustTier, verifiedBy: collector?.id });
      showStatus('verify-hive-status-box', `✓ Hive sensor cryptographically verified! ${hive.display_id} is now ${hive.trust_tier}.`);
      emit('hive:verified', hive);
    } catch (err) {
      showStatus('verify-hive-status-box', `✗ Verification failed: ${err.message}`, { error: true });
    } finally {
      submitBtn.disabled = false;
    }
  });
}
