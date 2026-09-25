export const normalizePhone = (raw: string): string => {
  const trimmed = String(raw || '').trim();
  const leading = trimmed.startsWith('+') ? '+' : '';
  return leading + trimmed.replace(/[^\d]/g, '');
};