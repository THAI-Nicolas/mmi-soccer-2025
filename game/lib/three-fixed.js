// THREE.js r158 - Version simplifiée pour compatibilité
// Chargement synchrone depuis le CDN

function loadThreeJS() {
  return new Promise((resolve, reject) => {
    if (typeof THREE !== "undefined") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js";
    script.onload = () => {
      console.log("THREE.js r158 chargé avec succès");
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadGLTFLoader() {
  return new Promise((resolve, reject) => {
    if (
      typeof THREE !== "undefined" &&
      typeof THREE.GLTFLoader !== "undefined"
    ) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/js/loaders/GLTFLoader.js";
    script.onload = () => {
      console.log("GLTFLoader chargé avec succès");
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Export pour utilisation
window.loadThreeLibs = async function () {
  await loadThreeJS();
  await loadGLTFLoader();
  console.log("Toutes les librairies THREE.js chargées");
};
