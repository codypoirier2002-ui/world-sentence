// The "Your worlds" screen.
import { gallery } from '../store.js';

const $ = (id) => document.getElementById(id);

function when(ts) {
  const d = (Date.now() - ts) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)} min ago`;
  if (d < 86400) return `${Math.floor(d / 3600)} h ago`;
  return new Date(ts).toLocaleDateString();
}

export class GalleryView {
  constructor({ onOpen, onClose }) {
    this.el = $('gallery');
    this.list = $('gallery-list');
    this.empty = $('gallery-empty');
    this.onOpen = onOpen;
    this.onClose = onClose;
    $('gallery-close').addEventListener('click', () => this.hide());
    this.el.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.hide(); });
  }

  show() {
    this.render();
    this.el.classList.add('show');
    $('gallery-close').focus({ preventScroll: true });
  }

  hide() {
    this.el.classList.remove('show');
    this.onClose?.();
  }

  render() {
    const items = gallery.list();
    this.empty.style.display = items.length ? 'none' : '';
    this.list.replaceChildren(...items.map((e) => this.card(e)));
  }

  card(e) {
    const btn = document.createElement('button');
    btn.className = 'g-item';
    btn.type = 'button';
    btn.setAttribute('aria-label', `Open ${e.name}`);
    if (e.thumb && /^data:image\/(jpeg|png|webp);base64,/.test(e.thumb)) {
      const img = document.createElement('img');
      img.src = e.thumb; img.alt = ''; img.loading = 'lazy';
      btn.append(img);
    } else btn.append(Object.assign(document.createElement('div'), { className: 'g-ph' }));
    const meta = document.createElement('div');
    const found = e.found?.length && e.total ? ` · ${e.found.length}/${e.total} found` : '';
    meta.append(
      Object.assign(document.createElement('b'), { textContent: e.name }),
      Object.assign(document.createElement('small'), { textContent: `“${e.sentence}”` }),
      Object.assign(document.createElement('small'), { className: 'g-when', textContent: `${e.received ? 'received ' : ''}${when(e.createdAt || e.updatedAt)}${found}` }),
    );
    btn.append(meta);
    btn.addEventListener('click', () => { this.el.classList.remove('show'); this.onOpen?.(e); });
    const del = document.createElement('span');
    del.className = 'g-del';
    del.setAttribute('role', 'button');
    del.setAttribute('aria-label', `Delete ${e.name}`);
    del.tabIndex = 0;
    del.textContent = '✕';
    const kill = (ev) => {
      ev.stopPropagation();
      if (!window.confirm(`Delete ${e.name}? Its locals will not be informed.`)) return;
      gallery.remove(e.id);
      this.render();
      this.onClose?.(true);
    };
    del.addEventListener('click', kill);
    del.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') kill(ev); });
    btn.append(del);
    return btn;
  }
}
