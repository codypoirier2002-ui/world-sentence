// Sky dome, sun/moon, stars, clouds, lights and fog for a given recipe.
import * as THREE from 'three';
import { Geo, col } from '../kit/builder.js';
import { RNG } from '../gen/rng.js';

const TIMES = {
  dawn:  { elev: 12, sun: '#ffc39a', sunI: 2.2, hemiI: 1.25, top: '#7c8fd0', hor: '#ffb48a', k: 0.45, glow: 0.9 },
  day:   { elev: 58, sun: '#fff4e2', sunI: 2.7, hemiI: 1.45, top: null, hor: null, k: 0, glow: 0.5 },
  dusk:  { elev: 7,  sun: '#ff935e', sunI: 1.9, hemiI: 1.1, top: '#3d3f8f', hor: '#ff8457', k: 0.5, glow: 1.0 },
  night: { elev: 38, sun: '#a9bcff', sunI: 0.65, hemiI: 0.62, top: '#05081a', hor: '#1a2350', k: 0.78, glow: 0.35 },
};

const FOG = {
  clear: [30, 125], cloudy: [26, 110], rain: [16, 82], storm: [12, 66], snow: [14, 80], fog: [3, 42],
  embers: [22, 100], bubbles: [20, 95], leaves: [28, 115], spores: [16, 85], sandstorm: [3, 40],
  petals: [28, 115], sparkles: [26, 115],
};

export class Sky {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'sky';
    scene.add(this.group);

