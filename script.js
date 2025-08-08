const players = [
  {
    id: 9,
    name: "Nicolas",
    description:
      "Ambidextre en stats comme en charisme. Vision du jeu + pizza à la main : passe décisive garantie.",
    position: "Milieu offensif",
    stats: {
      vitesse: 83,
      tir: 79,
      passe: 91,
    },
    color: "from-cyan-400 to-cyan-600",
    icon: "M",
  },
  {
    id: 7,
    name: "Andréa",
    description:
      "Numéro 7 comme un certain Portugais. Son cri de guerre : Suuuuu ! Sa spéciale ? Frappe pleine lucarne et célébration garantie.",
    position: "Buteur",
    stats: {
      vitesse: 91,
      tir: 94,
      passe: 78,
    },
    color: "from-orange-400 to-orange-600",
    icon: "A",
  },
  {
    id: 4,
    name: "Paul",
    description:
      "Un tacle glissé et un petit mot salé, des insultes garanties. Il aime faire pleurer les petits du city stade de sa ville",
    position: "Défenseur",
    stats: {
      vitesse: 70,
      tir: 60,
      passe: 78,
    },
    color: "from-yellow-400 to-yellow-600",
    icon: "D",
  },
  {
    id: 1,
    name: "Juline",
    description:
      "Elle casse des reins en TP comme sur le terrain. Elle a déjà dribblé un zèbre (elle croyait que c'était l'arbitre).",
    position: "Ailière",
    stats: {
      vitesse: 96,
      tir: 74,
      passe: 82,
    },
    color: "from-pink-400 to-pink-600",
    icon: "A",
  },
  {
    id: 2,
    name: "Mathis",
    description:
      "Sa frappe est classée arme de catégorie B. Une frappe de mule, un regard de tueur, et une coupe fraîche à chaque match.",
    position: "Avant-centre",
    stats: {
      vitesse: 88,
      tir: 92,
      passe: 70,
    },
    color: "from-red-400 to-red-600",
    icon: "A",
  },
  {
    id: 6,
    name: "Margaux",
    description:
      "Capable d'arrêter absolument tout : des penaltys, des débats de groupe, et te réconforter quand tu pleures. Les cages sont son royaume, le ballon son ennemi.",
    position: "Gardienne",
    stats: {
      vitesse: 72,
      tir: 40,
      passe: 85,
    },
    color: "from-purple-400 to-purple-600",
    icon: "G",
  },
  {
    id: 5,
    name: "Jules",
    description:
      "Bouge pas, c'est lui qui te bouge. Une masse défensive à la chevelure puissante et des tacles millimétrés (ou pas).",
    position: "Défenseur",
    stats: {
      vitesse: 74,
      tir: 66,
      passe: 80,
    },
    color: "from-green-400 to-green-600",
    icon: "D",
  },
  {
    id: 8,
    name: "Solène",
    description:
      "Court plus vite que la 4G et se fait souvent flasher en marchant. Une course ? Pas avec elle.",
    position: "Latérale droite",
    stats: {
      vitesse: 97,
      tir: 60,
      passe: 81,
    },
    color: "from-indigo-400 to-indigo-600",
    icon: "D",
  },
  {
    id: 3,
    name: "François",
    description:
      "Fait des passes parfaites et des blagues douteuses. Sa tactique préférée : la passe dans ton dos et le sourire narquois.",
    position: "Milieu central",
    stats: {
      vitesse: 76,
      tir: 68,
      passe: 94,
    },
    color: "from-blue-400 to-blue-600",
    icon: "M",
  },
];

window.players = players;

// Gestion de la musique de menu et sons
const menuMusic = document.getElementById("menu-music");
const buttonClickSound = document.getElementById("button-click-sound");
let menuMusicStarted = false;
let userHasInteracted = false;

function playButtonClick() {
  if (buttonClickSound) {
    buttonClickSound.currentTime = 0;
    buttonClickSound.volume = 0.4;
    buttonClickSound.play().catch(() => {
      console.log("Son de bouton: nécessite interaction utilisateur");
    });
  }

  // Profiter du clic pour démarrer la musique
  if (!userHasInteracted) {
    userHasInteracted = true;
    startMenuMusic();
  }
}

