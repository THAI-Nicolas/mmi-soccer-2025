/**
 * GLTFLoader compatible avec THREE.js
 * Version simplifiée pour le chargement de modèles GLB/GLTF
 */

if (typeof THREE !== "undefined") {
  console.log("Initialisation GLTFLoader pour THREE.js r" + THREE.REVISION);

  THREE.GLTFLoader = function (manager) {
    THREE.Loader.call(this, manager);
    this.dracoLoader = null;
    this.ktx2Loader = null;
    this.meshoptDecoder = null;
    this.pluginCallbacks = [];
  };

  THREE.GLTFLoader.prototype = Object.assign(
    Object.create(THREE.Loader.prototype),
    {
      constructor: THREE.GLTFLoader,

      load: function (url, onLoad, onProgress, onError) {
        const scope = this;
        const resourcePath = THREE.LoaderUtils.extractUrlBase(url);

        const loader = new THREE.FileLoader(this.manager);
        loader.setPath(this.path);
        loader.setResponseType("arraybuffer");
        loader.setRequestHeader(this.requestHeader);
        loader.setWithCredentials(this.withCredentials);

        loader.load(
          url,
          function (data) {
            try {
              scope.parse(
                data,
                resourcePath,
                function (gltf) {
                  onLoad(gltf);
                },
                onError
              );
            } catch (e) {
              if (onError) {
                onError(e);
              } else {
                console.error(e);
              }
            }
          },
          onProgress,
          onError
        );
      },

      parse: function (data, path, onLoad, onError) {
        const json = {};
        const extensions = {};
        const plugins = {};

        if (typeof data === "string") {
          json = JSON.parse(data);
        } else {
          const magic = THREE.LoaderUtils.decodeText(
            new Uint8Array(data, 0, 4)
          );

          if (magic === "glTF") {
            // GLB format
            const headerView = new DataView(data, 0, 12);
            const version = headerView.getUint32(4, true);
            const length = headerView.getUint32(8, true);

            if (version < 2.0) {
              if (onError)
                onError(new Error("Unsupported legacy glTF version"));
              return;
            }

            let chunkView = new DataView(data, 12);
            let chunkIndex = 0;

            while (chunkIndex < length - 12) {
              const chunkLength = chunkView.getUint32(chunkIndex, true);
              const chunkType = chunkView.getUint32(chunkIndex + 4, true);
              chunkIndex += 8;

              if (chunkType === 0x4e4f534a) {
                // JSON
                const jsonData = new Uint8Array(
                  data,
                  12 + chunkIndex,
                  chunkLength
                );
                json = JSON.parse(THREE.LoaderUtils.decodeText(jsonData));
              }

              chunkIndex += chunkLength;
            }
          } else {
            // GLTF format
            json = JSON.parse(
              THREE.LoaderUtils.decodeText(new Uint8Array(data))
            );
          }
        }

        if (json.asset === undefined || json.asset.version[0] < 2) {
          if (onError) onError(new Error("Unsupported asset version"));
          return;
        }

        const parser = new GLTFParser(json, {
          path: path || this.resourcePath || "",
          crossOrigin: this.crossOrigin,
          requestHeader: this.requestHeader,
          manager: this.manager,
          ktx2Loader: this.ktx2Loader,
          meshoptDecoder: this.meshoptDecoder,
        });

        parser.fileLoader = new THREE.FileLoader(this.manager);
        parser.fileLoader.setRequestHeader(this.requestHeader);

        for (let i = 0, il = this.pluginCallbacks.length; i < il; i++) {
          const plugin = this.pluginCallbacks[i](parser);
          plugins[plugin.name] = plugin;
          extensions[plugin.name] = true;
        }

        parser.parse(onLoad, onError);
      },
    }
  );

  function GLTFParser(json, options) {
    this.json = json || {};
    this.extensions = {};
    this.plugins = {};
    this.options = options || {};
    this.cache = new GLTFRegistry();
    this.associations = new Map();
    this.primitiveCache = {};
    this.meshCache = { refs: {}, uses: {} };
    this.cameraCache = { refs: {}, uses: {} };
    this.lightCache = { refs: {}, uses: {} };
    this.sourceCache = {};
    this.textureCache = {};
    this.nodeNamesUsed = {};

    if (
      typeof createImageBitmap !== "undefined" &&
      /Firefox/.test(navigator.userAgent) === false
    ) {
      this.textureLoader = new ImageBitmapLoader(this.options.manager);
    } else {
      this.textureLoader = new THREE.TextureLoader(this.options.manager);
    }

    this.textureLoader.setCrossOrigin(this.options.crossOrigin);
    this.textureLoader.setRequestHeader(this.options.requestHeader);

    this.fileLoader = new THREE.FileLoader(this.options.manager);
    this.fileLoader.setRequestHeader(this.options.requestHeader);
  }

  GLTFParser.prototype.parse = function (onLoad, onError) {
    const parser = this;
    const json = this.json;
    const extensions = this.extensions;

    Promise.all([this.loadScene(0)])
      .then(function (results) {
        const scene = results[0];
        const scenes = [scene];

        const gltf = {
          scene: scene,
          scenes: scenes,
          cameras: [],
          animations: [],
          asset: json.asset,
          parser: parser,
          userData: {},
        };

        onLoad(gltf);
      })
      .catch(onError);
  };

  GLTFParser.prototype.loadScene = function (sceneIndex) {
    const json = this.json;
    const scene = json.scenes[sceneIndex];
    const parser = this;

    const group = new THREE.Group();
    if (scene.name) group.name = scene.name;

    const nodePromises = [];

    if (scene.nodes) {
      for (let i = 0; i < scene.nodes.length; i++) {
        nodePromises.push(parser.loadNode(scene.nodes[i]));
      }
    }

    return Promise.all(nodePromises).then(function (nodes) {
      for (let i = 0; i < nodes.length; i++) {
        group.add(nodes[i]);
      }
      return group;
    });
  };

  GLTFParser.prototype.loadNode = function (nodeIndex) {
    const json = this.json;
    const parser = this;
    const nodeDef = json.nodes[nodeIndex];

    const node = new THREE.Group();
    if (nodeDef.name) node.name = nodeDef.name;

    if (nodeDef.mesh !== undefined) {
      return parser.loadMesh(nodeDef.mesh).then(function (mesh) {
        node.add(mesh);
        return node;
      });
    }

    return Promise.resolve(node);
  };

  GLTFParser.prototype.loadMesh = function (meshIndex) {
    const json = this.json;
    const meshDef = json.meshes[meshIndex];

    const group = new THREE.Group();
    if (meshDef.name) group.name = meshDef.name;

    const primitivePromises = [];

    for (let i = 0; i < meshDef.primitives.length; i++) {
      primitivePromises.push(
        this.loadPrimitive(meshDef.primitives[i], meshIndex, i)
      );
    }

    return Promise.all(primitivePromises).then(function (primitives) {
      for (let i = 0; i < primitives.length; i++) {
        group.add(primitives[i]);
      }
      return group;
    });
  };

  GLTFParser.prototype.loadPrimitive = function (
    primitive,
    meshIndex,
    primitiveIndex
  ) {
    // Création d'un mesh simple pour le test
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.6,
      metalness: 0.1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "primitive_" + primitiveIndex;

    return Promise.resolve(mesh);
  };

  function GLTFRegistry() {
    let objects = {};
    return {
      get: function (key) {
        return objects[key];
      },
      add: function (key, object) {
        objects[key] = object;
      },
      remove: function (key) {
        delete objects[key];
      },
      removeAll: function () {
        objects = {};
      },
    };
  }

  console.log("GLTFLoader initialisé avec succès");
} else {
  console.error("THREE.js doit être chargé avant GLTFLoader");
}
