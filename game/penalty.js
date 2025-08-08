(function () {
  const container = document.getElementById("scene");
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.touchAction = "none";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0f1a);
  scene.fog = new THREE.Fog(0x0a0f1a, 18, 36);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
  const camBase = new THREE.Vector3(0, 2.2, 6.5);
  camera.position.copy(camBase);
  camera.lookAt(0, 1, -8);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x223355, 0.6);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 1.1);
  dir.position.set(3, 5, 4);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  scene.add(dir);

  const fieldGeom = new THREE.PlaneGeometry(20, 40);
  const fieldMat = new THREE.MeshStandardMaterial({
    color: 0x0b5d3c,
    roughness: 0.95,
    metalness: 0.05,
  });
  const field = new THREE.Mesh(fieldGeom, fieldMat);
  field.rotation.x = -Math.PI / 2;
  field.receiveShadow = true;
  scene.add(field);

  const goalZ = -8;
  const goalWidth = 11.7;
  const goalHeight = 5.2;
  const postR = 0.06;
  const postMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.2,
  });
  const postVGeom = new THREE.CylinderGeometry(postR, postR, goalHeight, 20);
  const postHGeom = new THREE.CylinderGeometry(postR, postR, goalWidth, 20);

  const leftPost = new THREE.Mesh(postVGeom, postMat);
  leftPost.position.set(-goalWidth / 2, goalHeight / 2, goalZ);
  leftPost.castShadow = true;
  leftPost.receiveShadow = true;
  const rightPost = new THREE.Mesh(postVGeom, postMat);
  rightPost.position.set(goalWidth / 2, goalHeight / 2, goalZ);
  rightPost.castShadow = true;
  rightPost.receiveShadow = true;
  const crossbar = new THREE.Mesh(postHGeom, postMat);
  crossbar.rotation.z = Math.PI / 2;
  crossbar.position.set(0, goalHeight, goalZ);
  crossbar.castShadow = true;
  crossbar.receiveShadow = true;
  scene.add(leftPost, rightPost, crossbar);

  // filet arrière de but (grille)
  (function addGoalNet() {
    const width = goalWidth - 0.2;
    const height = goalHeight - 0.2;
    const cell = 0.18;
    const positions = [];
    for (let x = -width / 2; x <= width / 2 + 1e-6; x += cell) {
      positions.push(x, -height / 2, 0, x, height / 2, 0);
    }
    for (let y = -height / 2; y <= height / 2 + 1e-6; y += cell) {
      positions.push(-width / 2, y, 0, width / 2, y, 0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(new Float32Array(positions), 3)
    );
    const mat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
    });
    const grid = new THREE.LineSegments(geo, mat);
    grid.position.set(0, goalHeight / 2, goalZ - 1.2);
    scene.add(grid);
  })();

  // cadre d’aide (zone tirable)
  const frameGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-goalWidth / 2 + postR * 2, 0.25, goalZ + 0.001),
    new THREE.Vector3(goalWidth / 2 - postR * 2, 0.25, goalZ + 0.001),
    new THREE.Vector3(
      goalWidth / 2 - postR * 2,
      goalHeight - 0.15,
      goalZ + 0.001
    ),
    new THREE.Vector3(
      -goalWidth / 2 + postR * 2,
      goalHeight - 0.15,
      goalZ + 0.001
    ),
    new THREE.Vector3(-goalWidth / 2 + postR * 2, 0.25, goalZ + 0.001),
  ]);
  const frameMat = new THREE.LineBasicMaterial({
    color: 0x1fb6ff,
    transparent: true,
    opacity: 0.15,
  });
  const frame = new THREE.Line(frameGeo, frameMat);
  scene.add(frame);

  const ballGeom = new THREE.SphereGeometry(0.22, 32, 32);
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0.1,
  });
  const ball = new THREE.Mesh(ballGeom, ballMat);
  const ballRadius = 0.22;
  ball.position.set(0, 0.22, -0.5);
  ball.castShadow = true;
  ball.receiveShadow = true;
  scene.add(ball);

  const player = new THREE.Group();
  scene.add(player);
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 1.0, 0.3),
    new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.1,
      roughness: 0.8,
    })
  );
  const playerZ = ball.position.z + 2.0;
  const playerX = -1.0;
  torso.position.set(playerX, 1.2, playerZ);
  torso.castShadow = true;
  torso.receiveShadow = true;
  player.add(torso);
  const legMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.9,
    metalness: 0.05,
  });
  const legL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.9, 12),
    legMat
  );
  const legR = legL.clone();
  legL.position.set(playerX - 0.18, 0.45, playerZ);
  legR.position.set(playerX + 0.18, 0.45, playerZ);
  player.add(legL, legR);
  const armMat = new THREE.MeshStandardMaterial({
    color: 0x374151,
    roughness: 0.85,
    metalness: 0.05,
  });
  const armL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.8, 12),
    armMat
  );
  const armR = armL.clone();
  armL.position.set(playerX - 0.45, 1.25, playerZ);
  armR.position.set(playerX + 0.45, 1.25, playerZ);
  armL.rotation.z = 0.2;
  armR.rotation.z = -0.2;
  player.add(armL, armR);
  const headSize = 0.7;
  const headGeo = new THREE.PlaneGeometry(headSize, headSize);
  const headMat = new THREE.MeshBasicMaterial({
    transparent: true,
    depthWrite: false,
  });
  const headMesh = new THREE.Mesh(headGeo, headMat);
  headMesh.position.set(playerX, 2.1, playerZ + 0.01);
  headMesh.renderOrder = 2;
  player.add(headMesh);

  const keeper = new THREE.Group();
  scene.add(keeper);
  const keeperBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 3.6, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x0b4da6, roughness: 0.7 })
  );
  keeperBody.position.set(0, 1.8, goalZ + 0.02);
  keeper.add(keeperBody);
  const gloveGeo = new THREE.SphereGeometry(0.24, 16, 16);
  const gloveMat = new THREE.MeshStandardMaterial({
    color: 0xf0f0f0,
    roughness: 0.6,
    metalness: 0.05,
  });
  const gloveL = new THREE.Mesh(gloveGeo, gloveMat);
  const gloveR = new THREE.Mesh(gloveGeo, gloveMat);
  gloveL.position.set(-0.7, 2.4, goalZ + 0.02);
  gloveR.position.set(0.7, 2.4, goalZ + 0.02);
  keeper.add(gloveL, gloveR);

  let keeperPlan = {
    active: false,
    startTime: 0,
    duration: 0,
    startX: 0,
    startY: 1.0,
    endX: 0,
    endY: 1.0,
  };

  const aimRing = new THREE.Mesh(
    new THREE.RingGeometry(0.12, 0.18, 64),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    })
  );
  const aimInner = new THREE.Mesh(
    new THREE.RingGeometry(0.02, 0.04, 64),
    new THREE.MeshBasicMaterial({
      color: 0x00e0ff,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    })
  );
  aimInner.position.z = 0.0015;
  aimRing.add(aimInner);
  aimRing.position.z = goalZ + 0.001;
  aimRing.visible = false;
  scene.add(aimRing);

  // prévisualisation de trajectoire
  const trajGeom = new THREE.BufferGeometry();
  const trajMat = new THREE.LineBasicMaterial({
    color: 0x26c6da,
    transparent: true,
    opacity: 0.4,
  });
  const trajectory = new THREE.Line(trajGeom, trajMat);
  trajectory.visible = false;
  scene.add(trajectory);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let isShooting = false;
  let sessionOver = false;
  let isCharging = false;
  let chargeStart = 0;
  let lastTarget = null;

  const resultEl = document.getElementById("hud-result");
  const scoreEl = document.getElementById("hud-score");
  const fillPower = document.getElementById("hud-power-fill");
  const btnRestart = document.getElementById("btn-restart");
  const btnExit = document.getElementById("btn-exit");

  if (btnRestart) {
    btnRestart.addEventListener("click", () => {
      resetSession();
      updateHUD();
    });
  }

  if (btnExit) {
    btnExit.addEventListener("click", () => {
      if (window.__penaltyCleanup) window.__penaltyCleanup();
      const overlay = document.getElementById("penalty-overlay");
      if (overlay) overlay.remove();
    });
  }

  const btnMusic = document.getElementById("btn-music");
  const musicIcon = document.getElementById("music-icon");

  if (btnMusic) {
    btnMusic.addEventListener("click", () => {
      resumeAudioIfNeeded();
      toggleMusic();
    });
  }

  function updateMusicButton() {
    try {
      if (btnMusic && musicIcon) {
        if (bgmAudio && !bgmAudio.paused) {
          // Musique activée
          musicIcon.textContent = "🔊";
          btnMusic.classList.remove("muted");
        } else {
          // Musique désactivée
          musicIcon.textContent = "🔇";
          btnMusic.classList.add("muted");
        }
      }
    } catch (e) {
      console.log("Erreur mise à jour bouton musique:", e);
    }
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }
  function norm01(val, min, max) {
    return clamp((val - min) / (max - min), 0, 1);
  }
  function rnd(a, b) {
    return a + Math.random() * (b - a);
  }
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  let selectedPlayer = {
    name: "Nicolas",
    stats: { vitesse: 83, tir: 79, passe: 91 },
    svg: null,
  };
  let vBallBase = 12;
  let dispersionBase = 0.18;

  const TOTAL_SHOTS = 5;
  let sessionGoals = 0;
  let sessionShots = 0;
  let lastResult = "";
  let scoreATT = 0;
  let scoreGAR = 0;

  function updateHUD() {
    const scoreEl = document.getElementById("hud-score");
    const resultEl = document.getElementById("hud-result");
    const sbScoreEl = document.getElementById("sb-score");

    if (scoreEl) {
      scoreEl.textContent = `Buts ${sessionGoals} — Tirs ${sessionShots}/5`;
    }
    if (resultEl) {
      resultEl.textContent = lastResult || "—";
    }
    if (sbScoreEl) {
      sbScoreEl.textContent = `${scoreATT} — ${scoreGAR}`;
    }
  }

  function handleShotResult(result) {
    lastResult = result;
    if (result === "BUT") {
      scoreATT++;
    } else if (result === "ARRÊT" || result === "RATÉ") {
      scoreGAR++;
    }
    updateHUD();
  }

  function endSession() {
    sessionOver = true;
    if (resultEl) resultEl.textContent = `Fin: ${sessionGoals}/${TOTAL_SHOTS}`;
    if (btnRestart) btnRestart.style.display = "inline-block";
    if (btnExit) btnExit.style.display = "inline-block";
  }
  function resetSession() {
    sessionShots = 0;
    sessionGoals = 0;
    scoreATT = 0;
    scoreGAR = 0;
    sessionOver = false;
    isCharging = false;
    if (resultEl) resultEl.textContent = "—";
    if (btnRestart) btnRestart.style.display = "none";
    if (btnExit) btnExit.style.display = "none";
    if (fillPower) fillPower.style.width = "0%";
    updateHUD();
  }
  if (btnRestart) btnRestart.onclick = resetSession;
  if (btnExit)
    btnExit.onclick = () => {
      if (history.length > 1) history.back();
      else location.href = "../index.html";
    };

  function applyStats() {
    const t = norm01(selectedPlayer.stats?.tir ?? 80, 40, 100);
    const p = norm01(selectedPlayer.stats?.passe ?? 80, 40, 100);
    vBallBase = THREE.MathUtils.lerp(10, 18, t);
    dispersionBase = THREE.MathUtils.lerp(0.45, 0.06, p);
  }
  function svgToDataUrl(svg) {
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }
  function setHeadTextureFromSource(src) {
    new THREE.TextureLoader().load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      headMat.map = tex;
      headMat.needsUpdate = true;
    });
  }
  function setHeadFromSVG(svgOrUrl) {
    const src =
      svgOrUrl.startsWith("data:") || svgOrUrl.startsWith("http")
        ? svgOrUrl
        : svgToDataUrl(svgOrUrl);
    setHeadTextureFromSource(src);
  }
  const placeholderSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140">
  <rect width="140" height="140" rx="70" fill="#0f172a"/>
  <circle cx="70" cy="70" r="52" fill="#111827"/>
  <circle cx="70" cy="70" r="40" fill="#ffd7b1"/>
  <circle cx="55" cy="68" r="6" fill="#0b0e14"/>
  <circle cx="85" cy="68" r="6" fill="#0b0e14"/>
  <path d="M50 92 Q70 104 90 92" stroke="#0b0e14" stroke-width="6" fill="none" stroke-linecap="round"/>
