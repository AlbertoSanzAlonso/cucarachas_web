const STORAGE_PREFIX = 'cecsa_admin_read_leads';

function storageKey(userKey) {
  return `${STORAGE_PREFIX}:${userKey || 'anonymous'}`;
}

export function getAdminUserKey(user) {
  if (user?.id != null) return String(user.id);
  if (user?.email) return user.email;
  return 'anonymous';
}

export function getReadLeadIds(userKey) {
  try {
    const raw = localStorage.getItem(storageKey(userKey));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function persistReadLeadIds(userKey, ids) {
  localStorage.setItem(storageKey(userKey), JSON.stringify([...ids]));
}

export function markLeadAsRead(userKey, leadId, currentRead) {
  const next = new Set(currentRead ?? getReadLeadIds(userKey));
  next.add(String(leadId));
  persistReadLeadIds(userKey, next);
  return next;
}

export function markLeadsAsRead(userKey, leadIds, currentRead) {
  const next = new Set(currentRead ?? getReadLeadIds(userKey));
  (leadIds || []).forEach((id) => next.add(String(id)));
  persistReadLeadIds(userKey, next);
  return next;
}
