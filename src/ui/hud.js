// In-world UI: speech bubbles, the sign card, toasts and the found counter.
import * as THREE from 'three';

const $ = (id) => document.getElementById(id);
const _v = new THREE.Vector3();

export class Hud {
  constructor() {
    this.el = {
      hud: $('hud'), name: $('hud-name'), found: $('hud-found'), toast: $('toast'),
      bubble: $('bubble'), bName: $('bubble-name'), bRole: $('bubble-role'), bText: $('bubble-text'),
      sign: $('sign-card'), signText: $('sign-text'), signClose: $('sign-close'),
    };
    this.bubbleFor = null;
    this.bubbleUntil = 0;
    this.signAt = null;
    this.toastTimer = 0;
    this.el.signClose.addEventListener('click', (e) => { e.stopPropagation(); this.hideSign(); });
  }

  setWorld(name) {
    this.el.name.textContent = name;
    this.el.found.textContent = '';
    this.hideBubble(); this.hideSign();
    this.el.toast.classList.remove('on');
  }

  setFound(n, total) {
    this.el.found.textContent = total ? `${n}/${total} places found` : '';
  }

  toast(parts, ms = 3200) {
    // parts: array of strings; odd entries are bold
    const t = this.el.toast;
    t.replaceChildren(...parts.map((p, i) => (i % 2 ? Object.assign(document.createElement('b'), { textContent: p }) : document.createTextNode(p))));
    t.classList.add('on');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => t.classList.remove('on'), ms);
  }

  showBubble(local, line, now) {
    const { bubble, bName, bRole, bText } = this.el;
    bName.textContent = local.data.name;
    bRole.textContent = local.data.role || '';
    bText.textContent = line;
    this.bubbleFor = local;
    this.bubbleUntil = now + Math.max(4, Math.min(9, line.length * 0.07 + 2.5));
    bubble.classList.add('on');
  }

  hideBubble() {
    this.bubbleFor = null;
    this.el.bubble.classList.remove('on');
  }

  showSign(title, text, at) {
    this.el.signText.replaceChildren(
      Object.assign(document.createElement('strong'), { textContent: title }),
      document.createTextNode(text),
    );
    this.signAt = at ? at.clone() : null;
    this.el.sign.classList.add('on');
  }

  hideSign() {
    this.signAt = null;
    this.el.sign.classList.remove('on');
  }

  update(now, camera, locals, playerPos) {
    const l = this.bubbleFor;
    if (l) {
      const far = Math.hypot(playerPos.x - l.pos.x, playerPos.z - l.pos.z) > 10;
      if (now > this.bubbleUntil || far) this.hideBubble();
      else {
        locals.headPoint(l, _v).project(camera);
        const visible = _v.z < 1 && Math.abs(_v.x) < 1.1 && Math.abs(_v.y) < 1.2;
        const b = this.el.bubble;
        if (!visible) b.style.opacity = '0';
        else {
          b.style.opacity = '';
          const x = (_v.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-_v.y * 0.5 + 0.5) * window.innerHeight;
          const half = Math.min(140, window.innerWidth * 0.36);
          b.style.left = `${Math.max(half + 8, Math.min(window.innerWidth - half - 8, x))}px`;
          b.style.top = `${Math.max(120, y)}px`;
        }
      }
    }
    if (this.signAt && Math.hypot(playerPos.x - this.signAt.x, playerPos.z - this.signAt.z) > 9) this.hideSign();
  }
}