</svg>`;
  setHeadFromSVG(placeholderSVG);
  applyStats();
  updateHUD();
  updatePlayerPanel();

  // Initialiser le bouton musique avec un délai
  setTimeout(() => {
    updateMusicButton();
  }, 100);

  // Forcer l'affichage du nom par défaut
  const nameEl = document.getElementById("player-name");
  if (nameEl && selectedPlayer.name) {
    nameEl.textContent = selectedPlayer.name;
  }

  function getPointerTarget(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const o = raycaster.ray.origin;
    const d = raycaster.ray.direction;
    if (Math.abs(d.z) < 1e-6) return null;
    const t = (goalZ - o.z) / d.z;
    if (t <= 0) return null;
    const p = o.clone().add(d.clone().multiplyScalar(t));
    p.z = goalZ;
    return p;
  }

  function buildTrajectoryPreview(start, target, speedFactor = 1) {
    const pts = [];
    const dist = start.distanceTo(target);
    const duration = Math.max(0.35, dist / (vBallBase * speedFactor));
    const arc = clamp(dist * 0.12, 0.35, 1.2);
    for (let i = 0; i <= 16; i++) {
      const k = i / 16;
      const p = easeOutCubic(k);
      const x = THREE.MathUtils.lerp(start.x, target.x, p);
      const z = THREE.MathUtils.lerp(start.z, target.z, p);
      const baseY = THREE.MathUtils.lerp(start.y, target.y, p);
      const y = baseY + Math.sin(Math.PI * p) * arc;
      pts.push(new THREE.Vector3(x, y, z));
    }
    trajGeom.setFromPoints(pts);
  }

  function planKeeperDive(targetX, targetY) {
    const bias = clamp(targetX / (goalWidth * 0.5), -1, 1);
    const r = Math.random();
    let side = 0;
    if (r < 0.6) side = Math.sign(bias);
    else if (r < 0.8) side = -Math.sign(bias);
    else side = 0;
    const padX = 0.2,
      maxX = goalWidth / 2 - padX;
    let endX = side === 0 ? 0 : clamp(side * rnd(1.2, 1.8), -maxX, maxX);
    endX = clamp(endX, -maxX, maxX);
    let endY = clamp(targetY + rnd(-0.25, 0.25), 0.7, 1.7);
    const reactionDelay = rnd(0.18, 0.28),
      diveSpeed = rnd(2.4, 3.1);
    const distance = Math.hypot(
      endX - keeperPlan.startX,
      endY - keeperPlan.startY
    );
    const duration = Math.max(0.3, distance / diveSpeed);
    keeperPlan = {
      active: true,
      startTime: performance.now() + reactionDelay * 1000,
      duration,
      startX: 0,
      startY: 1.0,
      endX,
      endY,
    };
  }

  // particules d’impact
  const particles = [];
  function spawnParticles(pos, color = 0x22d3ee, count = 16) {
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 10, 10),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
      );
      m.position.copy(pos);
      m.userData.v = new THREE.Vector3(
        (Math.random() - 0.5) * 1.2,
        Math.random() * 1.2,
        (Math.random() - 0.5) * 1.2
      );
      m.userData.life = 0.6 + Math.random() * 0.4;
      particles.push(m);
      scene.add(m);
    }
  }

  function cameraKick(intensity = 0.02) {
    camera.position.x = camBase.x + (Math.random() - 0.5) * intensity;
    camera.position.y = camBase.y + (Math.random() - 0.5) * intensity;
  }

  function shootTo(target, powerFactor = 1) {
    if (isShooting || sessionOver) return;
    isShooting = true;
    aimRing.visible = false;
    trajectory.visible = false;
    if (resultEl) resultEl.textContent = "…";

    const pow01 = clamp((powerFactor - 0.7) / 0.6, 0, 1);
    const maxDisp = THREE.MathUtils.lerp(
      dispersionBase * 1.2,
      dispersionBase * 2.2,
      pow01
    );
    const ang = Math.random() * Math.PI * 2;
    const r = Math.random() * maxDisp;
    const targetJ = target.clone();
    targetJ.x += Math.cos(ang) * r;
    targetJ.y += Math.sin(ang) * r;

    const start = ball.position.clone();
    const dist = start.distanceTo(targetJ);
    const speed = vBallBase * powerFactor;
    const duration = Math.max(0.35, dist / speed);
    const arcHeight = clamp(dist * 0.12, 0.35, 1.2);
    const t0 = performance.now();

    keeperPlan.startX = 0;
    keeperPlan.startY = 1.0;
    planKeeperDive(targetJ.x, targetJ.y);

    const camShot = new THREE.Vector3(0, 2.35, 6.2);

    function step(now) {
      const k = clamp((now - t0) / (duration * 1000), 0, 1);
      const p = easeOutCubic(k);
      ball.position.x = THREE.MathUtils.lerp(start.x, targetJ.x, p);
      ball.position.z = THREE.MathUtils.lerp(start.z, targetJ.z, p);
      const baseY = THREE.MathUtils.lerp(start.y, targetJ.y, p);
      ball.position.y = baseY + Math.sin(Math.PI * p) * arcHeight;
      ball.rotation.x += 0.25;
      ball.rotation.y += 0.3;

      // caméra suit légèrement
      camera.position.lerpVectors(camBase, camShot, p * 0.9);
      camera.lookAt(0, 1.0 + 0.4 * p, goalZ);

      if (keeperPlan.active) {
        const startMs = keeperPlan.startTime,
          endMs = startMs + keeperPlan.duration * 1000;
        if (now >= startMs) {
          const kk = clamp((now - startMs) / (endMs - startMs), 0, 1);
          const ep = easeOutCubic(kk);
          const x = THREE.MathUtils.lerp(
            keeperPlan.startX,
            keeperPlan.endX,
            ep
          );
          const y = THREE.MathUtils.lerp(
            keeperPlan.startY,
            keeperPlan.endY,
            ep
          );
          keeper.position.set(x, 0, 0);
          keeperBody.position.set(x, y - 0.1, goalZ + 0.02);
          gloveL.position.set(x - 0.35, y + 0.2, goalZ + 0.02);
          gloveR.position.set(x + 0.35, y + 0.2, goalZ + 0.02);
        } else {
          keeper.position.set(0, 0, 0);
          keeperBody.position.set(0, 0.9, goalZ + 0.02);
          gloveL.position.set(-0.35, 1.2, goalZ + 0.02);
          gloveR.position.set(0.35, 1.2, goalZ + 0.02);
        }
      }

      if (k < 1) {
        requestAnimationFrame(step);
      } else {
        const saveRadius = 0.3;
        const gL = new THREE.Vector3(
          gloveL.position.x,
          gloveL.position.y,
          goalZ + 0.02
        );
        const gR = new THREE.Vector3(
          gloveR.position.x,
          gloveR.position.y,
          goalZ + 0.02
        );
        const ballAtLine = new THREE.Vector3(
          ball.position.x,
          ball.position.y,
          goalZ
        );

        const postLeft = new THREE.Vector3(
          -goalWidth / 2,
          goalHeight / 2,
          goalZ
        );
        const postRight = new THREE.Vector3(
          goalWidth / 2,
          goalHeight / 2,
          goalZ
        );
        const cross = new THREE.Vector3(0, goalHeight, goalZ);
        const hitPost =
          postLeft.distanceTo(ballAtLine) <= postR + ballRadius + 0.02 ||
          postRight.distanceTo(ballAtLine) <= postR + ballRadius + 0.02 ||
          cross.distanceTo(ballAtLine) <= postR + ballRadius + 0.02;

        const insideX =
          ballAtLine.x >= -goalWidth / 2 + postR + ballRadius &&
          ballAtLine.x <= goalWidth / 2 - postR - ballRadius;
        const insideY =
          ballAtLine.y >= ballRadius &&
          ballAtLine.y <= goalHeight - postR - ballRadius;
        const inGoalRect = insideX && insideY;

        let result = "BUT";
        if (!inGoalRect || hitPost) result = "RATÉ";

        let saved = false;
        if (result !== "RATÉ") {
          const d = Math.min(
            gL.distanceTo(ballAtLine),
            gR.distanceTo(ballAtLine)
          );
          saved = d < saveRadius;
          if (saved) result = "ARRÊT";
        }

        if (result === "BUT") {
          sessionGoals++;
          handleShotResult("BUT");
          spawnParticles(ballAtLine, 0x22d3ee, 18);
          sfxGoal();
        } else if (result === "ARRÊT") {
          handleShotResult("ARRÊT");
          spawnParticles(ballAtLine, 0xf97316, 14);
          sfxSave();
        } else {
          handleShotResult("RATÉ");
          spawnParticles(ballAtLine, 0xef4444, 14);
        }
        sessionShots += 1;
        updateHUD();
        if (resultEl) resultEl.textContent = result + " !";
        cameraKick(result === "ARRÊT" ? 0.03 : 0.02);

        setTimeout(() => {
          ball.position.set(0, 0.22, -0.5);
          ball.rotation.set(0, 0, 0);
          isShooting = false;
          keeperPlan = {
            active: false,
            startTime: 0,
            duration: 0,
            startX: 0,
            startY: 1.0,
            endX: 0,
            endY: 1.0,
          };
          keeper.position.set(0, 0, 0);
          keeperBody.position.set(0, 0.9, goalZ + 0.02);
          gloveL.position.set(-0.35, 1.2, goalZ + 0.02);
          gloveR.position.set(0.35, 1.2, goalZ + 0.02);
          camera.position.copy(camBase);
          camera.lookAt(0, 1, goalZ);
          if (sessionShots >= TOTAL_SHOTS) endSession();
        }, 450);
      }
    }
    requestAnimationFrame(step);
  }

  function onPointerMove(e) {
    if (isShooting || sessionOver) return;
    const p = getPointerTarget(e.clientX, e.clientY);
    if (!p) {
      aimRing.visible = false;
      trajectory.visible = false;
      return;
    }
    const power = isCharging ? getChargePower() : 0.9;
    const ringBase = 0.16;
    const ringMax = 0.5;
    const ringSize = THREE.MathUtils.lerp(
      ringBase,
      ringMax,
      clamp((power - 0.7) / 0.6, 0, 1)
    );
    aimRing.geometry.dispose();
    aimRing.geometry = new THREE.RingGeometry(ringSize * 0.8, ringSize, 48);

    aimRing.visible = true;
    aimRing.position.set(p.x, p.y, goalZ + 0.001);
    lastTarget = p;
    buildTrajectoryPreview(ball.position, p, power);
    trajectory.visible = true;
  }

  function getChargePower() {
    const elapsed = (performance.now() - chargeStart) / 1000;
    // oscille entre 0.7x et 1.3x
    const t = Math.sin(elapsed * Math.PI) * 0.5 + 0.5; // 0..1
    return 0.7 + t * 0.6; // 0.7 -> 1.3
  }

  let lastVoiceIndex = -1;
  let lastVoiceAt = 0;
  const minVoiceCooldownMs = 3500;
  const voicePlayProbability = 0.6;

  function playVoice() {
    try {
      const now = performance.now();
      if (now - lastVoiceAt < minVoiceCooldownMs) return;
      if (Math.random() > voicePlayProbability) return;

      resumeAudioIfNeeded();
      const sources = [
        "game/assets/voix1.mp3",
        "game/assets/voix2.mp3",
        "game/assets/voix3.mp3",
      ];
      let idx = Math.floor(Math.random() * sources.length);
      if (idx === lastVoiceIndex) idx = (idx + 1) % sources.length;
      const src = sources[idx];
      lastVoiceIndex = idx;
      lastVoiceAt = now;

      const a = new Audio(src);
      try {
        a.crossOrigin = "anonymous";
      } catch {}
      a.volume = 0.9;
      a.play().catch(() => {});
    } catch {}
  }

  function onPointerDown(e) {
    if (sessionOver || isShooting) return;
    isCharging = true;
    chargeStart = performance.now();
    playVoice();
  }
  function onPointerUp(e) {
    if (!isCharging || sessionOver) return;
    isCharging = false;
    const power = getChargePower();
    if (fillPower) fillPower.style.width = "0%";
    if (lastTarget) {
      sfxShoot();
      shootTo(lastTarget, power);
    }
  }

  function resize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  renderer.domElement.addEventListener("pointermove", onPointerMove, {
    passive: true,
  });
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointercancel", onPointerUp);
  resize();

  let __rafId;

  function animate() {
    const t = performance.now() * 0.001;
    const bob = Math.sin(t * 2) * 0.02;
    torso.position.y = 1.2 + bob;
    headMesh.position.y = 2.1 + bob;
    headMesh.lookAt(camera.position.x, headMesh.position.y, camera.position.z);

    if (isCharging) {
      const pct = Math.round(((getChargePower() - 0.7) / 0.6) * 100);
      if (fillPower) fillPower.style.width = `${pct}%`;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.userData.life -= 1 / 60;
      p.position.addScaledVector(p.userData.v, 1 / 60);
      p.material.opacity = Math.max(0, p.userData.life * 1.5);
      if (p.userData.life <= 0) {
        scene.remove(p);
        particles.splice(i, 1);
      }
    }

    renderer.render(scene, camera);
    __rafId = requestAnimationFrame(animate);
  }
  animate();

  window.setSelectedPlayer = function (p) {
    console.log("=== DEBUG PENALTY.JS ===");
    console.log("Données reçues:", p);
    console.log("selectedPlayer avant:", selectedPlayer);

    selectedPlayer = {
      name: p?.name ?? selectedPlayer.name,
      stats: p?.stats ?? selectedPlayer.stats,
      svg: p?.svg ?? selectedPlayer.svg,
    };

    console.log("selectedPlayer après:", selectedPlayer);

    applyStats();
    if (selectedPlayer.svg) setHeadFromSVG(selectedPlayer.svg);
    updatePlayerPanel();
  };
  window.previewHead = function (svgOrUrl) {
    setHeadFromSVG(svgOrUrl);
  };

  function updatePlayerPanel() {
    const nameEl = document.getElementById("player-name");
    const avatarEl = document.getElementById("player-avatar");
    const vitesseEl = document.getElementById("stat-vitesse");
    const tirEl = document.getElementById("stat-tir");
    const passeEl = document.getElementById("stat-passe");

    // Toujours afficher le nom du joueur sélectionné
    if (nameEl) nameEl.textContent = selectedPlayer.name;
    if (vitesseEl)
      vitesseEl.textContent = selectedPlayer.stats?.vitesse || "80";
    if (tirEl) tirEl.textContent = selectedPlayer.stats?.tir || "80";
    if (passeEl) passeEl.textContent = selectedPlayer.stats?.passe || "80";

    if (avatarEl) {
      if (selectedPlayer.svg) {
        // Créer un data URL à partir du contenu SVG
        const svgBlob = new Blob([selectedPlayer.svg], {
          type: "image/svg+xml",
        });
        const svgUrl = URL.createObjectURL(svgBlob);

        avatarEl.innerHTML = `
          <img src="${svgUrl}" 
               alt="${selectedPlayer.name}" 
               style="width:120%;height:120%;object-fit:cover;border-radius:50%;transform:translateY(-10%)" 
               onload="console.log('Avatar SVG chargé avec succès')"
               onerror="console.log('Erreur chargement avatar SVG')" />
        `;
        console.log("Avatar SVG créé:", selectedPlayer.name);
      } else {
        console.log("Pas d'avatar SVG défini pour:", selectedPlayer.name);
      }
    }
  }

  function __disposeObject(obj) {
    if (obj.geometry && obj.geometry.dispose) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => {
          if (m.map && m.map.dispose) m.map.dispose();
          if (m.dispose) m.dispose();
        });
      } else {
        if (obj.material.map && obj.material.map.dispose)
          obj.material.map.dispose();
        if (obj.material.dispose) obj.material.dispose();
      }
    }
  }

  let audioCtx;
  let bgmAudio = null;
  let musicOn = false;
  let bgmObjectUrl = null;

  function ensureAudio() {
    if (!audioCtx)
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  function resumeAudioIfNeeded() {
    try {
      ensureAudio();
      if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    } catch {}
  }

  function setMusicSource(src) {
    ensureAudio();
    try {
      if (bgmAudio) {
        bgmAudio.pause();
        bgmAudio.src = "";
        bgmAudio = null;
      }
    } catch {}
    bgmAudio = new Audio(src);
    bgmAudio.preload = "auto";
    try {
      bgmAudio.crossOrigin = "anonymous";
    } catch {}
    bgmAudio.loop = true;
    bgmAudio.volume = 0.6;
    bgmAudio.addEventListener(
      "canplaythrough",
      () => {
        if (musicOn) bgmAudio.play().catch(() => {});
      },
      { once: true }
    );
    bgmAudio.addEventListener("error", () => {
      const r = document.getElementById("hud-result");
      const code = (bgmAudio && bgmAudio.error && bgmAudio.error.code) || 0;
      if (r) r.textContent = "Musique: erreur de lecture (" + code + ")";
    });
    try {
      bgmAudio.load();
    } catch {}
    if (musicOn) bgmAudio.play().catch(() => {});
  }

  function toggleMusic() {
    resumeAudioIfNeeded();
    musicOn = !musicOn;
    if (bgmAudio) {
      if (musicOn) bgmAudio.play().catch(() => {});
      else bgmAudio.pause();
    }
    updateMusicButton();
  }

  function playBeep(freq, duration = 0.08, vol = 0.2) {
    try {
      ensureAudio();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "triangle";
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + duration
      );
      o.connect(g).connect(audioCtx.destination);
      o.start();
      o.stop(audioCtx.currentTime + duration);
    } catch {}
  }
  function sfxShoot() {
    playBeep(520, 0.07, 0.15);
  }
  function sfxGoal() {
    playBeep(880, 0.12, 0.2);
    setTimeout(() => playBeep(1175, 0.12, 0.2), 90);
  }
  function sfxSave() {
    playBeep(300, 0.12, 0.2);
  }

  window.setMusicURL = function (url) {
    setMusicSource(url);
    if (!musicOn) toggleMusic();
  };

  const defaultMusic = (function () {
    if (
      window.defaultPenaltyMusic &&
      typeof window.defaultPenaltyMusic === "string"
    ) {
      return window.defaultPenaltyMusic;
    }
    try {
      const s = document.currentScript;
      if (!s) return "game/assets/musique-bluelock.mp3";
      const base = new URL("./", s.src).toString();
      return base + "assets/musique-bluelock.mp3";
    } catch {
      return "game/assets/musique-bluelock.mp3";
    }
  })();
  if (defaultMusic) {
    setMusicSource(defaultMusic);
    const c = renderer.domElement;
    const onFirst = () => {
      resumeAudioIfNeeded();
      if (!musicOn) toggleMusic();
      c.removeEventListener("pointerdown", onFirst);
      c.removeEventListener("touchstart", onFirst);
    };
    c.addEventListener("pointerdown", onFirst, { passive: true });
    c.addEventListener("touchstart", onFirst, { passive: true });
  }

  window.__penaltyCleanup = function () {
    try {
      cancelAnimationFrame(__rafId);
    } catch {}
    try {
      window.removeEventListener("resize", resize);
    } catch {}

    try {
      const c = renderer.domElement;
      c.removeEventListener("pointermove", onPointerMove);
      c.removeEventListener("pointerdown", onPointerDown);
      c.removeEventListener("pointerup", onPointerUp);
      c.removeEventListener("pointercancel", onPointerUp);
    } catch {}

    try {
      scene.traverse(__disposeObject);
    } catch {}

    try {
      // libération forte du contexte GL
      if (renderer.forceContextLoss) renderer.forceContextLoss();
      const gl = renderer.getContext ? renderer.getContext() : null;
      const lose =
        gl && gl.getExtension && gl.getExtension("WEBGL_lose_context");
      if (lose && lose.loseContext) lose.loseContext();
    } catch {}

    try {
      renderer.dispose();
    } catch {}

    try {
      const canvas = renderer.domElement;
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    } catch {}

    try {
      if (bgmAudio) {
        bgmAudio.pause();
        bgmAudio.src = "";
        bgmAudio = null;
      }
      if (bgmObjectUrl) {
        URL.revokeObjectURL(bgmObjectUrl);
        bgmObjectUrl = null;
      }
    } catch {}
  };
})();