function startMenuMusic() {
  if (menuMusic) {
    console.log("Tentative de démarrage de la musique de menu...");
    menuMusic.volume = 0.3;
    menuMusic
      .play()
      .then(() => {
        console.log("Musique de menu démarrée avec succès");
        menuMusicStarted = true;
      })
      .catch((error) => {
        console.log("Musique de menu bloquée:", error.message);
        if (!userHasInteracted) {
          console.log("En attente d'interaction utilisateur...");
        }
      });
  }
}

function stopMenuMusic() {
  if (menuMusic && !menuMusic.paused) {
    console.log("Arrêt de la musique de menu");
    menuMusic.pause();
    menuMusic.currentTime = 0;
    menuMusicStarted = false; // Permettre le redémarrage
  }
}

function restartMenuMusic() {
  console.log("Redémarrage de la musique de menu...");
  if (menuMusic) {
    menuMusic.currentTime = 0;
    startMenuMusic();
  }
}

// Rendre la fonction accessible globalement
window.restartMenuMusic = restartMenuMusic;

// Démarrer la musique après le chargement
document.addEventListener("DOMContentLoaded", () => {
  console.log("Page chargée, programmation de la musique dans 3 secondes...");
  setTimeout(() => {
    startMenuMusic();
  }, 3000);
});

// Démarrer la musique sur première interaction - avec plus d'événements
document.addEventListener(
  "click",
  () => {
    console.log("Clic détecté, tentative de démarrage musique...");
    startMenuMusic();
  },
  { once: true }
);

document.addEventListener(
  "keydown",
  () => {
    console.log("Touche détectée, tentative de démarrage musique...");
    startMenuMusic();
  },
  { once: true }
);

// Vérifier aussi que l'audio est bien chargé
if (menuMusic) {
  menuMusic.addEventListener("loadeddata", () => {
    console.log("Fichier audio musique-menu.mp3 chargé avec succès");
  });

  menuMusic.addEventListener("error", (e) => {
    console.error("Erreur chargement musique-menu.mp3:", e);
  });
}

const loadingMessages = [
  "Analyse des conditions de terrain...",
  "Initialisation base de données joueurs...",
  "Mise en retard avec le voyage en Espagne...",
  "Analyse des données tactiques...",
  "Chargement des joueurs MMI de football...",
  "Préparation de l'arène digitale...",
  "Synchronisation entraîneurs IA...",
  "Activation du stade cybernétique...",
  "Système prêt pour le coup d'envoi !",
];

let progress = 0;
let currentMessageIndex = 0;
let currentPlayerIndex = 0;
window.currentPlayerIndex = currentPlayerIndex;
let progressInterval;
let messageInterval;
let isAnimating = false;
let isLoading = true;

const loadingScreen = document.getElementById("loading-screen");
const gameInterface = document.querySelector(".game-interface");
const progressFill = document.getElementById("progress-fill");
const loadingPercentage = document.getElementById("loading-percentage");
const loadingMessage = document.getElementById("loading-message");
const systemStatus = document.getElementById("system-status");

const playerName = document.getElementById("player-name");
const playerRole = document.getElementById("player-role");
const playerDescription = document.getElementById("player-description");
const statSpeed = document.getElementById("stat-speed");
const statShooting = document.getElementById("stat-shooting");
const statPassing = document.getElementById("stat-passing");
const barSpeed = document.getElementById("bar-speed");
const barShooting = document.getElementById("bar-shooting");
const barPassing = document.getElementById("bar-passing");
const characterIcon = document.getElementById("character-icon");
const selectPlayerBtn = document.getElementById("select-player-btn");
const characterSlots = document.querySelectorAll(".character-slot");

const avatarModal = document.getElementById("avatar-modal");
const modalBackground = document.querySelector(".modal-background");
const closeModalBtn = document.getElementById("close-modal");
const modalPlayerName = document.getElementById("modal-player-name");
const modalPlayerPosition = document.getElementById("modal-player-position");
const modalPlayerDescription = document.getElementById(
  "modal-player-description"
);
const modalAvatar = document.getElementById("modal-avatar");

const confirmationModal = document.getElementById("confirmation-modal");
const confirmationBackground = document.querySelector(
  ".confirmation-background"
);
const confirmSelectionBtn = document.getElementById("confirm-selection");
const cancelSelectionBtn = document.getElementById("cancel-selection");
const confirmationPlayerName = document.getElementById(
  "confirmation-player-name"
);
const confirmationPlayerPosition = document.getElementById(
  "confirmation-player-position"
);
const confirmationAvatar = document.getElementById("confirmation-avatar");
const confirmationSpeed = document.getElementById("confirmation-speed");
const confirmationShooting = document.getElementById("confirmation-shooting");
const confirmationPassing = document.getElementById("confirmation-passing");

