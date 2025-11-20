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
  const camBase = new THREE.Vector3(0, 2.5, 8); // Caméra plus haute et plus en arrière
  camera.position.copy(camBase);
  camera.lookAt(0, 1, -12); // Regarder vers la cage (goalZ sera défini plus tard)

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

  // ====== COORDONNÉES POUR LE PROCHAIN SOL 3D ======
  /*
  COORDONNÉES PARFAITES TESTÉES POUR UN SOL 3D :
  
  Position optimale : (0, -5.0, 0)
  - X: 0 (centré)
  - Y: -5.0 (bien au sol, pas trop haut)
  - Z: 0 (centré sur l'axe avant/arrière)
  
  Échelle optimale : 100.0 (gigantesque pour couvrir tout)
  
  Rotation optimale : 
  - X: 0 (terrain à plat)
  - Y: 0 (pas de rotation)
  - Z: 0 (pas de rotation)
  
  Éclairage pour révéler les couleurs :
  - DirectionalLight: intensité 3.0, position (0, 20, 10), target (0, -5.0, 0)
  - AmbientLight: couleur 0x90ee90, intensité 1.5
  - HemisphereLight: ciel 0x87ceeb, sol 0x228b22, intensité 1.0
  
  Forçage des matériaux si nécessaire :
  - Couleur: 0x4caf50 (vert herbe éclatant)
  - Émission: 0x2e7d32 (légère émission verte)
  - Roughness: 0.7, Metalness: 0.0
  */

  const goalZ = -12; // Distance réaliste pour un penalty (était -8)
  const goalWidth = 14; // Plus large pour un meilleur gameplay (était 11.7)
  const goalHeight = 5.8; // Hauteur équilibrée pour un bon gameplay (était 5.2)

  // Dimensions effectives de la cage 3D (avec l'échelle appliquée)
  const effective3DGoalWidth = goalWidth * 0.9; // Largeur réduite par l'échelle 0.9
  const effective3DGoalHeight = goalHeight * 1.1; // Hauteur augmentée par l'échelle 1.1
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

  // Filet supprimé - remplacé par la cage 3D avec son propre filet

  // Zone de visée autorisée (basée sur les dimensions effectives de la cage 3D)
  const aimingLimits = {
    minY: 0.2, // Juste au-dessus du sol
    maxY: effective3DGoalHeight + 1.8, // Raisonnable au-dessus de la barre 3D
    minX: -(effective3DGoalWidth / 2) - 2.5, // Largeur généreuse basée sur la cage 3D
    maxX: effective3DGoalWidth / 2 + 2.5, // Largeur généreuse basée sur la cage 3D
  };

  // Cadre invisible - les limites sont actives mais non visibles
  const frameGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(aimingLimits.minX, aimingLimits.minY, goalZ + 0.001),
    new THREE.Vector3(aimingLimits.maxX, aimingLimits.minY, goalZ + 0.001),
    new THREE.Vector3(aimingLimits.maxX, aimingLimits.maxY, goalZ + 0.001),
    new THREE.Vector3(aimingLimits.minX, aimingLimits.maxY, goalZ + 0.001),
    new THREE.Vector3(aimingLimits.minX, aimingLimits.minY, goalZ + 0.001),
  ]);
  const frameMat = new THREE.LineBasicMaterial({
    color: 0x22ff88,
    transparent: true,
    opacity: 0.0, // Complètement invisible
  });
  const frame = new THREE.Line(frameGeo, frameMat);
  frame.visible = false; // Double sécurité - complètement masqué
  scene.add(frame);

  const ballGeom = new THREE.SphereGeometry(0.22, 32, 32);
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0.1,
  });
  let ball = new THREE.Mesh(ballGeom, ballMat);
  const ballRadius = 0.22;
  ball.position.set(0, 0.22, -0.5);
  ball.castShadow = true;
  ball.receiveShadow = true;
  scene.add(ball);

  // Fonction pour remplacer la balle par le modèle 3D
  function replaceBallWith3D() {
    // Utiliser la référence GLTFLoader qui fonctionne
    let GLTFLoaderClass;
    if (typeof THREE.GLTFLoader !== "undefined") {
      GLTFLoaderClass = THREE.GLTFLoader;
    } else if (typeof window.THREE?.GLTFLoader !== "undefined") {
      GLTFLoaderClass = window.THREE.GLTFLoader;
    } else if (typeof window.GLTFLoader !== "undefined") {
      GLTFLoaderClass = window.GLTFLoader;
    } else {
      console.error("Aucune référence GLTFLoader trouvée");
      return;
    }

    console.log("Utilisation de GLTFLoader:", GLTFLoaderClass);
    const loader = new GLTFLoaderClass();
    loader.load(
      "game/assets/models/objects/soccer-ball.glb",
      function (gltf) {
        console.log("Modèle soccer-ball.glb chargé avec succès");

        // Supprimer l'ancienne balle
        scene.remove(ball);

        // Configurer la nouvelle balle 3D
        ball = gltf.scene;
        ball.scale.setScalar(0.8); // Même taille que l'ancienne
        ball.position.set(0, 0.22, -0.5); // Même position
        ball.castShadow = true;
        ball.receiveShadow = true;

        // Configurer tous les meshes
        ball.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        scene.add(ball);
        console.log("Balle 3D intégrée dans le jeu");
      },
      function (progress) {
        console.log(
          "Chargement balle 3D:",
          Math.round((progress.loaded / progress.total) * 100) + "%"
        );
      },
      function (error) {
        console.error("Erreur chargement balle 3D:", error);
        console.log("Conservation de la balle par défaut");
      }
    );
  }

  // Fonction pour attendre que GLTFLoader soit disponible
  function waitForGLTFLoader(callback, maxAttempts = 50) {
    let attempts = 0;

    function checkLoader() {
      attempts++;

      // Debug détaillé
      if (attempts <= 3 || attempts % 10 === 0) {
        // Réduire le spam de logs
        console.log("=== DEBUG GLTFLoader (tentative " + attempts + ") ===");
        console.log("window.THREE:", typeof window.THREE);
        console.log("THREE.GLTFLoader:", typeof THREE.GLTFLoader);
        console.log(
          "window.THREE.GLTFLoader:",
          typeof window.THREE?.GLTFLoader
        );
        console.log("window.GLTFLoader:", typeof window.GLTFLoader);
      }

      // Vérifier plusieurs façons d'accéder à GLTFLoader
      const hasGLTFLoader =
        typeof THREE.GLTFLoader !== "undefined" ||
        typeof window.THREE?.GLTFLoader !== "undefined" ||
        typeof window.GLTFLoader !== "undefined";

      if (hasGLTFLoader) {
        console.log("GLTFLoader trouvé, chargement du modèle 3D...");
        callback();
      } else if (attempts < maxAttempts) {
        console.log(
          "Attente du GLTFLoader... (tentative " +
            attempts +
            "/" +
            maxAttempts +
            ")"
        );
        setTimeout(checkLoader, 100);
      } else {
        console.log(
          "GLTFLoader non disponible après " +
            maxAttempts +
            " tentatives, conservation de la balle par défaut"
        );
      }
    }

    checkLoader();
  }

  // Attendre que GLTFLoader soit disponible puis charger les modèles 3D
  waitForGLTFLoader(replaceBallWith3D);
  waitForGLTFLoader(replacePlayerWith3D);
  waitForGLTFLoader(replaceKeeperWith3D);
  waitForGLTFLoader(replaceGoalWith3D);
  // waitForGLTFLoader(replaceFieldWith3D); // DÉSACTIVÉ - Sol 3D pas satisfaisant

  // Variables pour le gardien 3D
  let keeperMixer = null;
  let keeperIdleAction = null;
  let keeperAnimationInProgress = false; // Pour empêcher les tirs pendant les animations
  let keeperAnimations = {
    idle: null,
    low_left_diving: null,
    low_middle_diving: null,
    low_right_diving: null,
    up_left_diving: null,
    up_middle_diving: null,
    up_right_diving: null,
  };

  // Variables pour le joueur 3D
  let playerMixer = null;
  let playerIdleAction = null;
  let playerAnimations = {
    idle: null,
    shoot: null,
    miss: null,
    victory: null,
  };

  // Fonction pour remplacer le gardien par le modèle 3D
  function replaceKeeperWith3D() {
    // Utiliser la référence GLTFLoader qui fonctionne
    let GLTFLoaderClass;
    if (typeof THREE.GLTFLoader !== "undefined") {
      GLTFLoaderClass = THREE.GLTFLoader;
    } else if (typeof window.THREE?.GLTFLoader !== "undefined") {
      GLTFLoaderClass = window.THREE.GLTFLoader;
    } else if (typeof window.GLTFLoader !== "undefined") {
      GLTFLoaderClass = window.GLTFLoader;
    } else {
      console.error("Aucune référence GLTFLoader trouvée pour le gardien");
      return;
    }

    console.log("Chargement du gardien 3D...");
    const loader = new GLTFLoaderClass();
    loader.load(
      "game/assets/models/players/goalkeeper-3d.glb",
      function (gltf) {
        console.log("Modèle goalkeeper-3d.glb chargé avec succès");

        // Supprimer les éléments du gardien par défaut
        scene.remove(keeper);
        keeper.clear(); // Nettoyer le groupe

        // Configurer le nouveau gardien 3D
        const keeper3D = gltf.scene;
        keeper3D.position.set(0, 0, goalZ + 0.02);
        keeper3D.scale.setScalar(4); // Taille ajustée pour le jeu
        keeper3D.castShadow = true;
        keeper3D.receiveShadow = true;

        console.log("Position gardien 3D:", keeper3D.position);
        console.log("Échelle gardien 3D:", keeper3D.scale);
        console.log("goalZ:", goalZ);

        // Configurer tous les meshes et améliorer l'éclairage
        keeper3D.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;

            // Améliorer l'éclairage des matériaux
            if (node.material) {
              // Réduire la rugosité pour plus de brillance
              if (node.material.roughness !== undefined) {
                node.material.roughness = Math.max(
                  0.3,
                  node.material.roughness * 0.7
                );
              }

              // Réduire le métallique pour un aspect plus naturel
              if (node.material.metalness !== undefined) {
                node.material.metalness = Math.min(
                  0.1,
                  node.material.metalness
                );
              }

              // Augmenter l'émission pour éclaircir
              if (node.material.emissive !== undefined) {
                node.material.emissive.setHex(0x111111); // Légère émission
              }

              console.log(
                "Matériau gardien configuré:",
                node.name,
                node.material.type
              );
            }
          }
        });

        // Ajouter un éclairage spécifique pour le gardien
        const keeperLight = new THREE.PointLight(0xffffff, 0.8, 10);
        keeperLight.position.set(0, 5, goalZ + 3); // Ajusté pour la nouvelle taille de cage
        scene.add(keeperLight);
        console.log("Éclairage spécifique ajouté pour le gardien");

        // Ajouter le gardien 3D directement à la scène
        keeper = keeper3D;
        scene.add(keeper);

        console.log("Gardien 3D intégré dans le jeu");

        // Configuration des animations
        if (gltf.animations && gltf.animations.length > 0) {
          keeperMixer = new THREE.AnimationMixer(keeper);

          console.log(
            "Animations du gardien trouvées:",
            gltf.animations.length
          );

          // Stocker toutes les animations
          gltf.animations.forEach((clip, index) => {
            console.log(
              `Animation ${index}: ${clip.name} (durée: ${clip.duration.toFixed(
                2
              )}s)`
            );

            const animName = clip.name.toLowerCase();
            if (animName.includes("idle")) {
              keeperAnimations.idle = keeperMixer.clipAction(clip);
            } else if (animName.includes("low_left_diving")) {
              keeperAnimations.low_left_diving = keeperMixer.clipAction(clip);
            } else if (animName.includes("low_middle_diving")) {
              keeperAnimations.low_middle_diving = keeperMixer.clipAction(clip);
            } else if (animName.includes("low_right_diving")) {
              keeperAnimations.low_right_diving = keeperMixer.clipAction(clip);
            } else if (animName.includes("up_left_diving")) {
              keeperAnimations.up_left_diving = keeperMixer.clipAction(clip);
            } else if (animName.includes("up_middle_diving")) {
              keeperAnimations.up_middle_diving = keeperMixer.clipAction(clip);
            } else if (animName.includes("up_right_diving")) {
              keeperAnimations.up_right_diving = keeperMixer.clipAction(clip);
            }
          });

          // Démarrer l'animation idle
          if (keeperAnimations.idle) {
            keeperAnimations.idle.loop = THREE.LoopRepeat;
            keeperAnimations.idle.play();
            keeperIdleAction = keeperAnimations.idle;
            console.log("Animation idle du gardien démarrée");
          } else if (gltf.animations.length > 0) {
            // Si pas d'idle spécifique, utiliser la première animation
            keeperIdleAction = keeperMixer.clipAction(gltf.animations[0]);
            keeperIdleAction.loop = THREE.LoopRepeat;
            keeperIdleAction.play();
            console.log("Première animation du gardien démarrée");
          }
        } else {
          console.log("Aucune animation trouvée pour le gardien");
        }
      },
      function (progress) {
        console.log(
          "Chargement gardien 3D:",
          Math.round((progress.loaded / progress.total) * 100) + "%"
        );
      },
      function (error) {
        console.error("Erreur chargement gardien 3D:", error);
        console.log("Conservation du gardien par défaut");
      }
    );
  }

  // Fonction pour jouer une animation de plongée selon la direction
  function playKeeperDiveAnimation(targetX, targetY) {
    if (!keeperMixer || !keeperAnimations) return;

    // Arrêter l'animation actuelle
    if (keeperIdleAction) {
      keeperIdleAction.stop();
    }

    // Déterminer quelle animation jouer selon la position de la balle
    let animationName;

    if (targetY > 2.5) {
      // Plongée haute
      if (targetX < -1.5) {
        animationName = "up_left_diving";
      } else if (targetX > 1.5) {
        animationName = "up_right_diving";
      } else {
        animationName = "up_middle_diving";
      }
    } else {
      // Plongée basse
      if (targetX < -1.5) {
        animationName = "low_left_diving";
      } else if (targetX > 1.5) {
        animationName = "low_right_diving";
      } else {
        animationName = "low_middle_diving";
      }
    }

    const animation = keeperAnimations[animationName];
    if (animation) {
      animation.reset();
      animation.loop = THREE.LoopOnce;
      animation.play();
      keeperAnimationInProgress = true; // Marquer qu'une animation est en cours
      console.log(`Animation de plongée jouée: ${animationName}`);

      // Afficher un message d'attente
      if (resultEl) {
        resultEl.textContent = "Gardien en action...";
      }

      // Revenir à l'idle immédiatement après l'animation de plongée
      const animationDuration = animation.getClip().duration * 1000;

      setTimeout(() => {
        if (keeperAnimations.idle) {
          keeperAnimations.idle.reset();
          keeperAnimations.idle.loop = THREE.LoopRepeat;
          keeperAnimations.idle.play();
          keeperIdleAction = keeperAnimations.idle;
          console.log("Animation idle redémarrée après plongée");
        }
      }, animationDuration);

      // Débloquer les tirs avec un délai supplémentaire
      setTimeout(() => {
        keeperAnimationInProgress = false; // Animation terminée
        console.log("Gardien prêt pour le prochain tir");

        // Effacer le message d'attente
        if (resultEl) {
          resultEl.textContent = "—";
        }
      }, animationDuration + 2000); // +2 secondes de délai
    }
  }

  // Fonction pour remplacer le joueur par le modèle 3D
  function replacePlayerWith3D() {
    // Utiliser la référence GLTFLoader qui fonctionne
    let GLTFLoaderClass;
    if (THREE.GLTFLoader) {
      GLTFLoaderClass = THREE.GLTFLoader;
    } else if (window.THREE && window.THREE.GLTFLoader) {
      GLTFLoaderClass = window.THREE.GLTFLoader;
    } else if (window.GLTFLoader) {
      GLTFLoaderClass = window.GLTFLoader;
    } else {
      console.error("GLTFLoader non disponible pour le joueur");
      return;
    }

    console.log("Chargement du modèle joueur 3D...");
    const loader = new GLTFLoaderClass();

    loader.load(
      "game/assets/models/players/nico-3d.glb",
      function (gltf) {
        console.log("Modèle nico-3d.glb chargé avec succès", gltf);

        // Supprimer l'ancien joueur par défaut
        scene.remove(player);

        // Configurer le nouveau joueur 3D
        const player3D = gltf.scene;
        const playerZ = ball.position.z + 4.0; // Plus loin de la balle pour une meilleure position
        const playerX = -1.0;
        player3D.position.set(playerX, 0, playerZ);
        player3D.scale.setScalar(1.4); // Taille réduite pour le jeu

        // Rotation pour qu'il soit dos à la caméra (face aux buts)
        player3D.rotation.y = Math.PI; // 180 degrés

        player3D.castShadow = true;
        player3D.receiveShadow = true;

        // Configurer tous les meshes et améliorer l'éclairage
        player3D.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;

            // Améliorer l'éclairage des matériaux
            if (node.material) {
              // Réduire la rugosité pour plus de brillance
              if (node.material.roughness !== undefined) {
                node.material.roughness = Math.max(
                  0.2,
                  node.material.roughness * 0.6
                );
              }

              // Réduire le métallique pour un aspect plus naturel
              if (node.material.metalness !== undefined) {
                node.material.metalness = Math.min(
                  0.05,
                  node.material.metalness
                );
              }

              // Émission modérée pour un éclairage naturel
              if (node.material.emissive !== undefined) {
                node.material.emissive.setHex(0x111111); // Émission légère
              }

              // Garder les couleurs originales du modèle
              // (Pas de modification forcée des couleurs)

              console.log(
                "Matériau joueur configuré:",
                node.name,
                node.material.type
              );
            }
          }
        });

        // Éclairage équilibré pour le joueur
        const playerLight = new THREE.PointLight(0xffffff, 1.0, 10); // Intensité modérée
        playerLight.position.set(playerX, 4, playerZ + 1);
        scene.add(playerLight);

        // Éclairage d'appoint doux devant le joueur
        const playerFrontLight = new THREE.DirectionalLight(0xffffff, 0.4); // Doux
        playerFrontLight.position.set(playerX, 3, playerZ - 2);
        playerFrontLight.target.position.set(playerX, 1, playerZ);
        scene.add(playerFrontLight);
        scene.add(playerFrontLight.target);

        // ÉCLAIRAGE ARRIÈRE pour éviter le dos tout noir
        const playerBackLight = new THREE.DirectionalLight(0xffffff, 0.8); // Plus intense pour le dos
        playerBackLight.position.set(playerX, 5, playerZ + 3); // Derrière et au-dessus de Nico
        playerBackLight.target.position.set(playerX, 1, playerZ);
        scene.add(playerBackLight);
        scene.add(playerBackLight.target);

        // Lumière latérale pour un éclairage uniforme
        const playerSideLight = new THREE.PointLight(0xffffff, 0.6, 8); // Lumière omnidirectionnelle
        playerSideLight.position.set(playerX + 2, 3, playerZ); // À côté de Nico
        scene.add(playerSideLight);

        console.log(
          "Éclairage 360° ajouté pour le joueur (devant, derrière, côté)"
        );

        // Remplacer la référence globale du joueur
        scene.remove(player);
        scene.add(player3D);

        // Mettre à jour la référence globale
        window.player = player3D; // Pour accès depuis d'autres parties du code

        console.log("Joueur 3D intégré dans le jeu");

        // Configurer les animations
        if (gltf.animations && gltf.animations.length > 0) {
          playerMixer = new THREE.AnimationMixer(player3D);

          console.log("Animations du joueur trouvées:", gltf.animations.length);

          // Stocker les animations par nom
          gltf.animations.forEach((clip, index) => {
            const action = playerMixer.clipAction(clip);
            const animName = clip.name.toLowerCase();

            console.log(
              `Animation ${index}: ${clip.name} (durée: ${clip.duration.toFixed(
                2
              )}s)`
            );

            if (animName.includes("idle")) {
              playerAnimations.idle = action;
            } else if (animName.includes("shoot")) {
              playerAnimations.shoot = action;
            } else if (animName.includes("miss")) {
              playerAnimations.miss = action;
            } else if (animName.includes("victory")) {
              playerAnimations.victory = action;
            }
          });

          // Démarrer l'animation idle par défaut
          if (playerAnimations.idle) {
            playerAnimations.idle.loop = THREE.LoopRepeat;
            playerAnimations.idle.play();
            playerIdleAction = playerAnimations.idle;
            console.log("Animation idle du joueur démarrée");
          }
        } else {
          console.log("Aucune animation trouvée dans le modèle joueur");
        }
      },
      function (progress) {
        console.log(
          "Chargement joueur 3D:",
          Math.round((progress.loaded / progress.total) * 100) + "%"
        );
      },
      function (error) {
        console.error("Erreur chargement joueur 3D:", error);
      }
    );
  }

  // ====== FONCTION POUR REMPLACER LA CAGE PAR UN MODÈLE 3D ======
  function replaceGoalWith3D() {
    // Utiliser la référence GLTFLoader qui fonctionne
    let GLTFLoaderClass;
    if (THREE.GLTFLoader) {
      GLTFLoaderClass = THREE.GLTFLoader;
    } else if (window.THREE && window.THREE.GLTFLoader) {
      GLTFLoaderClass = window.THREE.GLTFLoader;
    } else if (window.GLTFLoader) {
      GLTFLoaderClass = window.GLTFLoader;
    } else {
      console.error("GLTFLoader non disponible pour la cage");
      return;
    }

    console.log("Chargement du modèle cage 3D...");
    const loader = new GLTFLoaderClass();

    loader.load(
      "game/assets/models/objects/football-goal-3d.glb",
      function (gltf) {
        console.log("Modèle football-goal-3d.glb chargé avec succès", gltf);

        // Supprimer directement les éléments de cage basiques connus
        console.log("Suppression des éléments de cage basiques...");

        // Supprimer les poteaux et barre transversale par leurs références directes
        if (typeof leftPost !== "undefined") {
          scene.remove(leftPost);
          console.log("Poteau gauche supprimé");
        }
        if (typeof rightPost !== "undefined") {
          scene.remove(rightPost);
          console.log("Poteau droit supprimé");
        }
        if (typeof crossbar !== "undefined") {
          scene.remove(crossbar);
          console.log("Barre transversale supprimée");
        }

        // Méthode de secours : supprimer par géométrie
        const elementsToRemove = [];
        scene.traverse(function (object) {
          if (object.isMesh && object.geometry && object.material) {
            // Vérifier si c'est un cylindre (poteaux) avec les bonnes dimensions
            if (object.geometry.type === "CylinderGeometry") {
              const params = object.geometry.parameters;
              if (
                params &&
                ((params.radiusTop === postR && params.height === goalHeight) || // Poteau vertical
                  (params.radiusTop === postR && params.height === goalWidth))
              ) {
                // Barre horizontale
                elementsToRemove.push(object);
              }
            }
          }
        });

        console.log(
          `Suppression de ${elementsToRemove.length} éléments supplémentaires`
        );
        elementsToRemove.forEach((element) => scene.remove(element));

        // Configurer la nouvelle cage 3D
        const goal3D = gltf.scene;

        // Position ajustée pour centrer parfaitement avec le gardien
        goal3D.position.set(0, 0, goalZ); // Même position Z que le gardien
        goal3D.scale.set(0.9, 1.1, 0.9); // Largeur/profondeur réduite, hauteur augmentée

        // Rotation de la cage dans le bon sens
        goal3D.rotation.y = -Math.PI / 2; // -90° (ou 270°) pour inverser le sens

        // Ajustement fin pour centrer parfaitement avec le gardien
        goal3D.position.x = -4.0; // Décaler un tout petit peu plus à gauche pour centrage parfait
        goal3D.position.y = 0; // Au niveau du sol

        console.log("Position finale cage 3D:", goal3D.position);
        console.log(
          "Position gardien:",
          keeper ? keeper.position : "Gardien non chargé"
        );

        goal3D.castShadow = true;
        goal3D.receiveShadow = true;

        // Configurer tous les meshes de la cage
        goal3D.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;

            // Améliorer les matériaux pour un rendu optimal
            if (node.material) {
              // Ajuster pour un aspect métallique réaliste (poteaux)
              if (node.material.roughness !== undefined) {
                node.material.roughness = 0.3; // Métal légèrement rugueux
              }
              if (node.material.metalness !== undefined) {
                node.material.metalness = 0.8; // Très métallique pour les poteaux
              }

              console.log(
                "Matériau cage configuré:",
                node.name,
                node.material.type
              );
            }
          }
        });

        // Ajouter la cage 3D à la scène
        scene.add(goal3D);

        console.log("Cage 3D intégrée dans le jeu avec succès !");
        console.log("Position:", goal3D.position);
        console.log("Échelle:", goal3D.scale);
      },
      function (progress) {
        console.log(
          "Chargement cage 3D:",
          Math.round((progress.loaded / progress.total) * 100) + "%"
        );
      },
      function (error) {
        console.error("Erreur chargement cage 3D:", error);
        console.log("Conservation de la cage basique par défaut");
      }
    );
  }

  // ====== FONCTION POUR REMPLACER LE TERRAIN PAR UN MODÈLE 3D ======
  function replaceFieldWith3D() {
    // Utiliser la référence GLTFLoader qui fonctionne
    let GLTFLoaderClass;
    if (THREE.GLTFLoader) {
      GLTFLoaderClass = THREE.GLTFLoader;
    } else if (window.THREE && window.THREE.GLTFLoader) {
      GLTFLoaderClass = window.THREE.GLTFLoader;
    } else if (window.GLTFLoader) {
      GLTFLoaderClass = window.GLTFLoader;
    } else {
      console.error("GLTFLoader non disponible pour le terrain");
      return;
    }

    console.log("Chargement du modèle terrain 3D...");
    const loader = new GLTFLoaderClass();

    loader.load(
      "game/assets/models/objects/grass.glb",
      function (gltf) {
        console.log("Modèle grass.glb chargé avec succès", gltf);

        // Supprimer l'ancien terrain basique
        scene.remove(field);
        console.log("Ancien terrain basique supprimé");

        // Configurer le nouveau terrain 3D
        const field3D = gltf.scene;
        field3D.position.set(0, -5.0, 0); // ÉNORMÉMENT plus bas pour être vraiment au sol
        field3D.scale.setScalar(100.0); // GIGANTESQUE pour couvrir tout l'horizon !

        // Rotation pour que le terrain soit complètement à plat
        field3D.rotation.x = 0; // Pas de rotation sur X pour qu'il soit à plat
        field3D.rotation.y = 0; // Pas de rotation sur Y
        field3D.rotation.z = 0; // Pas de rotation sur Z

        field3D.castShadow = false; // Le terrain ne projette pas d'ombre
        field3D.receiveShadow = true; // Mais il reçoit les ombres

        // Configurer tous les meshes du terrain
        field3D.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = false; // Le terrain ne projette pas d'ombre
            node.receiveShadow = true; // Mais il reçoit les ombres

            // Forcer les matériaux à être verts et bien éclairés
            if (node.material) {
              // FORCER la couleur verte du terrain
              node.material.color = new THREE.Color(0x4caf50); // Vert herbe éclatant

              // Ajuster pour un aspect herbe réaliste
              if (node.material.roughness !== undefined) {
                node.material.roughness = 0.7; // Herbe moins rugueuse pour plus de luminosité
              }
              if (node.material.metalness !== undefined) {
                node.material.metalness = 0.0; // Pas métallique du tout
              }

              // Ajouter de l'émission pour s'assurer qu'il soit visible
              if (node.material.emissive !== undefined) {
                node.material.emissive = new THREE.Color(0x2e7d32); // Légère émission verte
              }

              // S'assurer que le matériau reçoit la lumière
              node.material.needsUpdate = true;

              console.log(
                "Matériau terrain FORCÉ au vert:",
                node.name,
                node.material.type,
                "Couleur:",
                node.material.color.getHexString()
              );
            }
          }
        });

        // Éclairage MASSIF pour révéler les vraies couleurs du terrain
        const fieldMainLight = new THREE.DirectionalLight(0xffffff, 3.0); // Lumière encore plus intense
        fieldMainLight.position.set(0, 20, 10); // Haute et légèrement devant
        fieldMainLight.target.position.set(0, -5.0, 0); // Pointe exactement sur le terrain à sa nouvelle position
        scene.add(fieldMainLight);
        scene.add(fieldMainLight.target);

        // Lumière ambiante verte naturelle très forte
        const fieldAmbientLight = new THREE.AmbientLight(0x90ee90, 1.5); // Vert clair naturel très fort
        scene.add(fieldAmbientLight);

        // Lumière supplémentaire pour les couleurs
        const fieldColorLight = new THREE.HemisphereLight(
          0x87ceeb,
          0x228b22,
          1.0
        ); // Ciel bleu vers vert
        scene.add(fieldColorLight);

        console.log("Éclairage spécifique du terrain ajouté");

        // Ajouter le terrain 3D à la scène
        scene.add(field3D);

        console.log("Terrain 3D intégré dans le jeu avec succès !");
        console.log("Position:", field3D.position);
        console.log("Échelle:", field3D.scale);
      },
      function (progress) {
        console.log(
          "Chargement terrain 3D:",
          Math.round((progress.loaded / progress.total) * 100) + "%"
        );
      },
      function (error) {
        console.error("Erreur chargement terrain 3D:", error);
        console.log("Création d'un terrain de secours...");

        // Créer un terrain de secours plus grand
        const fallbackFieldGeom = new THREE.PlaneGeometry(40, 60); // Plus grand que l'original
        const fallbackFieldMat = new THREE.MeshStandardMaterial({
          color: 0x0b5d3c,
          roughness: 0.95,
          metalness: 0.05,
        });
        const fallbackField = new THREE.Mesh(
          fallbackFieldGeom,
          fallbackFieldMat
        );
        fallbackField.rotation.x = -Math.PI / 2;
        fallbackField.receiveShadow = true;
        fallbackField.position.set(0, -0.01, 0);
        scene.add(fallbackField);

        console.log("Terrain de secours créé");
      }
    );
  }

  // Fonctions pour gérer les animations du joueur
  function playPlayerShootAnimation() {
    if (!playerMixer || !playerAnimations.shoot) {
      return { duration: 0, kickTiming: 0 }; // Fallback si pas d'animation
    }

    // Arrêter l'animation actuelle
    if (playerIdleAction) {
      playerIdleAction.stop();
    }

    // Jouer l'animation de tir
    const shootAction = playerAnimations.shoot;
    shootAction.reset();
    shootAction.loop = THREE.LoopOnce;
    shootAction.play();

    const animationDuration = shootAction.getClip().duration * 1000; // en ms
    // Estimer que le contact avec la balle se fait à 60% de l'animation
    const kickTiming = animationDuration * 0.6;

    console.log(
      `Animation de tir jouée - Durée: ${animationDuration}ms, Contact balle: ${kickTiming}ms`
    );

    // Revenir à l'idle après l'animation
    setTimeout(() => {
      if (playerAnimations.idle) {
        playerAnimations.idle.reset();
        playerAnimations.idle.loop = THREE.LoopRepeat;
        playerAnimations.idle.play();
        playerIdleAction = playerAnimations.idle;
        console.log("Retour à l'animation idle du joueur");
      }
    }, animationDuration);

    return { duration: animationDuration, kickTiming: kickTiming };
  }

  function playPlayerResultAnimation(result) {
    // Fonction désactivée pour éviter les perturbations du jeu
    // Nico reste simplement en animation idle après les tirs
    console.log(`Résultat: ${result} - Animation de résultat désactivée`);
    return;
  }

  let player = new THREE.Group();
  scene.add(player);
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 1.0, 0.3),
    new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.1,
      roughness: 0.8,
    })
  );
  const playerZ = ball.position.z + 4.0; // Position cohérente avec le joueur 3D
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

  let keeper = new THREE.Group();
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

  // Charger le gardien 3D après la création du gardien par défaut
  waitForGLTFLoader(replaceKeeperWith3D);

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
  let powerLocked = false; // Nouveau : bloquer au maximum
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
  let vBallBase = 10; // Vitesse ajustée pour la nouvelle distance de cage
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
    vBallBase = THREE.MathUtils.lerp(8, 14, t); // Plage ajustée pour la nouvelle distance
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

    // ====== LIMITES DE VISÉE ======
    return applyAimingLimits(p);
  }

  function applyAimingLimits(targetPoint) {
    if (!targetPoint) return null;

    // Utiliser les limites définies globalement
    const clampedX = clamp(targetPoint.x, aimingLimits.minX, aimingLimits.maxX);
    const clampedY = clamp(targetPoint.y, aimingLimits.minY, aimingLimits.maxY);

    // Créer le point limité
    const limitedPoint = new THREE.Vector3(clampedX, clampedY, targetPoint.z);

    // Debug des limites (optionnel)
    const wasLimited = targetPoint.x !== clampedX || targetPoint.y !== clampedY;

    // Debug optionnel des limites (désactivé pour une expérience plus fluide)
    if (wasLimited && false) {
      // Mettre à true pour debug
      console.log("🎯 Visée limitée:", {
        original: { x: targetPoint.x.toFixed(2), y: targetPoint.y.toFixed(2) },
        limited: { x: clampedX.toFixed(2), y: clampedY.toFixed(2) },
        limites: {
          X: `[${aimingLimits.minX.toFixed(1)}, ${aimingLimits.maxX.toFixed(
            1
          )}]`,
          Y: `[${aimingLimits.minY.toFixed(1)}, ${aimingLimits.maxY.toFixed(
            1
          )}]`,
        },
      });
    }

    return limitedPoint;
  }

  function buildTrajectoryPreview(start, target, speedFactor = 1) {
    const pts = [];
    const dist = start.distanceTo(target);
    const duration = Math.max(0.5, dist / (vBallBase * speedFactor)); // Cohérent avec le vrai tir
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
    if (isShooting || sessionOver || keeperAnimationInProgress) {
      if (keeperAnimationInProgress) {
        console.log("Tir bloqué - Gardien en animation, veuillez patienter...");
      }
      return;
    }
    isShooting = true;
    aimRing.visible = false;
    trajectory.visible = false;
    if (resultEl) resultEl.textContent = "…";

    // Jouer l'animation de tir du joueur et récupérer le timing
    const animationInfo = playPlayerShootAnimation();

    // Délai le démarrage de la balle jusqu'au moment du contact
    const kickDelay = animationInfo.kickTiming;
    console.log(`Balle programmée pour démarrer dans ${kickDelay}ms`);

    // Programmer le départ de la balle avec le bon timing
    setTimeout(() => {
      actuallyShootBall(target, powerFactor);
    }, kickDelay);
  }

  // Fonction séparée pour le vrai départ de la balle
  function actuallyShootBall(target, powerFactor) {
    // ====== SYSTÈME DE DISPERSION AMÉLIORÉ ======
    const pow01 = clamp((powerFactor - 0.7) / 0.6, 0, 1);

    // Dispersion selon la puissance (CHAOS MAXIMUM !)
    const minDisp = dispersionBase * 0.5; // ULTRA précis à faible puissance
    const maxDisp = dispersionBase * 8.0; // CHAOS TOTAL à forte puissance !
    const dispersion = THREE.MathUtils.lerp(
      minDisp,
      maxDisp,
      Math.pow(pow01, 0.6)
    ); // Progression agressive

    // Angle et rayon aléatoires pour la dispersion
    const ang = Math.random() * Math.PI * 2;
    const r = Math.random() * dispersion;

    // Appliquer la dispersion au point cible
    const targetJ = target.clone();
    targetJ.x += Math.cos(ang) * r;
    targetJ.y += Math.sin(ang) * r;

    // Debug optionnel de la dispersion
    if (dispersion > dispersionBase * 2) {
      console.log(
        `🎯 Tir imprécis ! Puissance: ${(powerFactor * 100).toFixed(
          0
        )}%, Dispersion: ${dispersion.toFixed(2)}`
      );
    }

    const start = ball.position.clone();
    const dist = start.distanceTo(targetJ);
    const speed = vBallBase * powerFactor;
    const duration = Math.max(0.5, dist / speed); // Durée minimum augmentée
    const arcHeight = clamp(dist * 0.12, 0.35, 1.2);
    const t0 = performance.now();

    keeperPlan.startX = 0;
    keeperPlan.startY = 1.0;
    planKeeperDive(targetJ.x, targetJ.y);

    // Jouer l'animation de plongée correspondante
    playKeeperDiveAnimation(targetJ.x, targetJ.y);

    const camShot = new THREE.Vector3(0, 2.7, 7.5); // Ajustée pour la nouvelle distance

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
          keeper.position.set(x, 0, goalZ + 0.02);

          // S'assurer que l'échelle reste constante pour le gardien 3D
          if (keeper.type === "Group" && !keeperBody) {
            // C'est le gardien 3D, maintenir l'échelle
            keeper.scale.setScalar(4); // Maintenir la taille
          }

          // Pour le gardien par défaut seulement
          if (keeperBody) {
            keeperBody.position.set(x, y - 0.1, goalZ + 0.02);
          }
          if (gloveL && gloveR) {
            gloveL.position.set(x - 0.35, y + 0.2, goalZ + 0.02);
            gloveR.position.set(x + 0.35, y + 0.2, goalZ + 0.02);
          }
        } else {
          keeper.position.set(0, 0, goalZ + 0.02);

          // S'assurer que l'échelle reste constante pour le gardien 3D
          if (keeper.type === "Group" && !keeperBody) {
            // C'est le gardien 3D, maintenir l'échelle
            keeper.scale.setScalar(4); // Maintenir la taille
          }

          // Pour le gardien par défaut
          if (keeperBody) {
            keeperBody.position.set(0, 0.9, goalZ + 0.02);
          }
          if (gloveL && gloveR) {
            gloveL.position.set(-0.35, 1.2, goalZ + 0.02);
            gloveR.position.set(0.35, 1.2, goalZ + 0.02);
          }
        }
      }

      if (k < 1) {
        requestAnimationFrame(step);
      } else {
        let saved = false;
        let saveRadius, gL, gR;

        if (gloveL && gloveR) {
          // Gardien par défaut avec gants
          saveRadius = 0.3;
          gL = new THREE.Vector3(
            gloveL.position.x,
            gloveL.position.y,
            goalZ + 0.02
          );
          gR = new THREE.Vector3(
            gloveR.position.x,
            gloveR.position.y,
            goalZ + 0.02
          );
        } else {
          // Gardien 3D - approche simplifiée avec zone énorme
          const keeperPos = keeper.position;

          // Zone de détection MASSIVE pour garantir des arrêts
          saveRadius = 3.0; // Zone énorme !

          // Position centrale du gardien comme point de référence unique
          gL = gR = new THREE.Vector3(
            keeperPos.x,
            keeperPos.y + 1.5, // Un peu au-dessus du sol
            goalZ + 0.02
          );

          console.log("=== DEBUG ARRÊT GARDIEN 3D ===");
          console.log("Position gardien:", keeperPos);
          console.log("Zone de détection centrée:", gL);
          console.log("Rayon d'arrêt ÉNORME:", saveRadius);
        }
        const ballAtLine = new THREE.Vector3(
          ball.position.x,
          ball.position.y,
          goalZ
        );

        // Utiliser les dimensions effectives de la cage 3D
        const postLeft = new THREE.Vector3(
          -effective3DGoalWidth / 2,
          effective3DGoalHeight / 2,
          goalZ
        );
        const postRight = new THREE.Vector3(
          effective3DGoalWidth / 2,
          effective3DGoalHeight / 2,
          goalZ
        );
        const cross = new THREE.Vector3(0, effective3DGoalHeight, goalZ);
        // Détection de collision avec les poteaux 3D (plus réaliste)
        const postRadius3D = 0.12; // Rayon plus réaliste pour les poteaux 3D
        const hitPost =
          postLeft.distanceTo(ballAtLine) <= postRadius3D + ballRadius + 0.02 ||
          postRight.distanceTo(ballAtLine) <=
            postRadius3D + ballRadius + 0.02 ||
          cross.distanceTo(ballAtLine) <= postRadius3D + ballRadius + 0.02;

        // Utiliser les dimensions effectives de la cage 3D avec une marge plus généreuse
        const postMargin = 0.15; // Marge plus généreuse pour les poteaux 3D
        const insideX =
          ballAtLine.x >= -effective3DGoalWidth / 2 + postMargin + ballRadius &&
          ballAtLine.x <= effective3DGoalWidth / 2 - postMargin - ballRadius;
        const insideY =
          ballAtLine.y >= ballRadius &&
          ballAtLine.y <= effective3DGoalHeight - postMargin - ballRadius;
        const inGoalRect = insideX && insideY;

        let result = "BUT";
        if (!inGoalRect || hitPost) result = "RATÉ";

        if (result === "BUT") {
          if (gloveL && gloveR) {
            // Logique originale pour le gardien par défaut
            const dL = gL.distanceTo(ballAtLine);
            const dR = gR.distanceTo(ballAtLine);
            const d = Math.min(dL, dR);
            saved = d < saveRadius;
          } else {
            // Logique simplifiée pour le gardien 3D
            const distanceToKeeper = gL.distanceTo(ballAtLine);
            saved = distanceToKeeper < saveRadius;

            console.log("=== CALCUL ARRÊT GARDIEN 3D ===");
            console.log("Position balle à la ligne:", ballAtLine);
            console.log("Distance au gardien:", distanceToKeeper.toFixed(2));
            console.log("Rayon d'arrêt:", saveRadius);
            console.log("Arrêt détecté?", saved);
          }
        }
        if (saved) result = "ARRÊT";

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
        // Animation de résultat supprimée pour éviter les perturbations
        // playPlayerResultAnimation(result);
        if (resultEl) {
          if (result === "POTEAU") {
            resultEl.textContent = "RATÉ !";
          } else {
            resultEl.textContent = result + " !";
          }
        }
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
          keeper.position.set(0, 0, goalZ + 0.02);

          // S'assurer que l'échelle reste constante pour le gardien 3D
          if (keeper.type === "Group" && !keeperBody) {
            // C'est le gardien 3D, maintenir l'échelle
            keeper.scale.setScalar(4); // Maintenir la taille

            // Redémarrer l'animation idle immédiatement après le reset
            if (keeperAnimations.idle && !keeperAnimationInProgress) {
              keeperAnimations.idle.reset();
              keeperAnimations.idle.loop = THREE.LoopRepeat;
              keeperAnimations.idle.play();
              keeperIdleAction = keeperAnimations.idle;
              console.log("Animation idle redémarrée après reset de position");
            }
          }

          // Pour le gardien par défaut
          if (keeperBody) {
            keeperBody.position.set(0, 0.9, goalZ + 0.02);
          }
          if (gloveL && gloveR) {
            gloveL.position.set(-0.35, 1.2, goalZ + 0.02);
            gloveR.position.set(0.35, 1.2, goalZ + 0.02);
          }
          camera.position.copy(camBase);
          camera.lookAt(0, 1, goalZ);
          if (sessionShots >= TOTAL_SHOTS) endSession();
        }, 450);
      }
    }
    requestAnimationFrame(step);
  } // Fin de actuallyShootBall

  // ====== FONCTION POUR METTRE À JOUR LE CURSEUR EN CONTINU ======
  function updateAimCursor() {
    if (!lastTarget || isShooting || sessionOver || keeperAnimationInProgress)
      return;

    // Utiliser la dernière position connue
    const p = lastTarget;
    // Simplifier la détection des limites pour éviter les problèmes de calcul
    const atLimits = false; // Pour l'instant on ignore les limites dans l'animation

    // ====== SYSTÈME DE PRÉCISION DYNAMIQUE CORRIGÉ ======
    let precisionFactor = 0;
    let ringSize, innerRadius;

    if (!isCharging) {
      // SANS CHARGE = Curseur très visible et précis (vert)
      ringSize = 0.28; // Taille très visible par défaut !
      innerRadius = ringSize * 0.85; // Anneau fin
      precisionFactor = 0; // Pour les couleurs et trajectoire
    } else {
      // AVEC CHARGE = Curseur grandit selon la puissance !
      const power = getChargePower();
      precisionFactor = clamp((power - 0.7) / 0.6, 0, 1); // 0-1

      // ====== PROGRESSION TRÈS DOUCE ======
      const ringBase = 0.28; // Même taille qu'au repos au début
      const ringMax = 1.0; // Maximum raisonnable pour éviter les sauts brutaux

      // Progression ultra-douce avec courbe très progressive
      const smoothProgression = Math.pow(precisionFactor, 1.5); // Plus doux = exposant plus élevé
      ringSize = THREE.MathUtils.lerp(ringBase, ringMax, smoothProgression);

      // Épaisseur modérée pour l'esthétique
      innerRadius = ringSize * 0.8; // Pas trop de variation pour l'esthétique
    }

    aimRing.geometry.dispose();
    aimRing.geometry = new THREE.RingGeometry(innerRadius, ringSize, 48);

    // ====== SYSTÈME DE COULEURS DYNAMIQUE ======
    if (atLimits) {
      // Rouge/orange quand on est aux limites
      aimRing.material.color.setHex(0xff6b35);
      aimInner.material.color.setHex(0xff3d00);
    } else if (!isCharging) {
      // Pas de charge = toujours vert (très précis)
      aimRing.material.color.setHex(0x22ff88);
      aimInner.material.color.setHex(0x00ff44);
    } else {
      // ====== TRANSITIONS DE COULEURS ULTRA-DOUCES ======
      if (precisionFactor < 0.15) {
        // Très début de charge = Vert (ultra précis)
        aimRing.material.color.setHex(0x22ff88);
        aimInner.material.color.setHex(0x00ff44);
      } else if (precisionFactor < 0.35) {
        // Début-milieu = Vert-bleu (encore très précis)
        aimRing.material.color.setHex(0x44ff99);
        aimInner.material.color.setHex(0x00ff66);
      } else if (precisionFactor < 0.55) {
        // Milieu = Bleu-cyan (précision correcte)
        aimRing.material.color.setHex(0xffffff);
        aimInner.material.color.setHex(0x00e0ff);
      } else if (precisionFactor < 0.75) {
        // Milieu-fin = Cyan-orange (précision diminue)
        aimRing.material.color.setHex(0xffcc44);
        aimInner.material.color.setHex(0xff9900);
      } else if (precisionFactor < 0.9) {
        // Forte charge = Orange (peu précis)
        aimRing.material.color.setHex(0xff9933);
        aimInner.material.color.setHex(0xff6600);
      } else {
        // Charge très élevée = Rouge (chaos imminent)
        aimRing.material.color.setHex(0xff4444);
        aimInner.material.color.setHex(0xff2200);
      }
    }

    // Mettre à jour la trajectoire aussi
    const power = isCharging ? getChargePower() : 0.9;
    buildTrajectoryPreview(ball.position, p, power);

    // ====== TRAJECTOIRE AVEC TRANSITIONS DOUCES ======
    if (!isCharging) {
      // Pas de charge = trajectoire claire et verte (très précis)
      trajectory.material.opacity = 0.7;
      trajectory.material.color.setHex(0x22ff88);
    } else {
      if (precisionFactor < 0.15) {
        // Très début = trajectoire verte solide
        trajectory.material.opacity = 0.7;
        trajectory.material.color.setHex(0x22ff88);
      } else if (precisionFactor < 0.35) {
        // Début-milieu = trajectoire verte claire
        trajectory.material.opacity = 0.65;
        trajectory.material.color.setHex(0x44ff99);
      } else if (precisionFactor < 0.55) {
        // Milieu = trajectoire bleue
        trajectory.material.opacity = 0.55;
        trajectory.material.color.setHex(0x26c6da);
      } else if (precisionFactor < 0.75) {
        // Milieu-fin = trajectoire jaune-orange
        trajectory.material.opacity = 0.4;
        trajectory.material.color.setHex(0xffaa33);
      } else if (precisionFactor < 0.9) {
        // Forte charge = trajectoire orange
        trajectory.material.opacity = 0.25;
        trajectory.material.color.setHex(0xff9933);
      } else {
        // Très forte = trajectoire rouge transparente
        trajectory.material.opacity = 0.15;
        trajectory.material.color.setHex(0xff4444);
      }
    }
  }

  function onPointerMove(e) {
    if (isShooting || sessionOver || keeperAnimationInProgress) return;

    // Récupérer le point de visée original (sans limites)
    const rect = renderer.domElement.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);
    const o = raycaster.ray.origin;
    const d = raycaster.ray.direction;

    if (Math.abs(d.z) < 1e-6) {
      aimRing.visible = false;
      trajectory.visible = false;
      return;
    }

    const t = (goalZ - o.z) / d.z;
    if (t <= 0) {
      aimRing.visible = false;
      trajectory.visible = false;
      return;
    }

    const originalPoint = o.clone().add(d.clone().multiplyScalar(t));
    originalPoint.z = goalZ;

    // Appliquer les limites
    const p = applyAimingLimits(originalPoint);
    if (!p) {
      aimRing.visible = false;
      trajectory.visible = false;
      return;
    }

    // Détecter si on est aux limites
    const atLimits = originalPoint.x !== p.x || originalPoint.y !== p.y;

    // ====== SYSTÈME DE PRÉCISION DYNAMIQUE CORRIGÉ ======
    let precisionFactor = 0;
    let ringSize, innerRadius;

    if (!isCharging) {
      // SANS CHARGE = Curseur très visible et précis (vert)
      ringSize = 0.28; // Taille très visible par défaut !
      innerRadius = ringSize * 0.85; // Anneau fin
      precisionFactor = 0; // Pour les couleurs et trajectoire
    } else {
      // AVEC CHARGE = Curseur grandit selon la puissance !
      const power = getChargePower();
      precisionFactor = clamp((power - 0.7) / 0.6, 0, 1); // 0-1

      // ====== PROGRESSION TRÈS DOUCE ======
      const ringBase = 0.28; // Même taille qu'au repos au début
      const ringMax = 1.0; // Maximum raisonnable pour éviter les sauts brutaux

      // Progression ultra-douce avec courbe très progressive
      const smoothProgression = Math.pow(precisionFactor, 1.5); // Plus doux = exposant plus élevé
      ringSize = THREE.MathUtils.lerp(ringBase, ringMax, smoothProgression);

      // Épaisseur modérée pour l'esthétique
      innerRadius = ringSize * 0.8; // Pas trop de variation pour l'esthétique
    }

    aimRing.geometry.dispose();
    aimRing.geometry = new THREE.RingGeometry(innerRadius, ringSize, 48);

    // ====== SYSTÈME DE COULEURS DYNAMIQUE ======
    if (atLimits) {
      // Rouge/orange quand on est aux limites
      aimRing.material.color.setHex(0xff6b35);
      aimInner.material.color.setHex(0xff3d00);
    } else if (!isCharging) {
      // Pas de charge = toujours vert (très précis)
      aimRing.material.color.setHex(0x22ff88);
      aimInner.material.color.setHex(0x00ff44);
    } else {
      // ====== TRANSITIONS DE COULEURS ULTRA-DOUCES ======
      if (precisionFactor < 0.15) {
        // Très début de charge = Vert (ultra précis)
        aimRing.material.color.setHex(0x22ff88);
        aimInner.material.color.setHex(0x00ff44);
      } else if (precisionFactor < 0.35) {
        // Début-milieu = Vert-bleu (encore très précis)
        aimRing.material.color.setHex(0x44ff99);
        aimInner.material.color.setHex(0x00ff66);
      } else if (precisionFactor < 0.55) {
        // Milieu = Bleu-cyan (précision correcte)
        aimRing.material.color.setHex(0xffffff);
        aimInner.material.color.setHex(0x00e0ff);
      } else if (precisionFactor < 0.75) {
        // Milieu-fin = Cyan-orange (précision diminue)
        aimRing.material.color.setHex(0xffcc44);
        aimInner.material.color.setHex(0xff9900);
      } else if (precisionFactor < 0.9) {
        // Forte charge = Orange (peu précis)
        aimRing.material.color.setHex(0xff9933);
        aimInner.material.color.setHex(0xff6600);
      } else {
        // Charge très élevée = Rouge (chaos imminent)
        aimRing.material.color.setHex(0xff4444);
        aimInner.material.color.setHex(0xff2200);
      }
    }

    aimRing.visible = true;
    aimRing.position.set(p.x, p.y, goalZ + 0.001);
    lastTarget = p;
    const power = isCharging ? getChargePower() : 0.9;
    buildTrajectoryPreview(ball.position, p, power);

    // ====== TRAJECTOIRE SELON LA PRÉCISION ======
    if (!isCharging) {
      // Pas de charge = trajectoire claire et verte (très précis)
      trajectory.material.opacity = 0.7;
      trajectory.material.color.setHex(0x22ff88);
    } else {
      // ====== TRAJECTOIRE AVEC TRANSITIONS DOUCES ======
      if (precisionFactor < 0.15) {
        // Très début = trajectoire verte solide
        trajectory.material.opacity = 0.7;
        trajectory.material.color.setHex(0x22ff88);
      } else if (precisionFactor < 0.35) {
        // Début-milieu = trajectoire verte claire
        trajectory.material.opacity = 0.65;
        trajectory.material.color.setHex(0x44ff99);
      } else if (precisionFactor < 0.55) {
        // Milieu = trajectoire bleue
        trajectory.material.opacity = 0.55;
        trajectory.material.color.setHex(0x26c6da);
      } else if (precisionFactor < 0.75) {
        // Milieu-fin = trajectoire jaune-orange
        trajectory.material.opacity = 0.4;
        trajectory.material.color.setHex(0xffaa33);
      } else if (precisionFactor < 0.9) {
        // Forte charge = trajectoire orange
        trajectory.material.opacity = 0.25;
        trajectory.material.color.setHex(0xff9933);
      } else {
        // Très forte = trajectoire rouge transparente
        trajectory.material.opacity = 0.15;
        trajectory.material.color.setHex(0xff4444);
      }
    }

    trajectory.visible = true;
  }

  function getChargePower() {
    const elapsed = (performance.now() - chargeStart) / 1000;

    // ====== SYSTÈME DE BLOCAGE AU MAXIMUM ======
    if (powerLocked) {
      return 1.3; // Bloqué au maximum !
    }

    // ====== CHARGE RALENTIE POUR PLUS DE DIFFICULTÉ ======
    // Oscillation beaucoup plus lente et difficile à timing
    const slowFactor = 0.5; // 2x plus lent !
    const t = Math.sin(elapsed * Math.PI * slowFactor) * 0.5 + 0.5; // 0..1

    // Courbe non-linéaire pour rendre la puissance max encore plus difficile
    const powerCurve = Math.pow(t, 1.2); // Plus difficile d'atteindre le max
    const power = 0.7 + powerCurve * 0.6; // 0.7 -> 1.3

    // ====== DÉTECTION DU MAXIMUM ET BLOCAGE ======
    if (power >= 1.29) {
      // Proche du maximum (1.3)
      powerLocked = true;
      console.log("🔒 PUISSANCE MAXIMALE BLOQUÉE !");
      return 1.3;
    }

    return power;
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
    if (sessionOver || isShooting || keeperAnimationInProgress) {
      if (keeperAnimationInProgress) {
        console.log(
          "Charge bloquée - Gardien en animation, veuillez patienter..."
        );
      }
      return;
    }
    isCharging = true;
    chargeStart = performance.now();
    powerLocked = false; // Réinitialiser le verrou pour chaque nouvelle charge
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

      // ====== MISE À JOUR CONTINUE DU CURSEUR ======
      // Mettre à jour le curseur en continu pendant la charge
      updateAimCursor();
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

    // Mettre à jour les animations 3D
    const delta = 1 / 60; // 60 FPS approximatif
    if (keeperMixer) {
      keeperMixer.update(delta);
    }
    if (playerMixer) {
      playerMixer.update(delta);
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
