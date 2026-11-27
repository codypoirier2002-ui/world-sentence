// Weather particles. One Points cloud whose motion is computed entirely in the
// vertex shader (no per-frame CPU work), wrapped in a box around the camera.
import * as THREE from 'three';
import { RNG } from '../gen/rng.js';

// shape: 0 soft dot, 1 streak, 2 flake, 3 bubble, 4 leaf, 5 twinkle
const KINDS = {
  rain:      { n: 1, color: '#c4d6e8', color2: '#eef4fa', vel: [0.6, -15, 0.3], sway: 0, size: 3.2, shape: 1, alpha: 0.7, box: [36, 22, 36] },
  storm:     { n: 1, color: '#c0d2e4', color2: '#eef4fa', vel: [4, -19, 1.5], sway: 0, size: 3.4, shape: 1, alpha: 0.75, box: [36, 22, 36] },
  snow:      { n: 0.8, color: '#ffffff', color2: '#e8f0ff', vel: [0.4, -1.5, 0.2], sway: 0.9, size: 1.5, shape: 2, alpha: 0.9, box: [34, 20, 34] },
  embers:    { n: 0.45, color: '#ffb347', color2: '#ff5a2a', vel: [0.3, 1.3, 0.1], sway: 0.7, size: 0.9, shape: 5, alpha: 1, box: [34, 18, 34], additive: true },
  bubbles:   { n: 0.45, color: '#d6f4ff', color2: '#ffffff', vel: [0, 1.7, 0], sway: 0.35, size: 1.6, shape: 3, alpha: 0.75, box: [30, 20, 30] },
  leaves:    { n: 0.35, color: '#e0862c', color2: '#c8452a', vel: [0.9, -1.1, 0.3], sway: 1.3, size: 1.7, shape: 4, alpha: 1, box: [34, 18, 34] },
  petals:    { n: 0.4, color: '#ffc2da', color2: '#ffffff', vel: [0.7, -0.9, 0.4], sway: 1.1, size: 1.4, shape: 4, alpha: 1, box: [34, 18, 34] },
  spores:    { n: 0.5, color: '#e4ffb8', color2: '#b8f0ff', vel: [0.15, 0.25, 0.1], sway: 0.6, size: 0.8, shape: 5, alpha: 0.9, box: [30, 14, 30], additive: true },
  sandstorm: { n: 1, color: '#e0b77e', color2: '#c99a5a', vel: [10, -0.4, 2.5], sway: 0.5, size: 1.4, shape: 0, alpha: 0.55, box: [36, 14, 36] },
  sparkles:  { n: 0.35, color: '#fff3b0', color2: '#ffd1f4', vel: [0.1, 0.2, 0.05], sway: 0.4, size: 1.0, shape: 5, alpha: 1, box: [32, 16, 32], additive: true, twinkle: true },
  fog:       { n: 0.25, color: '#ffffff', color2: '#e8eef2', vel: [0.3, 0.05, 0.1], sway: 0.6, size: 1.0, shape: 0, alpha: 0.35, box: [30, 12, 30] },
};

export class Weather {
  constructor(scene, quality) {
    this.scene = scene;
    this.max = quality === 'low' ? 900 : 1800;
    this.points = null;
    this.kind = null;
    this.uniforms = {
      uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uBox: { value: new THREE.Vector3(30, 20, 30) },
      uVel: { value: new THREE.Vector3() }, uSway: { value: 0 }, uSize: { value: 1 }, uScale: { value: 400 },
      uColor: { value: new THREE.Color() }, uColor2: { value: new THREE.Color() }, uShape: { value: 0 }, uAlpha: { value: 1 },
      uTwinkle: { value: 0 }, uFloor: { value: -1e6 }, uCeil: { value: 1e6 },
    };
  }

