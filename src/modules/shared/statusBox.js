const timers = new Map();

const SUCCESS_CLASSES = ['bg-emerald-50', 'border-emerald-200', 'text-emerald-800'];
const ERROR_CLASSES = ['bg-rose-50', 'border-rose-200', 'text-rose-800'];

export function showStatus(elementId, message, { error = false, duration = 5000 } = {}) {
  const box = document.getElementById(elementId);
  if (!box) return;

  box.textContent = message;
  box.classList.remove('hidden', ...SUCCESS_CLASSES, ...ERROR_CLASSES);
  box.classList.add(...(error ? ERROR_CLASSES : SUCCESS_CLASSES));

  clearTimeout(timers.get(elementId));
  timers.set(elementId, setTimeout(() => box.classList.add('hidden'), duration));
}
