import './styles/main.css';
import { initTabs } from './modules/nav.js';
import { initAuditModal } from './modules/shared/auditModal.js';
import { checkConnection } from './modules/shared/connectionStatus.js';

document.addEventListener('DOMContentLoaded', () => {
  initAuditModal();
  initTabs();
  checkConnection();
});
