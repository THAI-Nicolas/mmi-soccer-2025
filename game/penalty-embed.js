(function () {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  async function fetchSVGText(path) {
    try {
      const res = await fetch(path, { cache: "no-cache" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.text();
    } catch {
      return null;
    }
  }
  function mapNameToAvatarFile(name) {
    const m = {
      Juline: "juline-avatar.svg",
      Andréa: "andrea-avatar.svg",
      Margaux: "margaux-avatar.svg",
      Mathis: "mathis-avatar.svg",
      Paul: "paul-avatar.svg",
      François: "francois-avatar.svg",
      Jules: "jules-avatar.svg",
      Solène: "solene-avatar.svg",
      Nicolas: "nicolas-avatar.svg",
    };
    return m[name] || null;
  }

  function createOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "penalty-overlay";
    overlay.innerHTML = `
<style>
#penalty-overlay{position:fixed;inset:0;z-index:100000;background:linear-gradient(135deg,#000000,#0a0f1a);display:flex;align-items:center;justify-content:center}
#penalty-overlay .po-wrap{position:relative;width:100%;height:100%}
#scene{position:absolute;inset:0}

.hud-scoreboard{position:absolute;left:16px;top:12px;z-index:3;background:linear-gradient(135deg,rgba(1,73,175,0.15),rgba(0,0,0,0.8));backdrop-filter:blur(8px);border:2px solid rgba(1,73,175,0.3);border-radius:15px;padding:12px 16px;color:#e5e7eb;font-family:"Orbitron",monospace;box-shadow:0 0 20px rgba(1,73,175,0.3)}
.scoreboard-main{display:flex;gap:12px;align-items:center;font-weight:800;letter-spacing:.05em;font-size:1.1rem}
.scoreboard-time{color:rgba(1,73,175,0.8);text-shadow:0 0 10px rgba(1,73,175,0.5)}
.scoreboard-team{color:#0149af;text-shadow:0 0 8px rgba(1,73,175,0.4)}
.scoreboard-score{color:#ffffff;text-shadow:0 0 10px rgba(255,255,255,0.5)}
.hud-stats{opacity:.9;font-size:.85rem;margin-top:6px;color:#b0b7c3}

.hud-player{position:absolute;left:16px;top:140px;z-index:3;background:linear-gradient(135deg,rgba(1,73,175,0.15),rgba(0,0,0,0.8));backdrop-filter:blur(8px);border:2px solid rgba(1,73,175,0.3);border-radius:15px;padding:12px;color:#e5e7eb;font-family:"Orbitron",monospace;min-width:200px;box-shadow:0 0 20px rgba(1,73,175,0.3)}
.player-header{font-weight:800;letter-spacing:.05em;margin-bottom:8px;color:rgba(1,73,175,0.8);text-transform:uppercase;font-size:.9rem}
.player-avatar{width:60px;height:60px;border-radius:50%;border:2px solid rgba(1,73,175,0.5);background:rgba(0,0,0,0.3);margin-bottom:8px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.player-avatar img{width:120%;height:120%;object-fit:cover;transform:translateY(-10%)}
.player-name{font-weight:700;margin-bottom:6px;color:#ffffff;font-size:.95rem}
.player-stats{display:flex;flex-direction:column;gap:4px}
.stat-row{display:flex;justify-content:space-between;align-items:center;font-size:.8rem}
.stat-label{color:#b0b7c3}
.stat-value{color:rgba(1,73,175,0.8);font-weight:600}

.hud-controls{position:absolute;right:16px;top:12px;z-index:2;background:linear-gradient(135deg,rgba(1,73,175,0.1),rgba(0,0,0,0.6));backdrop-filter:blur(6px);border:1px solid rgba(1,73,175,0.2);border-radius:15px;padding:12px;color:#e5e7eb;font-family:"Orbitron",monospace;min-width:200px}
.controls-header{font-weight:800;letter-spacing:.05em;margin-bottom:8px;color:rgba(1,73,175,0.8);text-transform:uppercase;font-size:.9rem}
.controls-list{display:flex;flex-direction:column;gap:6px;font-size:.85rem;color:#b0b7c3;margin-bottom:12px}

.cyber-button{position:relative;background:none;border:none;cursor:pointer;padding:0;font-family:"Orbitron",monospace;min-width:80px;transition:all 0.3s ease;margin:2px}
.cyber-button .btn-background{position:absolute;inset:0;border-radius:8px;transition:all 0.3s ease;background:linear-gradient(135deg,rgba(1,73,175,0.8),rgba(1,73,175,0.6))}
.cyber-button .btn-border{position:absolute;inset:-1px;border-radius:9px;z-index:-1;transition:all 0.3s ease;background:linear-gradient(135deg,#0149af,rgba(1,73,175,0.8))}
.cyber-button .btn-text{position:relative;z-index:2;display:block;padding:8px 12px;font-size:.8rem;font-weight:600;color:#ffffff;letter-spacing:.05em;text-transform:uppercase}
.cyber-button .btn-glow{position:absolute;inset:-3px;border-radius:11px;filter:blur(8px);opacity:0;transition:opacity 0.3s ease;z-index:-2;background:linear-gradient(135deg,#0149af,rgba(1,73,175,0.8))}
.cyber-button:hover .btn-glow{opacity:0.6}
.cyber-button:hover .btn-background{transform:scale(1.02)}
.cyber-button:active{transform:scale(0.98)}

.power-bar{margin-top:12px}
.power-container{width:180px;height:8px;background:rgba(255,255,255,0.1);border:1px solid rgba(1,73,175,0.3);border-radius:6px;overflow:hidden;position:relative}
.power-fill{height:100%;width:0%;background:linear-gradient(90deg,#22d3ee,#0149af);transition:width 0.1s ease;box-shadow:0 0 10px rgba(34,211,238,0.5)}

.po-loader{position:absolute;inset:auto auto 16px 16px;color:rgba(1,73,175,0.8);font-size:.95rem;opacity:.9;pointer-events:none;font-family:"Orbitron",monospace;text-shadow:0 0 10px rgba(1,73,175,0.5)}

.music-toggle{position:absolute;bottom:16px;right:16px;z-index:3;width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,rgba(1,73,175,0.8),rgba(1,73,175,0.6));border:2px solid rgba(1,73,175,0.5);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s ease;box-shadow:0 0 15px rgba(1,73,175,0.3)}
.music-toggle:hover{transform:scale(1.1);box-shadow:0 0 25px rgba(1,73,175,0.6)}
.music-toggle.muted{background:linear-gradient(135deg,rgba(100,100,100,0.8),rgba(150,150,150,0.6));border-color:rgba(150,150,150,0.5)}
.music-icon{font-size:1.4rem;color:#ffffff;text-shadow:0 0 8px rgba(255,255,255,0.5)}

.power-bar-standalone{position:absolute;bottom:16px;left:16px;z-index:3;background:linear-gradient(135deg,rgba(1,73,175,0.15),rgba(0,0,0,0.8));backdrop-filter:blur(8px);border:2px solid rgba(1,73,175,0.3);border-radius:15px;padding:12px;color:#e5e7eb;font-family:"Orbitron",monospace;min-width:300px;box-shadow:0 0 20px rgba(1,73,175,0.3)}
.power-label{font-weight:800;letter-spacing:.05em;margin-bottom:8px;color:rgba(1,73,175,0.8);text-transform:uppercase;font-size:.9rem;text-align:center}
.power-container-large{width:280px;height:12px;background:rgba(255,255,255,0.1);border:2px solid rgba(1,73,175,0.3);border-radius:8px;overflow:hidden;position:relative}
.power-fill-large{height:100%;width:0%;background:linear-gradient(90deg,rgba(1,73,175,0.8),#0149af,#ef4444);transition:width 0.1s ease;box-shadow:0 0 15px rgba(1,73,175,0.5)}
</style>
<div class="po-wrap">
  <div id="scene"></div>
  
  <div class="hud-scoreboard">
    <div class="scoreboard-main">
      <span class="scoreboard-team">ATT</span>
      <span class="scoreboard-score" id="sb-score">0 — 0</span>
      <span class="scoreboard-team">GAR</span>
    </div>
    <div class="hud-stats" id="hud-score">Buts 0 — Tirs 0/5</div>
    <div class="hud-stats" id="hud-result">—</div>
  </div>

  <div class="hud-player">
    <div class="player-header">Joueur Sélectionné</div>
    <div class="player-avatar" id="player-avatar">
      <span style="color:#666;font-size:2rem">?</span>
    </div>
    <div class="player-name" id="player-name">Nicolas</div>
    <div class="player-stats">
      <div class="stat-row">
        <span class="stat-label">VITESSE</span>
        <span class="stat-value" id="stat-vitesse">83</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">TIR</span>
        <span class="stat-value" id="stat-tir">79</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">PASSE</span>
        <span class="stat-value" id="stat-passe">91</span>
      </div>
    </div>
  </div>

  <div class="hud-controls">
    <div class="controls-header">Contrôles</div>
    <div class="controls-list">
      <div>Maintiens pour charger</div>
      <div>Relâche pour tirer</div>
      <div>Cible peut dépasser</div>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button id="btn-restart" class="cyber-button" style="display:none">
        <div class="btn-background"></div>
        <div class="btn-border"></div>
        <div class="btn-glow"></div>
        <span class="btn-text">Rejouer</span>
      </button>
      <button id="btn-exit" class="cyber-button" style="display:none">
        <div class="btn-background"></div>
        <div class="btn-border"></div>
        <div class="btn-glow"></div>
        <span class="btn-text">Retour</span>
      </button>
    </div>
  </div>

  <div class="po-loader" id="po-loader">Chargement du terrain...</div>
  
  <div class="music-toggle" id="btn-music">
    <span class="music-icon" id="music-icon">🔊</span>
  </div>
  
  <div class="power-bar-standalone" id="power-bar-standalone">
    <div class="power-label">PUISSANCE</div>
    <div class="power-container-large">
      <div id="hud-power-fill" class="power-fill-large"></div>
    </div>
  </div>
</div>`;
    document.body.appendChild(overlay);
    return overlay;
  }

  async function openPenaltyOverlay() {
    // sécurité: cleanup si un ancien rendu existe encore
    if (window.__penaltyCleanup) {
      try {
        window.__penaltyCleanup();
      } catch {}
    }

    const overlay =
      document.getElementById("penalty-overlay") || createOverlay();
    const loader = overlay.querySelector("#po-loader");

    if (!window.THREE) {
      loader.textContent = "Chargement moteur 3D...";
      // Nouvelle approche avec ES modules qui fonctionne
      try {
        // Ajouter l'importmap
        const importMap = document.createElement("script");
        importMap.type = "importmap";
        importMap.textContent = JSON.stringify({
          imports: {
            three: "https://unpkg.com/three@0.158.0/build/three.module.js",
            "three/addons/": "https://unpkg.com/three@0.158.0/examples/jsm/",
          },
        });
        document.head.appendChild(importMap);

        // Charger les modules
        const THREE = await import(
          "https://unpkg.com/three@0.158.0/build/three.module.js"
        );
        const { GLTFLoader } = await import(
          "https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js"
        );

        // Exposer globalement pour compatibilité
        // Gérer le cas où THREE est un module ES avec default export
        if (THREE.default) {
          window.THREE = THREE.default;
        } else {
          window.THREE = THREE;
        }

        // S'assurer que GLTFLoader est attaché à THREE
        window.THREE.GLTFLoader = GLTFLoader;

        // Créer aussi une référence globale directe
        window.GLTFLoader = GLTFLoader;

        console.log(
          "THREE.js et GLTFLoader chargés avec succès via ES modules"
        );
        console.log("window.THREE:", typeof window.THREE);
        console.log("window.THREE.GLTFLoader:", typeof window.THREE.GLTFLoader);
        console.log("window.GLTFLoader:", typeof window.GLTFLoader);
        console.log("GLTFLoader function:", GLTFLoader);
      } catch (error) {
        console.error("Erreur chargement ES modules:", error);
        // Fallback vers l'ancienne méthode si nécessaire
        await loadScript("game/lib/three.js");
        await loadScript("game/lib/GLTFLoader.js");
      }
    }

    loader.textContent = "Chargement du jeu...";

    await loadScript("game/penalty.js");

    // passe le joueur sélectionné au jeu
    try {
      // Attendre que window.players soit disponible
      const players = window.players || [];
      if (players.length === 0) {
        console.warn("window.players est vide, attente...");
        // Petit délai pour laisser script.js initialiser
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const finalPlayers = window.players || [];
      const idx =
        typeof window.currentPlayerIndex === "number"
          ? window.currentPlayerIndex
          : 0;
      const p = finalPlayers[idx] || null;

      console.log("=== DEBUG PENALTY EMBED ===");
      console.log("Players disponibles:", finalPlayers.length);
      console.log("Index sélectionné:", idx);
      console.log("Joueur sélectionné:", p);

      let svgText = null;
      if (p && p.name) {
        const file = mapNameToAvatarFile(p.name);
        if (file) svgText = await fetchSVGText(`assets/avatar/${file}`);
        console.log("Fichier avatar:", file);
        console.log("SVG chargé:", svgText ? "OUI" : "NON");
      }
      if (typeof window.setSelectedPlayer === "function" && p) {
        console.log("Transmission des données:", {
          name: p.name,
          stats: p.stats,
          svg: svgText ? "SVG_PRESENT" : null,
        });
        window.setSelectedPlayer({
          name: p.name,
          stats: p.stats,
          svg: svgText || null,
        });
      }
    } catch (e) {
      console.error("Erreur transmission joueur:", e);
    }

    // branche le bouton retour pour fermer proprement l’overlay (sans recharger la page)
    const exitBtn = document.getElementById("btn-exit");
    if (exitBtn) {
      exitBtn.style.display = "inline-block";
      exitBtn.onclick = () => {
        // Cleanup avant rechargement pour éviter les fuites mémoire
        if (window.__penaltyCleanup) window.__penaltyCleanup();

        // Recharger complètement la page pour avoir l'animation de chargement
        window.location.reload();
      };
    }
    // petite attente pour lisser l’entrée
    setTimeout(() => loader && (loader.style.display = "none"), 300);
  }

  // ouverture lorsqu’on clique « COMMENCER LE MATCH » de ta modale existante
  document.addEventListener("click", (e) => {
    const btn = e.target && e.target.closest("#confirm-selection");
    if (!btn) return;
    // on laisse ton handler natif faire son animation, puis on ouvre l’overlay
    setTimeout(openPenaltyOverlay, 150);
  });
})();