    this.uniforms = {
      topColor: { value: new THREE.Color() },
      horColor: { value: new THREE.Color() },
      botColor: { value: new THREE.Color() },
      sunDir: { value: new THREE.Vector3(0, 1, 0) },
      sunColor: { value: new THREE.Color() },
      sunSize: { value: 0.999 },
      glow: { value: 0.5 },
    };
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(420, 24, 14),
      new THREE.ShaderMaterial({
        uniforms: this.uniforms, side: THREE.BackSide, depthWrite: false, fog: false,
        vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `
          uniform vec3 topColor, horColor, botColor, sunDir, sunColor; uniform float sunSize, glow;
          varying vec3 vDir;
          void main(){
            vec3 d = normalize(vDir);
            float h = d.y;
            vec3 c = h > 0.0 ? mix(horColor, topColor, pow(clamp(h,0.0,1.0), 0.55)) : mix(horColor, botColor, pow(clamp(-h*2.5,0.0,1.0), 0.7));
            float sd = dot(d, normalize(sunDir));
            c += sunColor * pow(max(sd, 0.0), 12.0) * 0.28 * glow;
            c = mix(c, sunColor * 1.15, smoothstep(sunSize, sunSize + 0.0006, sd));
            gl_FragColor = vec4(c, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    );
    dome.renderOrder = -10;
    dome.frustumCulled = false;
    this.dome = dome;
    this.group.add(dome);

    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.4);
    this.sun = new THREE.DirectionalLight(0xffffff, 2.6);
    this.sun.position.set(30, 60, 20);
    scene.add(this.hemi, this.sun, this.sun.target);

    this._makeStars();
    this.clouds = null;
    this.fog = new THREE.Fog(0xffffff, 30, 120);
    scene.fog = this.fog;
    this.time = 'day';
    this.flash = 0;
  }

  _makeStars() {
    const r = new RNG(1234);
    const n = 700, pos = new Float32Array(n * 3), sizes = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const u = r.range(0.04, 1), th = r.range(0, Math.PI * 2), s = Math.sqrt(1 - u * u);
      pos.set([Math.cos(th) * s * 380, u * 380, Math.sin(th) * s * 380], i * 3);
      sizes[i] = r.range(0.6, 2.2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.starUniforms = { uOpacity: { value: 0 }, uScale: { value: 1 }, uTime: { value: 0 } };
    const m = new THREE.ShaderMaterial({
      uniforms: this.starUniforms, transparent: true, depthWrite: false, fog: false,
      vertexShader: `attribute float size; uniform float uScale, uTime; varying float vTw;
        void main(){ vTw = 0.65 + 0.35*sin(uTime*2.0 + position.x*0.37 + position.z*0.11);
          gl_PointSize = size * uScale * 1.6; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform float uOpacity; varying float vTw;
        void main(){ vec2 p = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(p));
          gl_FragColor = vec4(vec3(1.0, 0.97, 0.9), a * uOpacity * vTw); }`,
    });
    this.stars = new THREE.Points(g, m);
    this.stars.frustumCulled = false;
    this.stars.renderOrder = -9;
    this.group.add(this.stars);
  }

  _makeClouds(count, seed, color) {
    if (this.clouds) { this.group.remove(this.clouds); this.clouds.geometry.dispose(); this.clouds.material.dispose(); this.clouds = null; }
    if (count <= 0) return;
    const r = new RNG(seed).fork('clouds');
    const g = new Geo(r.next);
    for (let i = 0; i < 6; i++) g.ico(r.range(3, 5.5), '#ffffff', r.range(-7, 7), r.range(0, 2), r.range(-3, 3), { sy: 0.6, jitter: 0.05 });
    const geo = g.build().solid;
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color, vertexColors: true, fog: false, transparent: true, opacity: 0.93 }), count);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    this.cloudData = [];
    for (let i = 0; i < count; i++) {
      const ang = r.range(0, Math.PI * 2), d = r.range(40, 170);
      const data = { x: Math.cos(ang) * d, y: r.range(38, 62), z: Math.sin(ang) * d, s: r.range(0.9, 2.2), ry: r.range(0, 6.28) };
      this.cloudData.push(data);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), data.ry);
      mesh.setMatrixAt(i, m.compose(p.set(data.x, data.y, data.z), q, s.setScalar(data.s)));
    }
    mesh.frustumCulled = false;
    this.clouds = mesh;
    this.group.add(mesh);
  }

  apply(recipe) {
    const t = TIMES[recipe.sky.time] || TIMES.day;
    this.time = recipe.sky.time;
    const pal = recipe.palette;
    const medium = recipe.medium;
    const weather = recipe.sky.weather;
    const top = new THREE.Color().copy(col(pal.sky));
    const hor = new THREE.Color().copy(col(pal.horizon));
    if (t.top) top.lerp(col(t.top), t.k);
    if (t.hor) hor.lerp(col(t.hor), t.k * 0.8);
    if (recipe.sky.time === 'night') { top.multiplyScalar(0.55); hor.multiplyScalar(0.6); }
    const overcast = ['cloudy', 'rain', 'storm', 'snow', 'fog', 'sandstorm'].includes(weather);
    if (overcast) {
      const grey = new THREE.Color().copy(hor).lerp(col('#9aa3ad'), 0.5);
      if (recipe.sky.time === 'night') grey.multiplyScalar(0.4);
      top.lerp(grey, weather === 'cloudy' ? 0.35 : 0.6);
      hor.lerp(grey, weather === 'cloudy' ? 0.25 : 0.5);
    }
    if (weather === 'sandstorm') hor.lerp(col('#d9a860'), 0.6), top.lerp(col('#c99a5a'), 0.4);
    const bot = new THREE.Color().copy(hor).multiplyScalar(0.8);
    if (recipe.terrain.shape === 'islands' && recipe.terrain.water === 'none') bot.copy(hor).lerp(col('#ffffff'), 0.4);

    // sun direction
    const elev = THREE.MathUtils.degToRad(t.elev);
    const az = new RNG(recipe.seed).fork('sun').range(0, Math.PI * 2);
    const dir = new THREE.Vector3(Math.cos(az) * Math.cos(elev), Math.sin(elev), Math.sin(az) * Math.cos(elev));
    this.sunDir = dir;
    let sunColor = new THREE.Color(t.sun);
    if (recipe.palette.sun) sunColor.lerp(col(recipe.palette.sun), 0.5);
    let sunI = t.sunI, hemiI = t.hemiI, sunSize = recipe.sky.time === 'night' ? 0.9992 : 0.9985;
    let stars = recipe.sky.time === 'night' ? 1 : recipe.sky.time === 'dusk' ? 0.25 : 0;
    let [fogNear, fogFar] = FOG[weather] || FOG.clear;
    let glow = t.glow;

    if (medium === 'underwater') {
      top.copy(col(pal.water)).multiplyScalar(recipe.sky.time === 'night' ? 0.25 : 0.7);
      hor.copy(col(pal.water)).lerp(col(pal.horizon), 0.25);
      if (recipe.sky.time === 'night') hor.multiplyScalar(0.4);
      bot.copy(hor).multiplyScalar(0.6);
      fogNear = 2; fogFar = Math.min(fogFar, 58);
      sunI *= 0.8; hemiI *= 1.05; stars = 0; glow = 0.3; sunSize = 2;
      dir.set(0.2, 1, 0.1).normalize();
    } else if (medium === 'cavern') {
      top.copy(col(pal.sky)).multiplyScalar(0.6);
      hor.copy(col(pal.horizon));
      bot.copy(hor).multiplyScalar(0.7);
      fogNear = Math.min(fogNear, 8); fogFar = Math.min(fogFar, 72);
      stars = 0; glow = 0; sunSize = 2; sunI = 1.1; hemiI = 1.15;
      dir.set(0.25, 1, 0.15).normalize();
      sunColor = new THREE.Color(pal.glow || '#ffe2b8');
    } else if (medium === 'space') {
      top.copy(col(pal.sky)).multiplyScalar(0.12);
      hor.copy(col(pal.horizon)).multiplyScalar(0.3);
      bot.copy(hor).multiplyScalar(0.5);
      stars = 1; fogNear = 70; fogFar = 230; sunI = 2.6; hemiI = 0.8; glow = 0.6;
      sunColor = new THREE.Color('#ffffff');
    }
    if (overcast) { sunI *= 0.6; hemiI *= 1.05; glow *= 0.3; if (weather !== 'cloudy') sunSize = 2; }

    const u = this.uniforms;
    u.topColor.value.copy(top);
    u.horColor.value.copy(hor);
    u.botColor.value.copy(bot);
    u.sunDir.value.copy(dir);
    u.sunColor.value.copy(sunColor);
    u.sunSize.value = sunSize;
    u.glow.value = glow;
    this.starUniforms.uOpacity.value = stars;

    this.fog.color.copy(hor);
    this.fog.near = fogNear; this.fog.far = fogFar;
    this.baseFog = [fogNear, fogFar];

    this.sun.color.copy(sunColor);
    this.sun.intensity = sunI;
    this.baseSunI = sunI;
    this.sun.position.copy(dir).multiplyScalar(80);
    this.hemi.color.copy(top).lerp(col('#ffffff'), 0.55);
    this.hemi.groundColor.copy(col(pal.ground)).multiplyScalar(0.55);
    this.hemi.intensity = hemiI;
    this.baseHemiI = hemiI;

    const cloudAmt = medium === 'air' && !(recipe.terrain.shape === 'islands' && recipe.terrain.water === 'none' && false) ? (recipe.sky.clouds ?? 0.4) : 0;
    const count = Math.round(cloudAmt * 14 + (overcast ? 6 : 0));
    const cc = new THREE.Color('#ffffff').lerp(hor, 0.35);
    if (recipe.sky.time === 'night') cc.multiplyScalar(0.35);
    if (overcast) cc.lerp(col('#8d949c'), 0.45);
    this._makeClouds(medium === 'air' ? count : 0, recipe.seed, cc);
    this.horizon = hor;
  }

  update(dt, t, camera, pixelRatio) {
    this.group.position.copy(camera.position);
    this.starUniforms.uScale.value = pixelRatio;
    this.starUniforms.uTime.value = t;
    if (this.clouds) this.clouds.rotation.y += dt * 0.004;
    if (this.flash > 0) {
      this.flash = Math.max(0, this.flash - dt * 3.5);
      this.hemi.intensity = this.baseHemiI + this.flash * 3;
    }
  }

  lightning() { this.flash = 1; }
}
