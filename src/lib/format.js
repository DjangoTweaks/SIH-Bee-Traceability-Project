export function formatDateTime(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const formatted = date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
  return `${formatted} IST`;
}

export function formatQuantity(qty) {
  const num = Number(qty);
  return `${Number.isFinite(num) ? num.toFixed(1) : '0.0'} kg`;
}

export function todayISODate() {
  return new Date().toISOString().split('T')[0];
}
