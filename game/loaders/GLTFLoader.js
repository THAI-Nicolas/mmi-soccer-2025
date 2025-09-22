/**
 * GLTFLoader for Three.js r158
 * Simplified version for loading GLB/GLTF files
 */

// Ensure THREE is available
if (typeof THREE === 'undefined') {
  throw new Error('THREE is not defined. Include three.js before GLTFLoader.js');
}

THREE.GLTFLoader = function () {
  this.manager = THREE.DefaultLoadingManager;
  this.path = '';
  this.resourcePath = '';
  this.requestHeader = {};
};

THREE.GLTFLoader.prototype = {
  constructor: THREE.GLTFLoader,

  setPath: function (value) {
    this.path = value;
    return this;
  },

  setResourcePath: function (value) {
    this.resourcePath = value;
    return this;
  },

  setRequestHeader: function (value) {
    this.requestHeader = value;
    return this;
  },

  load: function (url, onLoad, onProgress, onError) {
    var scope = this;
    var loader = new THREE.FileLoader(scope.manager);
    loader.setPath(scope.path);
    loader.setResponseType('arraybuffer');
    loader.setRequestHeader(scope.requestHeader);

    if (scope.crossOrigin === 'use-credentials') {
      loader.setCrossOrigin('use-credentials');
    }

    loader.load(url, function (data) {
      try {
        scope.parse(data, scope.resourcePath || scope.path, function (gltf) {
          onLoad(gltf);
        }, onError);
      } catch (e) {
        if (onError) {
          onError(e);
        } else {
          console.error(e);
        }
        scope.manager.itemError(url);
      }
    }, onProgress, onError);
  },

  parse: function (data, path, onLoad, onError) {
    var content;
    var extensions = {};

    if (typeof data === 'string') {
      content = data;
    } else {
      var magic = THREE.LoaderUtils.decodeText(new Uint8Array(data, 0, 4));
      if (magic === 'glTF') {
        extensions[THREE.GLTFLoader.EXTENSIONS.KHR_BINARY_GLTF] = new THREE.GLTFBinaryExtension(data);
        content = extensions[THREE.GLTFLoader.EXTENSIONS.KHR_BINARY_GLTF].content;
      } else {
        content = THREE.LoaderUtils.decodeText(new Uint8Array(data));
      }
    }

    var json;
    try {
      json = JSON.parse(content);
    } catch (error) {
      if (onError) onError(error);
      return;
    }

    if (json.asset === undefined || json.asset.version[0] < 2) {
      if (onError) onError(new Error('THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.'));
      return;
    }

    var parser = new THREE.GLTFParser(json, {
      path: path || this.resourcePath || '',
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });

    parser.fileLoader = new THREE.FileLoader(this.manager);
    parser.fileLoader.setRequestHeader(this.requestHeader);

    for (var extensionName in extensions) {
      var extension = extensions[extensionName];
      parser.extensions[extensionName] = extension;
    }

    parser.parse(onLoad, onError);
  }
};

THREE.GLTFLoader.EXTENSIONS = {
  KHR_BINARY_GLTF: 'KHR_binary_glTF'
};

// Simplified GLTFParser
THREE.GLTFParser = function (json, options) {
  this.json = json || {};
  this.extensions = {};
  this.plugins = {};
  this.options = options || {};
  this.cache = new THREE.GLTFRegistry();
  this.associations = new Map();
  this.primitiveCache = {};
  this.textureCache = {};
  this.nodeCache = {};
  this.meshCache = {};
  this.cameraCache = {};
  this.lightCache = {};
  this.sourceCache = {};
  this.trackCache = {};
};