function startLoading() {
  console.log("🚀 Démarrage du chargement futuriste...");

  progressInterval = setInterval(() => {
    if (progress >= 100) {
      clearInterval(progressInterval);
      clearInterval(messageInterval);

      if (loadingMessage)
        loadingMessage.textContent = "Système prêt pour le coup d'envoi !";
      if (systemStatus) systemStatus.textContent = "EN LIGNE";

      setTimeout(() => {
        showMainApp();
      }, 1000);
      return;
    }

    progress += Math.random() * 5 + 2;
    if (progress > 100) progress = 100;
    updateProgress();
  }, 150);

  messageInterval = setInterval(() => {
    currentMessageIndex = (currentMessageIndex + 1) % loadingMessages.length;
    updateLoadingMessage();
  }, 800);

  updateLoadingMessage();
}

function updateProgress() {
  const roundedProgress = Math.floor(progress);

  console.log("📊 Progress:", roundedProgress + "%");

  if (loadingPercentage) {
    loadingPercentage.textContent = roundedProgress;
    console.log("✅ Percentage updated:", roundedProgress);
  }
  if (progressFill) {
    progressFill.style.width = `${roundedProgress}%`;
    console.log("✅ Progress bar updated:", roundedProgress + "%");
  }

  if (roundedProgress >= 25 && roundedProgress < 50) {
    const statusValue = document.querySelector(
      ".status-item:first-child .status-value"
    );
    if (statusValue) statusValue.textContent = "EN LIGNE";
  } else if (roundedProgress >= 50 && roundedProgress < 75) {
    const statusValue = document.querySelector(
      ".status-item:nth-child(2) .status-value"
    );
    if (statusValue) statusValue.textContent = "EN LIGNE";
  }
}

function updateLoadingMessage() {
  if (loadingMessage) {
    loadingMessage.textContent = loadingMessages[currentMessageIndex];
  }
}

function showMainApp() {
  console.log("🎮 Transition vers l'interface de jeu...");

  if (loadingScreen && gameInterface) {
    loadingScreen.style.transition = "all 0.5s ease";
    loadingScreen.style.opacity = "0";
    loadingScreen.style.transform = "scale(1.1)";

    setTimeout(() => {
      loadingScreen.classList.add("hidden");
      gameInterface.classList.remove("hidden");

      gameInterface.style.opacity = "0";
      gameInterface.style.transform = "scale(0.9)";

      setTimeout(() => {
        gameInterface.style.transition = "all 0.8s ease";
        gameInterface.style.opacity = "1";
        gameInterface.style.transform = "scale(1)";
      }, 50);

      initializeGameInterface();
      isLoading = false;
    }, 500);
  }
}

function playSelectSound() {
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
}

function playHoverSound() {
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}

function animateStatBars(player, delay = 100) {
  if (barSpeed) barSpeed.style.width = "0%";
  if (barShooting) barShooting.style.width = "0%";
  if (barPassing) barPassing.style.width = "0%";

  setTimeout(() => {
    if (barSpeed) barSpeed.style.width = `${player.stats.vitesse}%`;
  }, delay);

  setTimeout(() => {
    if (barShooting) barShooting.style.width = `${player.stats.tir}%`;
  }, delay + 200);

  setTimeout(() => {
    if (barPassing) barPassing.style.width = `${player.stats.passe}%`;
  }, delay + 400);
}

