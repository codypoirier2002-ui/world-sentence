// The gallery of worlds you've made, kept in this browser's localStorage.
// Storage can be missing or full (private mode, Safari quotas), so every
// access is guarded and the app keeps working without it.
const KEY = 'ws-gallery-v1';
const MAX = 40;

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((e) => e && e.id && e.recipe) : [];
  } catch {
    return [];
  }
}

function write(list) {
  let l = list.slice(0, MAX);
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      localStorage.setItem(KEY, JSON.stringify(l));
      return true;
    } catch {
      // full: drop thumbnails of the oldest half first, then the oldest worlds
      const withThumb = l.filter((e) => e.thumb);
      if (withThumb.length > l.length / 2) for (const e of withThumb.slice(Math.floor(withThumb.length / 2))) delete e.thumb;
      else l = l.slice(0, Math.max(1, Math.floor(l.length * 0.75)));
    }
  }
  return false;
}

export const gallery = {
  list() { return read().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)); },
  get(id) { return read().find((e) => e.id === id) || null; },
  count() { return read().length; },
  save(entry) {
    const list = read().filter((e) => e.id !== entry.id);
    list.unshift({ ...entry, updatedAt: Date.now() });
    return write(list);
  },
  update(id, patch) {
    const list = read();
    const i = list.findIndex((e) => e.id === id);
    if (i < 0) return false;
    list[i] = { ...list[i], ...patch, updatedAt: Date.now() };
    return write(list);
  },
  remove(id) { return write(read().filter((e) => e.id !== id)); },
};

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
