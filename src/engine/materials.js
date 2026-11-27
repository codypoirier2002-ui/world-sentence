// Shared materials for a world. Everything uses vertex colours, so a handful of
// materials covers every prop.
import * as THREE from 'three';

export class Materials {
  constructor() {
    this.uniforms = { uTime: { value: 0 } };
    this.solid = new THREE.MeshLambertMaterial({ vertexColors: true });
    this.glow = new THREE.MeshBasicMaterial({ vertexColors: true });
    this._sway = new Map();
  }

  // Foliage that leans in the wind (instanced only).
  sway(amount) {
    const key = amount.toFixed(2);
    if (this._sway.has(key)) return this._sway.get(key);
    const m = new THREE.MeshLambertMaterial({ vertexColors: true });
    const u = this.uniforms;
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = u.uTime;
      shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        #ifdef USE_INSTANCING
          float ph = instanceMatrix[3].x * 0.31 + instanceMatrix[3].z * 0.23;
          float k = max(position.y, 0.0) * ${(amount * 2.2).toFixed(3)};
          transformed.x += sin(uTime * 1.6 + ph) * k;
          transformed.z += cos(uTime * 1.3 + ph * 1.7) * k * 0.6;
        #endif`);
    };
    m.customProgramCacheKey = () => `sway${key}`;
    this._sway.set(key, m);
    return m;
  }

  update(t) { this.uniforms.uTime.value = t; }

  dispose() {
    this.solid.dispose();
    this.glow.dispose();
    for (const m of this._sway.values()) m.dispose();
  }
}