function updatePlayerDisplay(animated = true) {
  if (isAnimating) return;

  const player = players[currentPlayerIndex];

  if (animated) {
    isAnimating = true;

    const elements = [playerName, playerRole, playerDescription, characterIcon];
    elements.forEach((el) => {
      if (el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
      }
    });

    setTimeout(() => {
      if (playerName) playerName.textContent = player.name;
      if (playerRole) playerRole.textContent = player.position;
      if (playerDescription) playerDescription.textContent = player.description;
      if (characterIcon) {
        const avatarsMap = {
          Juline: "juline-avatar",
          Andréa: "andrea-avatar",
          Margaux: "margaux-avatar",
          Mathis: "mathis-avatar",
          Paul: "paul-avatar",
          François: "francois-avatar",
          Jules: "jules-avatar",
          Solène: "solene-avatar",
          Nicolas: "nicolas-avatar",
        };

        if (avatarsMap[player.name]) {
          characterIcon.textContent = "";
          characterIcon.className = `character-icon ${avatarsMap[player.name]}`;
          const mainCharacter = document.getElementById("main-avatar");
          if (mainCharacter) mainCharacter.classList.add("juline-selected");
        } else {
          characterIcon.textContent = player.icon;
          characterIcon.className = "character-icon";
          const mainCharacter = document.getElementById("main-avatar");
          if (mainCharacter) mainCharacter.classList.remove("juline-selected");
        }
      }

      if (statSpeed) statSpeed.textContent = player.stats.vitesse;
      if (statShooting) statShooting.textContent = player.stats.tir;
      if (statPassing) statPassing.textContent = player.stats.passe;

      if (selectPlayerBtn) {
        const buttonText = selectPlayerBtn.querySelector(".button-text");
        if (buttonText)
          buttonText.textContent = `SÉLECTIONNER ${player.name.toUpperCase()}`;
      }

      elements.forEach((el, index) => {
        if (el) {
          setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, index * 100);
        }
      });

      animateStatBars(player, 300);

      setTimeout(() => {
        isAnimating = false;
      }, 800);
    }, 300);
  } else {
    if (playerName) playerName.textContent = player.name;
    if (playerRole) playerRole.textContent = player.position;
    if (playerDescription) playerDescription.textContent = player.description;
    if (characterIcon) {
      const avatarsMap = {
        Juline: "juline-avatar",
        Andréa: "andrea-avatar",
        Margaux: "margaux-avatar",
        Mathis: "mathis-avatar",
        Paul: "paul-avatar",
        François: "francois-avatar",
        Jules: "jules-avatar",
        Solène: "solene-avatar",
        Nicolas: "nicolas-avatar",
      };

      if (avatarsMap[player.name]) {
        characterIcon.textContent = "";
        characterIcon.className = `character-icon ${avatarsMap[player.name]}`;
        const mainCharacter = document.getElementById("main-avatar");
        if (mainCharacter) mainCharacter.classList.add("juline-selected");
      } else {
        characterIcon.textContent = player.icon;
        characterIcon.className = "character-icon";
        const mainCharacter = document.getElementById("main-avatar");
        if (mainCharacter) mainCharacter.classList.remove("juline-selected");
      }
    }
    if (statSpeed) statSpeed.textContent = player.stats.vitesse;
    if (statShooting) statShooting.textContent = player.stats.tir;
    if (statPassing) statPassing.textContent = player.stats.passe;

    if (selectPlayerBtn) {
      const buttonText = selectPlayerBtn.querySelector(".button-text");
      if (buttonText)
        buttonText.textContent = `SÉLECTIONNER ${player.name.toUpperCase()}`;
    }

    animateStatBars(player, 0);
  }
}

function updateCharacterSlots() {
  characterSlots.forEach((slot, index) => {
    if (index === currentPlayerIndex) {
      slot.classList.add("active");
    } else {
      slot.classList.remove("active");
    }
  });
}

function selectPlayer(index) {
  if (index === currentPlayerIndex || isAnimating) return;

  playButtonClick(); // Son de clic
  currentPlayerIndex = index;
  window.currentPlayerIndex = currentPlayerIndex;
  playSelectSound();
  updatePlayerDisplay(true);
  updateCharacterSlots();

  const mainCharacter = document.getElementById("main-avatar");
  if (mainCharacter) {
    mainCharacter.style.transform = "scale(1.1)";
    setTimeout(() => {
      mainCharacter.style.transform = "scale(1)";
    }, 200);
  }
}

function handleKeyboard(event) {
  if (isAnimating || isLoading) return;

  switch (event.key) {
    case "ArrowLeft":
    case "q":
    case "Q":
      event.preventDefault();
      selectPlayer((currentPlayerIndex - 1 + players.length) % players.length);
      break;

    case "ArrowRight":
    case "d":
    case "D":
      event.preventDefault();
      selectPlayer((currentPlayerIndex + 1) % players.length);
      break;

    case "Enter":
    case " ":
      event.preventDefault();
      confirmSelection();
      break;

    case "1":
      event.preventDefault();
      selectPlayer(0);
      break;

    case "2":
      event.preventDefault();
      selectPlayer(1);
      break;

    case "3":
      event.preventDefault();
      selectPlayer(2);
      break;

    case "4":
      event.preventDefault();
      selectPlayer(3);
      break;

    case "5":
      event.preventDefault();
      selectPlayer(4);
      break;

    case "6":
      event.preventDefault();
      selectPlayer(5);
      break;

    case "7":
      event.preventDefault();
      selectPlayer(6);
      break;

    case "8":
      event.preventDefault();
      selectPlayer(7);
      break;

    case "9":
      event.preventDefault();
      selectPlayer(8);
      break;
  }
}