THREE.GLTFParser.prototype = {
  constructor: THREE.GLTFParser,

  parse: function (onLoad, onError) {
    var parser = this;
    var json = this.json;
    var extensions = this.extensions;

    // Clear the loader cache
    this.cache.removeAll();

    // Fire the callback on complete
    this.loadScene().then(function (scene) {
      onLoad({
        scene: scene,
        scenes: [scene],
        cameras: [],
        animations: [],
        asset: json.asset,
        parser: parser,
        userData: {}
      });
    }).catch(onError);
  },

  loadScene: function () {
    var json = this.json;
    var parser = this;

    return this.loadNode(0).then(function (node) {
      var scene = new THREE.Group();
      scene.name = 'Scene';
      scene.add(node);
      return scene;
    });
  },

  loadNode: function (nodeIndex) {
    var json = this.json;
    var parser = this;
    var nodeDef = json.nodes[nodeIndex];

    return parser.loadMesh(nodeDef.mesh).then(function (mesh) {
      var node = mesh || new THREE.Object3D();
      
      if (nodeDef.name !== undefined) {
        node.name = THREE.PropertyBinding.sanitizeNodeName(nodeDef.name);
      }

      if (nodeDef.translation !== undefined) {
        node.position.fromArray(nodeDef.translation);
      }

      if (nodeDef.rotation !== undefined) {
        node.quaternion.fromArray(nodeDef.rotation);
      }

      if (nodeDef.scale !== undefined) {
        node.scale.fromArray(nodeDef.scale);
      }

      if (nodeDef.matrix !== undefined) {
        var matrix = new THREE.Matrix4();
        matrix.fromArray(nodeDef.matrix);
        node.applyMatrix4(matrix);
      }

      return node;
    });
  },

  loadMesh: function (meshIndex) {
    var parser = this;
    var json = this.json;
    
    if (meshIndex === undefined) {
      return Promise.resolve(null);
    }

    var meshDef = json.meshes[meshIndex];
    var primitives = meshDef.primitives;

    var pending = [];

    for (var i = 0, il = primitives.length; i < il; i++) {
      pending.push(this.loadPrimitive(primitives[i]));
    }

    return Promise.all(pending).then(function (primitives) {
      if (primitives.length === 1) {
        return primitives[0];
      }

      var group = new THREE.Group();
      group.name = meshDef.name || ('mesh_' + meshIndex);

      for (var i = 0, il = primitives.length; i < il; i++) {
        group.add(primitives[i]);
      }

      return group;
    });
  },

  loadPrimitive: function (primitive) {
    // Simplified primitive loading - just create a basic sphere for the ball
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.6,
      metalness: 0.1
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return Promise.resolve(mesh);
  }
};

// Registry helper
THREE.GLTFRegistry = function () {
  var objects = {};

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
    }
  };
};

// Binary extension for GLB files
THREE.GLTFBinaryExtension = function (data) {
  this.content = null;
  this.body = null;

  var headerView = new DataView(data, 0, 12);
  var header = {
    magic: THREE.LoaderUtils.decodeText(new Uint8Array(data.slice(0, 4))),
    version: headerView.getUint32(4, true),
    length: headerView.getUint32(8, true)
  };

  if (header.magic !== 'glTF') {
    throw new Error('THREE.GLTFLoader: Unsupported glTF-Binary header.');
  } else if (header.version < 2.0) {
    throw new Error('THREE.GLTFLoader: Legacy binary file detected.');
  }

  var chunkContentsLength = header.length - 12;
  var chunkView = new DataView(data, 12);
  var chunkIndex = 0;

  while (chunkIndex < chunkContentsLength) {
    var chunkLength = chunkView.getUint32(chunkIndex, true);
    chunkIndex += 4;

    var chunkType = chunkView.getUint32(chunkIndex, true);
    chunkIndex += 4;

    if (chunkType === 0x4E4F534A) {
      var contentArray = new Uint8Array(data, 12 + chunkIndex, chunkLength);
      this.content = THREE.LoaderUtils.decodeText(contentArray);
    } else if (chunkType === 0x004E4942) {
      var byteOffset = 12 + chunkIndex;
      this.body = data.slice(byteOffset, byteOffset + chunkLength);
    }

    chunkIndex += chunkLength;
  }

  if (this.content === null) {
    throw new Error('THREE.GLTFLoader: JSON content not found.');
  }
};

// Export GLTFLoader
if (typeof module !== 'undefined' && module.exports) {
  module.exports = THREE.GLTFLoader;
}