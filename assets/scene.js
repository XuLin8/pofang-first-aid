/* ============================================================
   破防急救站 · scene.js —— Three.js 氛围层
   心之碎片：漂浮的碎片尘埃 + 记录时的「心碎爆发」
   ============================================================ */
(function () {
  "use strict";

  var canvas = document.getElementById("gl");
  if (typeof THREE === "undefined" || !canvas) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.z = 30;

  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  var shake = 0;

  function worldAt(px, py) {
    var dist = camera.position.z;
    var h = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * dist;
    var w = h * camera.aspect;
    return {
      x: (px / window.innerWidth - 0.5) * w,
      y: -(py / window.innerHeight - 0.5) * h
    };
  }

  /* ---------------- 尘埃（Points） ---------------- */
  (function makeDust() {
    var N = reduced ? 160 : 460;
    var pos = new Float32Array(N * 3);
    var seed = new Float32Array(N * 3);
    var tint = new Float32Array(N);
    for (var i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 90;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 56;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 4;
      seed[i * 3] = Math.random() * 100;
      seed[i * 3 + 1] = 0.3 + Math.random() * 0.7;
      seed[i * 3 + 2] = Math.random() * 6.28;
      tint[i] = Math.random();
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 3));
    geo.setAttribute("aTint", new THREE.BufferAttribute(tint, 1));
    var mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPR: { value: renderer.getPixelRatio() } },
      vertexShader: [
        "attribute vec3 aSeed;",
        "attribute float aTint;",
        "uniform float uTime; uniform float uPR;",
        "varying float vTint; varying float vTw;",
        "void main(){",
        "  vTint = aTint;",
        "  float t = uTime * 0.14 * aSeed.y;",
        "  vec3 p = position;",
        "  p.x += sin(t + aSeed.z) * 2.2;",
        "  p.y += sin(t * 0.8 + aSeed.x) * 1.6 - mod(uTime * 0.25 * aSeed.y, 56.0) + 28.0;",
        "  p.y = mod(p.y + 28.0, 56.0) - 28.0;",
        "  p.z += cos(t * 0.5 + aSeed.x) * 1.5;",
        "  vTw = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.6 + aSeed.y) + aSeed.z * 3.0));",
        "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
        "  gl_PointSize = (1.1 + aSeed.y * 2.2) * uPR * (30.0 / -mv.z) * 2.5;",
        "  gl_Position = projectionMatrix * mv;",
        "}"
      ].join("\n"),
      fragmentShader: [
        "varying float vTint; varying float vTw;",
        "void main(){",
        "  vec2 c = gl_PointCoord - 0.5;",
        "  float d = length(c);",
        "  if (d > 0.5) discard;",
        "  float a = smoothstep(0.5, 0.05, d) * vTw;",
        "  vec3 warm = vec3(0.93, 0.91, 0.87);",
        "  vec3 rose = vec3(0.9, 0.28, 0.3);",
        "  vec3 pale = vec3(0.95, 0.91, 0.86);",
        "  vec3 col = vTint < 0.55 ? mix(pale, warm, vTint / 0.55) : mix(warm, rose, (vTint - 0.55) / 0.45);",
        "  gl_FragColor = vec4(col, a * 0.5);",
        "}"
      ].join("\n")
    });
    scene.add(new THREE.Points(geo, mat));
    scene.userData.dustMat = mat;
  })();

  /* ---------------- 心之碎片（instanced quads） ---------------- */
  (function makeShards() {
    var N = reduced ? 30 : 90;
    var positions = new Float32Array(N * 6 * 3);
    var uvs = new Float32Array(N * 6 * 2);
    var aData = new Float32Array(N * 6 * 4);   // basePos.xy, seed, tint
    var quad = [[-1, -1, 0, 0], [1, -1, 1, 0], [1, 1, 1, 1], [-1, -1, 0, 0], [1, 1, 1, 1], [-1, 1, 0, 1]];
    for (var i = 0; i < N; i++) {
      var bx = (Math.random() - 0.5) * 84;
      var by = (Math.random() - 0.5) * 50;
      var sd = Math.random() * 100;
      var tn = Math.random();
      for (var v = 0; v < 6; v++) {
        var k = i * 6 + v;
        positions[k * 3] = quad[v][0];
        positions[k * 3 + 1] = quad[v][1];
        positions[k * 3 + 2] = 0;
        uvs[k * 2] = quad[v][2];
        uvs[k * 2 + 1] = quad[v][3];
        aData[k * 4] = bx;
        aData[k * 4 + 1] = by;
        aData[k * 4 + 2] = sd;
        aData[k * 4 + 3] = tn;
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.setAttribute("aData", new THREE.BufferAttribute(aData, 4));
    var mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPR: { value: renderer.getPixelRatio() } },
      vertexShader: [
        "attribute vec4 aData;",
        "uniform float uTime; uniform float uPR;",
        "varying vec2 vUv; varying float vTint; varying float vTw; varying float vEdge;",
        "void main(){",
        "  vUv = uv; vTint = aData.w; vEdge = max(abs(uv.x - 0.5), abs(uv.y - 0.5));",
        "  float sd = aData.z;",
        "  float t = uTime * 0.1 + sd;",
        "  vec3 p = position;",
        "  float ang = sd + uTime * (0.08 + fract(sd) * 0.12);",
        "  float ca = cos(ang), sa = sin(ang);",
        "  p.xy = mat2(ca, -sa, sa, ca) * p.xy * (0.22 + fract(sd * 7.13) * 0.38);",
        "  p.x += aData.x + sin(t * 1.3) * 3.0;",
        "  p.y += aData.y + sin(t * 0.9 + sd) * 2.4 - mod(uTime * 0.35 * (0.5 + fract(sd * 3.7)), 60.0) + 30.0;",
        "  p.y = mod(p.y + 30.0, 60.0) - 30.0;",
        "  p.z = -6.0 + fract(sd * 5.71) * 10.0;",
        "  vTw = 0.25 + 0.75 * (0.5 + 0.5 * sin(uTime * (0.4 + fract(sd) * 0.6) + sd * 2.0));",
        "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
        "  gl_Position = projectionMatrix * mv;",
        "}"
      ].join("\n"),
      fragmentShader: [
        "varying vec2 vUv; varying float vTint; varying float vTw; varying float vEdge;",
        "void main(){",
        "  vec2 c = abs(vUv - 0.5);",
        "  float diamond = c.x + c.y;",
        "  if (diamond > 0.5) discard;",
        "  float core = smoothstep(0.5, 0.12, diamond);",
        "  float edge = smoothstep(0.42, 0.5, vEdge);",
        "  vec3 rose = vec3(0.9, 0.28, 0.3);",
        "  vec3 warm = vec3(0.93, 0.91, 0.87);",
        "  vec3 col = mix(rose, warm, vTint);",
        "  float a = core * vTw * (0.14 + edge * 0.32);",
        "  gl_FragColor = vec4(col, a);",
        "}"
      ].join("\n")
    });
    scene.add(new THREE.Mesh(geo, mat));
    scene.userData.shardMat = mat;
  })();

  /* ---------------- 心碎爆发（一次性粒子池） ---------------- */
  var MAX = 260;
  var burstGeo = new THREE.BufferGeometry();
  var bPos = new Float32Array(MAX * 3);
  var bVel = new Float32Array(MAX * 3);
  var bMeta = new Float32Array(MAX * 4);   // birth, life, seed, tint
  var bHead = 0;
  burstGeo.setAttribute("position", new THREE.BufferAttribute(bPos, 3));
  burstGeo.setAttribute("aVel", new THREE.BufferAttribute(bVel, 3));
  burstGeo.setAttribute("aMeta", new THREE.BufferAttribute(bMeta, 4));
  var burstMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPR: { value: renderer.getPixelRatio() } },
    vertexShader: [
      "attribute vec3 aVel;",
      "attribute vec4 aMeta;",   // birth, life, seed, tint
      "uniform float uTime; uniform float uPR;",
      "varying float vTint; varying float vFade; varying float vSd;",
      "void main(){",
      "  vTint = aMeta.w; vSd = aMeta.z;",
      "  float age = (uTime - aMeta.x) / aMeta.y;",
      "  float alive = step(0.0, age) * step(age, 1.0);",
      "  vFade = alive * (1.0 - age);",
      "  vec3 p = position + aVel * age * aMeta.y;",
      "  p.y -= 9.0 * age * age;",
      "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
      "  gl_PointSize = alive * (2.0 + fract(aMeta.z) * 4.5) * uPR * (1.0 - age * 0.55) * (30.0 / -mv.z) * 10.0;",
      "  gl_Position = projectionMatrix * mv;",
      "  if (alive < 0.5) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);",
      "}"
    ].join("\n"),
    fragmentShader: [
      "varying float vTint; varying float vFade; varying float vSd;",
      "void main(){",
      "  vec2 c = gl_PointCoord - 0.5;",
      "  float d = length(c);",
      "  float star = max(0.0, 1.0 - (abs(c.x) + abs(c.y)) * 1.6);",
      "  float a = (smoothstep(0.5, 0.02, d) * 0.7 + star * 0.6) * vFade;",
      "  vec3 rose = vec3(0.9, 0.28, 0.3);",
      "  vec3 warm = vec3(0.95, 0.92, 0.86);",
      "  vec3 col = mix(rose, warm, fract(vTint * 7.31));",
      "  gl_FragColor = vec4(col, a);",
      "}"
    ].join("\n")
  });
  var burstPts = new THREE.Points(burstGeo, burstMat);
  burstPts.frustumCulled = false;
  scene.add(burstPts);

  /* 冲击波环 */
  var ring = new THREE.Mesh(
    new THREE.RingGeometry(0.94, 1, 64),
    new THREE.MeshBasicMaterial({ color: 0xe5484d, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false })
  );
  ring.visible = false;
  scene.add(ring);
  var ringT = -1;

  function spawnBurst(px, py, level) {
    var w = worldAt(px, py);
    var count = Math.min(MAX / 2, 40 + level * 30);
    for (var i = 0; i < count; i++) {
      var k = bHead; bHead = (bHead + 1) % MAX;
      var ang = Math.random() * Math.PI * 2;
      var spd = 6 + Math.random() * (8 + level * 4);
      bPos[k * 3] = w.x + (Math.random() - 0.5) * 0.8;
      bPos[k * 3 + 1] = w.y + (Math.random() - 0.5) * 0.8;
      bPos[k * 3 + 2] = (Math.random() - 0.5) * 4;
      bVel[k * 3] = Math.cos(ang) * spd;
      bVel[k * 3 + 1] = Math.sin(ang) * spd * 0.8 + 3;
      bVel[k * 3 + 2] = (Math.random() - 0.5) * 6;
      bMeta[k * 4] = clock;
      bMeta[k * 4 + 1] = 0.9 + Math.random() * 1.4;
      bMeta[k * 4 + 2] = Math.random() * 100;
      bMeta[k * 4 + 3] = Math.random();
    }
    burstGeo.attributes.position.needsUpdate = true;
    burstGeo.attributes.aVel.needsUpdate = true;
    burstGeo.attributes.aMeta.needsUpdate = true;

    if (level >= 3) {
      ring.position.set(w.x, w.y, 0);
      ring.scale.setScalar(0.4);
      ring.material.opacity = 0.55;
      ring.visible = true;
      ringT = 0;
    }
    if (level >= 4 && !reduced) shake = Math.min(1, 0.5 + level * 0.12);
  }

  window.addEventListener("pofang:burst", function (e) {
    spawnBurst(e.detail.x, e.detail.y, e.detail.level || 3);
  });

  /* ---------------- 交互与主循环 ---------------- */
  window.addEventListener("pointermove", function (e) {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  var clock = 0;
  var last = performance.now();
  var running = true;

  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    last = performance.now();
    if (running) tick();
  });

  function tick() {
    if (!running) return;
    requestAnimationFrame(tick);
    var now = performance.now();
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;

    mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3);
    mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3);

    var speed = reduced ? 0.25 : 1;
    scene.userData.dustMat.uniforms.uTime.value = clock * speed;
    scene.userData.shardMat.uniforms.uTime.value = clock * speed;
    burstMat.uniforms.uTime.value = clock;

    if (shake > 0.002) {
      shake *= Math.pow(0.02, dt);
      camera.position.x = mouse.x * 1.4 + (Math.random() - 0.5) * shake * 1.2;
      camera.position.y = -mouse.y * 1.0 + (Math.random() - 0.5) * shake * 1.2;
    } else {
      camera.position.x += (mouse.x * 1.4 - camera.position.x) * Math.min(1, dt * 3);
      camera.position.y += (-mouse.y * 1.0 - camera.position.y) * Math.min(1, dt * 3);
    }

    if (ringT >= 0) {
      ringT += dt;
      var s = 0.4 + ringT * 26;
      ring.scale.setScalar(s);
      ring.material.opacity = Math.max(0, 0.55 * (1 - ringT / 0.9));
      if (ringT > 0.9) { ringT = -1; ring.visible = false; }
    }

    renderer.render(scene, camera);
  }
  tick();
})();