function confirmSelection() {
  playButtonClick(); // Son de clic
  const player = players[currentPlayerIndex];

  if (selectPlayerBtn) {
    selectPlayerBtn.style.transform = "scale(0.95)";
    setTimeout(() => {
      selectPlayerBtn.style.transform = "scale(1)";
    }, 150);
  }

  const mainCharacter = document.getElementById("main-avatar");
  if (mainCharacter) {
    mainCharacter.style.animation = "none";
    setTimeout(() => {
      mainCharacter.style.animation = "";
    }, 100);
  }

  openConfirmationModal();
}

function openConfirmationModal() {
  playButtonClick(); // Son de clic
  const player = players[currentPlayerIndex];

  if (confirmationPlayerName) confirmationPlayerName.textContent = player.name;
  if (confirmationPlayerPosition)
    confirmationPlayerPosition.textContent = player.position;
  if (confirmationSpeed) confirmationSpeed.textContent = player.stats.vitesse;
  if (confirmationShooting) confirmationShooting.textContent = player.stats.tir;
  if (confirmationPassing) confirmationPassing.textContent = player.stats.passe;

  if (confirmationAvatar) {
    const avatarsMap = {
      Juline: "juline-avatar",
      Andréa: "andrea-avatar",
      Margaux: "margaux-avatar",
      Mathis: "mathis-avatar",
      Paul: "paul-avatar",
      François: "francois-avatar",
      Jules: "jules-avatar",
      Solène: "solene-avatar",
      Nicolas: "nicolas-avatar",
    };

    if (avatarsMap[player.name]) {
      confirmationAvatar.className = `confirmation-avatar ${
        avatarsMap[player.name]
      }`;
      confirmationAvatar.style.background = "";
      confirmationAvatar.style.display = "";
      confirmationAvatar.style.alignItems = "";
      confirmationAvatar.style.justifyContent = "";
      confirmationAvatar.style.fontSize = "";
      confirmationAvatar.style.fontFamily = "";
      confirmationAvatar.style.fontWeight = "";
      confirmationAvatar.style.color = "";
      confirmationAvatar.textContent = "";
    } else {
      confirmationAvatar.className = "confirmation-avatar";
      confirmationAvatar.style.background = `linear-gradient(135deg, var(--primary-cyan), var(--primary-purple))`;
      confirmationAvatar.style.display = "flex";
      confirmationAvatar.style.alignItems = "center";
      confirmationAvatar.style.justifyContent = "center";
      confirmationAvatar.style.fontSize = "2rem";
      confirmationAvatar.style.fontFamily = "Orbitron, monospace";
      confirmationAvatar.style.fontWeight = "900";
      confirmationAvatar.style.color = "white";
      confirmationAvatar.textContent = player.icon;
    }
  }

  if (confirmationModal) {
    confirmationModal.classList.remove("hidden");
    playSelectSound();
  }

  document.body.style.overflow = "hidden";
}

function closeConfirmationModal() {
  playButtonClick(); // Son de clic
  if (confirmationModal) {
    confirmationModal.style.animation = "modalFadeOut 0.3s ease-out";

    setTimeout(() => {
      confirmationModal.classList.add("hidden");
      confirmationModal.style.animation = "";
    }, 300);
  }

  document.body.style.overflow = "";
}

function finalConfirmSelection() {
  // Arrêter la musique de menu
  stopMenuMusic();
  playButtonClick(); // Son de clic

  console.log(
    `🎮 ================================\n⚽ MMI SOCCER 2025 - PRÊT ! ⚽\n🎮 ================================\n🏃 Joueur : ${players[currentPlayerIndex].name}\n⭐ Poste : ${players[currentPlayerIndex].position}\n📊 Stats : ${players[currentPlayerIndex].stats.vitesse}/${players[currentPlayerIndex].stats.tir}/${players[currentPlayerIndex].stats.passe}\n🏆 Bienvenue sur le terrain !\n🎮 ================================\n    `
  );

  // Lancer le jeu de penalty
  if (typeof openPenaltyOverlay === "function") {
    openPenaltyOverlay();
  } else {
    console.error("Fonction openPenaltyOverlay non trouvée");
  }
}

