import './styles/main.css';
import { isSupabaseConfigured } from './lib/supabaseClient.js';
import { initTabs } from './modules/nav.js';
import { initAuditModal } from './modules/shared/auditModal.js';
import { checkConnection } from './modules/shared/connectionStatus.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!isSupabaseConfigured) {
    document.getElementById('config-warning-banner')?.classList.remove('hidden');
  }
  initAuditModal();
  initTabs();
  checkConnection();
});
