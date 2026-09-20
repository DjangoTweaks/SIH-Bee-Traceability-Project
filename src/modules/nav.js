import { mountAdminTab } from './admin/admin.js';
import { mountCollectorTab } from './collector/collector.js';
import { mountBeekeeperTab } from './beekeeper/beekeeper.js';
import { mountVerificationTab } from './verification/verification.js';

const ACTIVE_CLASS =
  'px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 text-honey-700 bg-honey-50 border border-honey-200/80 shadow-xs';
const INACTIVE_CLASS =
  'px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100';

const TABS = {
  admin: { sectionId: 'section-admin', mount: mountAdminTab },
  beekeeper: { sectionId: 'section-beekeeper', mount: mountBeekeeperTab },
  collector: { sectionId: 'section-collector', mount: mountCollectorTab },
  verification: { sectionId: 'section-verification', mount: mountVerificationTab },
};

const mountedTabs = new Set();

export function goToTab(tabName) {
  if (!TABS[tabName]) return;

  Object.entries(TABS).forEach(([name, cfg]) => {
    document.getElementById(cfg.sectionId)?.classList.toggle('hidden', name !== tabName);
    const btn = document.getElementById(`tab-${name}`);
    if (btn) btn.className = name === tabName ? ACTIVE_CLASS : INACTIVE_CLASS;
  });

  if (!mountedTabs.has(tabName)) {
    mountedTabs.add(tabName);
    TABS[tabName].mount(document.getElementById(TABS[tabName].sectionId));
  }
}

export function initTabs() {
  Object.keys(TABS).forEach((name) => {
    document.getElementById(`tab-${name}`)?.addEventListener('click', () => goToTab(name));
  });
  goToTab('admin');
}