  apply(recipe, world) {
    this.clear();
    const w = recipe.sky.weather;
    let k = KINDS[w];
    if (!k) return;
    if (recipe.medium === 'space' && !['sparkles', 'spores'].includes(w)) return;
    this.kind = w;
    const count = Math.round(this.max * k.n);
    const r = new RNG(recipe.seed).fork('weather');
    const seed = new Float32Array(count * 3), rnd = new Float32Array(count);
    for (let i = 0; i < count; i++) { seed[i * 3] = r.float(); seed[i * 3 + 1] = r.float(); seed[i * 3 + 2] = r.float(); rnd[i] = r.float(); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(seed, 3));
    g.setAttribute('rnd', new THREE.BufferAttribute(rnd, 1));
    const u = this.uniforms;
    u.uBox.value.set(...k.box);
    u.uVel.value.set(...k.vel);
    u.uSway.value = k.sway; u.uSize.value = k.size; u.uShape.value = k.shape; u.uAlpha.value = k.alpha;
    u.uColor.value.set(k.color); u.uColor2.value.set(k.color2); u.uTwinkle.value = k.twinkle ? 1 : 0;
    // night dims normal-blended particles a little so they don't glow
    if (recipe.sky.time === 'night' && !k.additive) { u.uColor.value.multiplyScalar(0.55); u.uColor2.value.multiplyScalar(0.55); }
    // rain and snow stop at the water surface; bubbles stop at the "ceiling"
    u.uFloor.value = world?.waterLevel > -1e5 ? world.waterLevel : -1e6;
    const mat = new THREE.ShaderMaterial({
      uniforms: u, transparent: true, depthWrite: false,
      blending: k.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      vertexShader: `
        attribute float rnd;
        uniform float uTime, uSway, uSize, uScale, uTwinkle, uFloor;
        uniform vec3 uCam, uBox, uVel;
        varying float vRnd, vAlpha, vRot;
        void main() {
          vec3 p = position * uBox + uVel * uTime * (0.75 + 0.5 * rnd);
          p.x += sin(uTime * (0.6 + rnd) + rnd * 6.2831) * uSway;
          p.z += cos(uTime * (0.5 + rnd * 0.7) + rnd * 4.0) * uSway * 0.6;
          vec3 wp = uCam + mod(p - uCam + uBox * 0.5, uBox) - uBox * 0.5;
          vec4 mv = modelViewMatrix * vec4(wp, 1.0);
          float d = -mv.z;
          vAlpha = smoothstep(uBox.x * 0.5, uBox.x * 0.3, length(wp.xz - uCam.xz)) * smoothstep(0.3, 2.0, d);
          vAlpha *= step(uFloor, wp.y);
          if (uTwinkle > 0.5) vAlpha *= 0.35 + 0.65 * abs(sin(uTime * (1.5 + rnd * 3.0) + rnd * 20.0));
          vRnd = rnd;
          vRot = uTime * (0.8 + rnd) + rnd * 6.2831;
          gl_PointSize = min(64.0, uSize * (0.6 + 0.8 * rnd) * uScale / max(d, 0.5));
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uColor, uColor2; uniform float uShape, uAlpha;
        varying float vRnd, vAlpha, vRot;
        void main() {
          vec2 q = gl_PointCoord - 0.5;
          float a = 0.0;
          if (uShape < 0.5) a = smoothstep(0.5, 0.0, length(q));
          else if (uShape < 1.5) a = smoothstep(0.06, 0.0, abs(q.x)) * smoothstep(0.5, 0.2, abs(q.y));
          else if (uShape < 2.5) a = smoothstep(0.5, 0.3, length(q));
          else if (uShape < 3.5) { float l = length(q); a = smoothstep(0.5, 0.42, l) * (0.35 + smoothstep(0.3, 0.45, l)); a += smoothstep(0.12, 0.0, length(q - vec2(-0.14, -0.14))) * 0.8; }
          else if (uShape < 4.5) { float c = cos(vRot), s = sin(vRot); vec2 r = vec2(c * q.x - s * q.y, s * q.x + c * q.y); a = step(abs(r.x) * 1.6 + abs(r.y), 0.42); }
          else a = smoothstep(0.5, 0.0, length(q)) * (0.6 + 0.4 * smoothstep(0.2, 0.0, length(q)));
          a *= vAlpha * uAlpha;
          if (a < 0.01) discard;
          gl_FragColor = vec4(mix(uColor, uColor2, vRnd), a);
          #include <colorspace_fragment>
        }`,
    });
    this.points = new THREE.Points(g, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
    this.scene.add(this.points);
  }

  update(t, camera, renderer) {
    if (!this.points) return;
    const u = this.uniforms;
    u.uTime.value = t;
    u.uCam.value.copy(camera.position);
    // pixel scale: points shrink with distance like real objects
    u.uScale.value = renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)) * 0.1;
  }

  clear() {
    if (!this.points) return;
    this.scene.remove(this.points);
    this.points.geometry.dispose();
    this.points.material.dispose();
    this.points = null;
    this.kind = null;
  }
}
