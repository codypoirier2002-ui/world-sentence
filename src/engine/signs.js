// Wooden signs with text painted onto a canvas texture.
import * as THREE from 'three';
import { Geo } from '../kit/builder.js';

function wrap(ctx, text, maxW) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export function signTexture(text, { title = '', w = 512, h = 256, bg = '#e8d3a6', fg = '#3a2814', plank = true, neon = false } = {}) {
  if (typeof document === 'undefined') return new THREE.Texture(); // headless (tests)
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  if (plank) {
    ctx.strokeStyle = 'rgba(80, 50, 20, 0.18)';
    ctx.lineWidth = 3;
    for (let y = h / 3; y < h; y += h / 3) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(70, 40, 15, 0.55)';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, w - 10, h - 10);
  }
  const pad = w * 0.07;
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (neon) { ctx.shadowColor = fg; ctx.shadowBlur = 18; }
  let titleSize = 0;
  if (title) {
    titleSize = Math.round(h * 0.2);
    ctx.font = `800 ${titleSize}px ui-rounded, "Arial Rounded MT Bold", system-ui, sans-serif`;
    while (ctx.measureText(title).width > w - pad * 2 && titleSize > 16) { titleSize -= 2; ctx.font = `800 ${titleSize}px ui-rounded, system-ui, sans-serif`; }
  }
  let size = Math.round(h * (title ? 0.12 : 0.17));
  let lines;
  const availH = h - pad * 1.4 - (title ? titleSize * 1.3 : 0);
  for (;;) {
    ctx.font = `700 ${size}px Georgia, "Times New Roman", serif`;
    lines = text ? wrap(ctx, text, w - pad * 2) : [];
    if (lines.length * size * 1.18 <= availH || size <= 12) break;
    size -= 2;
  }
  const total = (title ? titleSize * 1.3 : 0) + lines.length * size * 1.18;
  let y = (h - total) / 2;
  if (title) {
    ctx.font = `800 ${titleSize}px ui-rounded, "Arial Rounded MT Bold", system-ui, sans-serif`;
    ctx.fillText(title, w / 2, y + titleSize * 0.6);
    y += titleSize * 1.3;
  }
  ctx.font = `700 ${size}px Georgia, "Times New Roman", serif`;
  for (const l of lines) { ctx.fillText(l, w / 2, y + size * 0.6); y += size * 1.18; }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// A sign on a post. Returns { group, center, radius } for interaction.
export function makeSignPost({ text, title = '', x, y, z, ry, wood = '#7a5230', scale = 1 }) {
  const group = new THREE.Group();
  const g = new Geo(Math.random);
  const bw = 2.3, bh = 1.15, top = 2.35;
  g.box(0.14, top, 0.14, wood, -bw * 0.38, 0, -0.22);
  g.box(0.14, top, 0.14, wood, bw * 0.38, 0, -0.22);
  g.box(bw + 0.16, bh + 0.16, 0.1, '#5a3a20', 0, top - bh - 0.08, -0.08);
  const built = g.build();
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  group.add(new THREE.Mesh(built.solid, mat));
  const tex = signTexture(text, { title, w: 512, h: 256 });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), new THREE.MeshBasicMaterial({ map: tex }));
  face.position.set(0, top - bh / 2, -0.02);
  group.add(face);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), new THREE.MeshLambertMaterial({ color: '#6b4528' }));
  back.position.set(0, top - bh / 2, -0.135);
  back.rotation.y = Math.PI;
  group.add(back);
  group.position.set(x, y, z);
  group.rotation.y = ry;
  group.scale.setScalar(scale);
  group.userData.dispose = () => { built.solid.dispose(); mat.dispose(); tex.dispose(); face.geometry.dispose(); face.material.dispose(); back.geometry.dispose(); back.material.dispose(); };
  return { group, face, center: new THREE.Vector3(x, y + (top - bh / 2) * scale, z), radius: 1.25 * scale };
}

// A flat painted board stuck onto a landmark (shop sign, billboard).
export function makeBoard({ text, title = '', w, h, neon = false, bg, fg }) {
  const ratio = w / h;
  const tw = 1024, th = Math.max(128, Math.round(tw / ratio));
  const tex = signTexture(text, { title, w: tw, h: Math.min(1024, th), bg: bg || (neon ? '#141022' : '#f4ecdc'), fg: fg || (neon ? '#ff6ad5' : '#2a1d12'), plank: !neon, neon });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
  mesh.userData.dispose = () => { tex.dispose(); mesh.geometry.dispose(); mesh.material.dispose(); };
  return mesh;
}