function showVictoryAnimation() {
  const gameInterfaceElement = document.querySelector(".game-interface");
  if (gameInterfaceElement) {
    gameInterfaceElement.style.animation = "pulse 0.5s ease-in-out 3";
  }

  createCelebrationParticles();

  setTimeout(() => {
    const player = players[currentPlayerIndex];
    console.log(`🏆 Joueur sélectionné : ${player.name} - ${player.position}`);
    console.log(
      `⚽ Prêt pour le match avec les stats : Vitesse ${player.stats.vitesse}, Tir ${player.stats.tir}, Passe ${player.stats.passe}`
    );

    console.log(`
🎮 ================================
⚽ MMI SOCCER 2025 - PRÊT ! ⚽
🎮 ================================
🏃 Joueur : ${player.name}
⭐ Poste : ${player.position}
📊 Stats : ${player.stats.vitesse}/${player.stats.tir}/${player.stats.passe}
🏆 Bienvenue sur le terrain !
🎮 ================================
    `);
  }, 1500);
}

function createCelebrationParticles() {
  const particleCount = 20;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: linear-gradient(45deg, #0149AF, #0149AF);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      left: ${Math.random() * window.innerWidth}px;
      top: ${Math.random() * window.innerHeight}px;
      animation: particleFloat 2s ease-out forwards;
    `;

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 2000);
  }
}

const style = document.createElement("style");
style.textContent = `
  @keyframes particleFloat {
    0% {
      opacity: 1;
      transform: translateY(0) scale(0);
    }
    50% {
      opacity: 1;
      transform: translateY(-100px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-200px) scale(0);
    }
  }
  
  .character-icon, .slot-icon {
    transition: all 0.3s ease;
  }
  
  .player-name, .player-role, .player-description {
    transition: all 0.3s ease;
  }
`;
document.head.appendChild(style);

function addHoverEffects() {
  characterSlots.forEach((slot) => {
    slot.addEventListener("mouseenter", playHoverSound);
  });

  if (selectPlayerBtn) {
    selectPlayerBtn.addEventListener("mouseenter", playHoverSound);
  }
}

function handleResize() {
  const gameInterfaceElement = document.querySelector(".game-interface");
  const width = window.innerWidth;

  if (gameInterfaceElement) {
    if (width <= 768) {
      gameInterfaceElement.classList.add("mobile");
    } else {
      gameInterfaceElement.classList.remove("mobile");
    }
  }
}

function initializeApp() {
  console.log("🚀 MMI Soccer 2025 - Sélection de personnages chargée !");
  console.log("⌨️ Contrôles clavier :");
  console.log("   ← → ou Q D: Naviguer entre les joueurs");
  console.log("   Entrée/Espace: Sélectionner le joueur");
  console.log("   1-9: Sélection rapide du joueur");

  console.log("🔍 Debug - loadingScreen:", loadingScreen);
  console.log("🔍 Debug - isLoading:", isLoading);
  console.log("🔍 Debug - progressFill:", progressFill);
  console.log("🔍 Debug - loadingPercentage:", loadingPercentage);

  if (loadingScreen && isLoading) {
    console.log("✅ Démarrage du chargement...");
    startLoading();
  } else {
    console.log("⚠️ Pas d'écran de chargement détecté, interface directe");
    initializeGameInterface();
  }
}

function initializeGameInterface() {
  updatePlayerDisplay(false);
  updateCharacterSlots();
  addHoverEffects();
  handleResize();

  characterSlots.forEach((slot, index) => {
    slot.addEventListener("click", () => selectPlayer(index));
  });

  if (selectPlayerBtn) {
    selectPlayerBtn.addEventListener("click", confirmSelection);
  }

  if (characterIcon) {
    characterIcon.addEventListener("click", openAvatarModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeAvatarModal);
  }

  if (modalBackground) {
    modalBackground.addEventListener("click", closeAvatarModal);
  }

  if (confirmSelectionBtn) {
    confirmSelectionBtn.addEventListener("click", finalConfirmSelection);
  }

  if (cancelSelectionBtn) {
    cancelSelectionBtn.addEventListener("click", closeConfirmationModal);
  }

  if (confirmationBackground) {
    confirmationBackground.addEventListener("click", closeConfirmationModal);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (avatarModal && !avatarModal.classList.contains("hidden")) {
        closeAvatarModal();
      }
      if (
        confirmationModal &&
        !confirmationModal.classList.contains("hidden")
      ) {
        closeConfirmationModal();
      }
    }
  });

  document.addEventListener("keydown", handleKeyboard);
  window.addEventListener("resize", handleResize);

  if (!isLoading) {
    setTimeout(() => {
      const elements = document.querySelectorAll(
        ".game-header, .info-panel, .character-display, .selection-panel, .game-footer"
      );
      elements.forEach((el, index) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";

        setTimeout(() => {
          el.style.transition = "all 0.6s ease";
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }, index * 100);
      });
    }, 100);
  }
}

window.addEventListener("error", (e) => {
  console.error("⚠️ Error detected:", e.error);

  if (!isAnimating) {
    updatePlayerDisplay(false);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("🎯 DOM loaded, initializing app...");
  setTimeout(initializeApp, 200);
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    players,
    selectPlayer,
    confirmSelection,
  };
}

function openAvatarModal() {
  if (isLoading) return;
  playButtonClick(); // Son de clic

  const player = players[currentPlayerIndex];

  if (modalPlayerName) modalPlayerName.textContent = player.name;
  if (modalPlayerPosition) modalPlayerPosition.textContent = player.position;
  if (modalPlayerDescription)
    modalPlayerDescription.textContent = player.description;

  if (modalAvatar) {
    const avatarsMap = {
      Juline: "juline-avatar",
      Andréa: "andrea-avatar",
      Margaux: "margaux-avatar",
      Mathis: "mathis-avatar",
      Paul: "paul-avatar",
      François: "francois-avatar",
      Jules: "jules-avatar",
      Solène: "solene-avatar",
      Nicolas: "nicolas-avatar",
    };

    if (avatarsMap[player.name]) {
      modalAvatar.className = `modal-avatar ${avatarsMap[player.name]}`;
      modalAvatar.style.background = "";
      modalAvatar.style.display = "";
      modalAvatar.style.alignItems = "";
      modalAvatar.style.justifyContent = "";
      modalAvatar.style.fontSize = "";
      modalAvatar.style.fontFamily = "";
      modalAvatar.style.fontWeight = "";
      modalAvatar.style.color = "";
      modalAvatar.textContent = "";
    } else {
      modalAvatar.className = "modal-avatar";
      modalAvatar.style.background = `linear-gradient(135deg, var(--primary-cyan), var(--primary-purple))`;
      modalAvatar.style.display = "flex";
      modalAvatar.style.alignItems = "center";
      modalAvatar.style.justifyContent = "center";
      modalAvatar.style.fontSize = "8rem";
      modalAvatar.style.fontFamily = "Orbitron, monospace";
      modalAvatar.style.fontWeight = "900";
      modalAvatar.style.color = "white";
      modalAvatar.textContent = player.icon;
    }
  }

  if (avatarModal) {
    avatarModal.classList.remove("hidden");
    playSelectSound();
  }

  document.body.style.overflow = "hidden";
}

function closeAvatarModal() {
  playButtonClick(); // Son de clic
  if (avatarModal) {
    avatarModal.style.animation = "modalFadeOut 0.3s ease-out";

    setTimeout(() => {
      avatarModal.classList.add("hidden");
      avatarModal.style.animation = "";
    }, 300);
  }

  document.body.style.overflow = "";
}

function previousPlayer() {
  if (isAnimating) return;
  playButtonClick(); // Son de clic
  selectPlayer((currentPlayerIndex - 1 + players.length) % players.length);
}

function nextPlayer() {
  if (isAnimating) return;
  playButtonClick(); // Son de clic
  selectPlayer((currentPlayerIndex + 1) % players.length);
}

const modalFadeOutCSS = `
@keyframes modalFadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
`;

if (!document.querySelector("#modal-fade-out-style")) {
  const styleElement = document.createElement("style");
  styleElement.id = "modal-fade-out-style";
  styleElement.textContent = modalFadeOutCSS;
  document.head.appendChild(styleElement);
}
