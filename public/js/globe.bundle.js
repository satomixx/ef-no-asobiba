/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ exports["default"] = foo;
function foo() {
  return 1;
}

// Scene, Camera, Renderer
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1500);
let cameraRotation = 0;
let cameraRotationSpeed = 0.001;
let cameraAutoRotation = true;
const orbitControls = new THREE.OrbitControls(camera);

// Lights
let spotLight = new THREE.SpotLight(0xffffff, 1, 0, 10, 2);

// Texture Loader
let textureLoader = new THREE.TextureLoader();

// Planet Proto
let planetProto = {
  sphere: function (size) {
    let sphere = new THREE.SphereGeometry(size, 32, 32);

    return sphere;
  },
  material: function (options) {
    let material = new THREE.MeshPhongMaterial();
    if (options) {
      for (var property in options) {
        material[property] = options[property];
      }
    }

    return material;
  },
  glowMaterial: function (intensity, fade, color) {
    // Custom glow shader from https://github.com/stemkoski/stemkoski.github.com/tree/master/Three.js
    let glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        'c': {
          type: 'f',
          value: intensity
        },
        'p': {
          type: 'f',
          value: fade
        },
        glowColor: {
          type: 'c',
          value: new THREE.Color(color)
        },
        viewVector: {
          type: 'v3',
          value: camera.position
        }
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize( normalMatrix * normal );
          vec3 vNormel = normalize( normalMatrix * viewVector );
          intensity = pow( c - dot(vNormal, vNormel), p );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,

      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() 
        {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4( glow, 1.0 );
        }`,

      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    return glowMaterial;
  },
  texture: function (material, property, uri) {
    let textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = true;
    textureLoader.load(uri, function (texture) {
      material[property] = texture;
      material.needsUpdate = true;
    });
  }
};

let createPlanet = function (options) {
  // Create the planet's Surface
  let surfaceGeometry = planetProto.sphere(options.surface.size);
  let surfaceMaterial = planetProto.material(options.surface.material);
  let surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);

  // Create the planet's Atmosphere
  let atmosphereGeometry = planetProto.sphere(options.surface.size + options.atmosphere.size);
  let atmosphereMaterialDefaults = {
    side: THREE.DoubleSide,
    transparent: true
  };
  let atmosphereMaterialOptions = Object.assign(atmosphereMaterialDefaults, options.atmosphere.material);
  let atmosphereMaterial = planetProto.material(atmosphereMaterialOptions);
  let atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

  // Create the planet's Atmospheric glow
  let atmosphericGlowGeometry = planetProto.sphere(options.surface.size + options.atmosphere.size + options.atmosphere.glow.size);
  let atmosphericGlowMaterial = planetProto.glowMaterial(options.atmosphere.glow.intensity, options.atmosphere.glow.fade, options.atmosphere.glow.color);
  let atmosphericGlow = new THREE.Mesh(atmosphericGlowGeometry, atmosphericGlowMaterial);

  // Nest the planet's Surface and Atmosphere into a planet object
  let planet = new THREE.Object3D();
  surface.name = 'surface';
  atmosphere.name = 'atmosphere';
  atmosphericGlow.name = 'atmosphericGlow';
  planet.add(surface);
  planet.add(atmosphere);
  planet.add(atmosphericGlow);

  // Load the Surface's textures
  for (let textureProperty in options.surface.textures) {
    planetProto.texture(surfaceMaterial, textureProperty, options.surface.textures[textureProperty]);
  }

  // Load the Atmosphere's texture
  for (let textureProperty in options.atmosphere.textures) {
    planetProto.texture(atmosphereMaterial, textureProperty, options.atmosphere.textures[textureProperty]);
  }

  return planet;
};

let earth = createPlanet({
  surface: {
    size: 0.5,
    material: {
      bumpScale: 0.05,
      specular: new THREE.Color('grey'),
      shininess: 10
    },
    textures: {
      map: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthmap1k.jpg',
      bumpMap: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthbump1k.jpg',
      specularMap: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthspec1k.jpg'
    }
  },
  atmosphere: {
    size: 0.003,
    material: {
      opacity: 0.8
    },
    textures: {
      map: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthcloudmap.jpg',
      alphaMap: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthcloudmaptrans.jpg'
    },
    glow: {
      size: 0.02,
      intensity: 0.7,
      fade: 7,
      color: 0x93cfef
    }
  }
});

// Marker Proto
let markerProto = {
  latLongToVector3: function latLongToVector3(latitude, longitude, radius, height) {
    var phi = latitude * Math.PI / 180;
    var theta = (longitude - 180) * Math.PI / 180;

    var x = -(radius + height) * Math.cos(phi) * Math.cos(theta);
    var y = (radius + height) * Math.sin(phi);
    var z = (radius + height) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
  },
  marker: function marker(size, color, vector3Position) {
    let markerGeometry = new THREE.SphereGeometry(size);
    let markerMaterial = new THREE.MeshLambertMaterial({
      color: color
    });
    let markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
    markerMesh.position.copy(vector3Position);

    return markerMesh;
  }
};

// Place Marker
let placeMarker = function (object, options) {
  let position = markerProto.latLongToVector3(options.latitude, options.longitude, options.radius, options.height);
  let marker = markerProto.marker(options.size, options.color, position);
  object.add(marker);
};

// Place Marker At Address
let placeMarkerAtAddress = function (address, color) {
  let encodedLocation = address.replace(/\s/g, '+');
  let httpRequest = new XMLHttpRequest();

  httpRequest.open('GET', 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodedLocation);
  httpRequest.send(null);
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      let result = JSON.parse(httpRequest.responseText);

      if (result.results.length > 0) {
        let latitude = result.results[0].geometry.location.lat;
        let longitude = result.results[0].geometry.location.lng;

        placeMarker(earth.getObjectByName('surface'), {
          latitude: latitude,
          longitude: longitude,
          radius: 0.5,
          height: 0,
          size: 0.01,
          color: color
        });
      }
    }
  };
};

// Galaxy
let galaxyGeometry = new THREE.SphereGeometry(100, 32, 32);
let galaxyMaterial = new THREE.MeshBasicMaterial({
  side: THREE.BackSide
});
let galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);

// Load Galaxy Textures
textureLoader.crossOrigin = true;
textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/starfield.png', function (texture) {
  galaxyMaterial.map = texture;
  scene.add(galaxy);
});

// Scene, Camera, Renderer Configuration
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(1, 1, 1);
orbitControls.enabled = !cameraAutoRotation;

scene.add(camera);
scene.add(spotLight);
scene.add(earth);

// Light Configurations
spotLight.position.set(2, 0, 1);

// Mesh Configurations
earth.receiveShadow = true;
earth.castShadow = true;
earth.getObjectByName('surface').geometry.center();

// On window resize, adjust camera aspect ratio and renderer size
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Main render function
let render = function () {
  earth.getObjectByName('surface').rotation.y += 1 / 32 * 0.01;
  earth.getObjectByName('atmosphere').rotation.y += 1 / 16 * 0.01;
  if (cameraAutoRotation) {
    cameraRotation += cameraRotationSpeed;
    camera.position.y = 0;
    camera.position.x = 2 * Math.sin(cameraRotation);
    camera.position.z = 2 * Math.cos(cameraRotation);
    camera.lookAt(earth.position);
  }
  requestAnimationFrame(render);
  renderer.render(scene, camera);
};

render();

// dat.gui
var gui = new dat.GUI();
var guiCamera = gui.addFolder('Camera');
var guiSurface = gui.addFolder('Surface');
var guiMarkers = guiSurface.addFolder('Markers');
var guiAtmosphere = gui.addFolder('Atmosphere');
var guiAtmosphericGlow = guiAtmosphere.addFolder('Glow');

// dat.gui controls object
var cameraControls = new function () {
  this.speed = cameraRotationSpeed;
  this.orbitControls = !cameraAutoRotation;
}();

var surfaceControls = new function () {
  this.rotation = 0;
  this.bumpScale = 0.05;
  this.shininess = 10;
}();

var markersControls = new function () {
  this.address = '';
  this.color = 0xff0000;
  this.placeMarker = function () {
    placeMarkerAtAddress(this.address, this.color);
  };
}();

var atmosphereControls = new function () {
  this.opacity = 0.8;
}();

var atmosphericGlowControls = new function () {
  this.intensity = 0.7;
  this.fade = 7;
  this.color = 0x93cfef;
}();

// dat.gui controls
guiCamera.add(cameraControls, 'speed', 0, 0.1).step(0.001).onChange(function (value) {
  cameraRotationSpeed = value;
});
guiCamera.add(cameraControls, 'orbitControls').onChange(function (value) {
  cameraAutoRotation = !value;
  orbitControls.enabled = value;
});

guiSurface.add(surfaceControls, 'rotation', 0, 6).onChange(function (value) {
  earth.getObjectByName('surface').rotation.y = value;
});
guiSurface.add(surfaceControls, 'bumpScale', 0, 1).step(0.01).onChange(function (value) {
  earth.getObjectByName('surface').material.bumpScale = value;
});
guiSurface.add(surfaceControls, 'shininess', 0, 30).onChange(function (value) {
  earth.getObjectByName('surface').material.shininess = value;
});

guiMarkers.add(markersControls, 'address');
guiMarkers.addColor(markersControls, 'color');
guiMarkers.add(markersControls, 'placeMarker');

guiAtmosphere.add(atmosphereControls, 'opacity', 0, 1).onChange(function (value) {
  earth.getObjectByName('atmosphere').material.opacity = value;
});

guiAtmosphericGlow.add(atmosphericGlowControls, 'intensity', 0, 1).onChange(function (value) {
  earth.getObjectByName('atmosphericGlow').material.uniforms['c'].value = value;
});
guiAtmosphericGlow.add(atmosphericGlowControls, 'fade', 0, 50).onChange(function (value) {
  earth.getObjectByName('atmosphericGlow').material.uniforms['p'].value = value;
});
guiAtmosphericGlow.addColor(atmosphericGlowControls, 'color').onChange(function (value) {
  earth.getObjectByName('atmosphericGlow').material.uniforms.glowColor.value.setHex(value);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9qcy9nbG9iZS5qcyJdLCJuYW1lcyI6WyJmb28iLCJyZW5kZXJlciIsIlRIUkVFIiwiV2ViR0xSZW5kZXJlciIsInNjZW5lIiwiU2NlbmUiLCJhc3BlY3QiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJjYW1lcmEiLCJQZXJzcGVjdGl2ZUNhbWVyYSIsImNhbWVyYVJvdGF0aW9uIiwiY2FtZXJhUm90YXRpb25TcGVlZCIsImNhbWVyYUF1dG9Sb3RhdGlvbiIsIm9yYml0Q29udHJvbHMiLCJPcmJpdENvbnRyb2xzIiwic3BvdExpZ2h0IiwiU3BvdExpZ2h0IiwidGV4dHVyZUxvYWRlciIsIlRleHR1cmVMb2FkZXIiLCJwbGFuZXRQcm90byIsInNwaGVyZSIsInNpemUiLCJTcGhlcmVHZW9tZXRyeSIsIm1hdGVyaWFsIiwib3B0aW9ucyIsIk1lc2hQaG9uZ01hdGVyaWFsIiwicHJvcGVydHkiLCJnbG93TWF0ZXJpYWwiLCJpbnRlbnNpdHkiLCJmYWRlIiwiY29sb3IiLCJTaGFkZXJNYXRlcmlhbCIsInVuaWZvcm1zIiwidHlwZSIsInZhbHVlIiwiZ2xvd0NvbG9yIiwiQ29sb3IiLCJ2aWV3VmVjdG9yIiwicG9zaXRpb24iLCJ2ZXJ0ZXhTaGFkZXIiLCJmcmFnbWVudFNoYWRlciIsInNpZGUiLCJCYWNrU2lkZSIsImJsZW5kaW5nIiwiQWRkaXRpdmVCbGVuZGluZyIsInRyYW5zcGFyZW50IiwidGV4dHVyZSIsInVyaSIsImNyb3NzT3JpZ2luIiwibG9hZCIsIm5lZWRzVXBkYXRlIiwiY3JlYXRlUGxhbmV0Iiwic3VyZmFjZUdlb21ldHJ5Iiwic3VyZmFjZSIsInN1cmZhY2VNYXRlcmlhbCIsIk1lc2giLCJhdG1vc3BoZXJlR2VvbWV0cnkiLCJhdG1vc3BoZXJlIiwiYXRtb3NwaGVyZU1hdGVyaWFsRGVmYXVsdHMiLCJEb3VibGVTaWRlIiwiYXRtb3NwaGVyZU1hdGVyaWFsT3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsImF0bW9zcGhlcmVNYXRlcmlhbCIsImF0bW9zcGhlcmljR2xvd0dlb21ldHJ5IiwiZ2xvdyIsImF0bW9zcGhlcmljR2xvd01hdGVyaWFsIiwiYXRtb3NwaGVyaWNHbG93IiwicGxhbmV0IiwiT2JqZWN0M0QiLCJuYW1lIiwiYWRkIiwidGV4dHVyZVByb3BlcnR5IiwidGV4dHVyZXMiLCJlYXJ0aCIsImJ1bXBTY2FsZSIsInNwZWN1bGFyIiwic2hpbmluZXNzIiwibWFwIiwiYnVtcE1hcCIsInNwZWN1bGFyTWFwIiwib3BhY2l0eSIsImFscGhhTWFwIiwibWFya2VyUHJvdG8iLCJsYXRMb25nVG9WZWN0b3IzIiwibGF0aXR1ZGUiLCJsb25naXR1ZGUiLCJyYWRpdXMiLCJoZWlnaHQiLCJwaGkiLCJNYXRoIiwiUEkiLCJ0aGV0YSIsIngiLCJjb3MiLCJ5Iiwic2luIiwieiIsIlZlY3RvcjMiLCJtYXJrZXIiLCJ2ZWN0b3IzUG9zaXRpb24iLCJtYXJrZXJHZW9tZXRyeSIsIm1hcmtlck1hdGVyaWFsIiwiTWVzaExhbWJlcnRNYXRlcmlhbCIsIm1hcmtlck1lc2giLCJjb3B5IiwicGxhY2VNYXJrZXIiLCJvYmplY3QiLCJwbGFjZU1hcmtlckF0QWRkcmVzcyIsImFkZHJlc3MiLCJlbmNvZGVkTG9jYXRpb24iLCJyZXBsYWNlIiwiaHR0cFJlcXVlc3QiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJzZW5kIiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsInN0YXR1cyIsInJlc3VsdCIsIkpTT04iLCJwYXJzZSIsInJlc3BvbnNlVGV4dCIsInJlc3VsdHMiLCJsZW5ndGgiLCJnZW9tZXRyeSIsImxvY2F0aW9uIiwibGF0IiwibG5nIiwiZ2V0T2JqZWN0QnlOYW1lIiwiZ2FsYXh5R2VvbWV0cnkiLCJnYWxheHlNYXRlcmlhbCIsIk1lc2hCYXNpY01hdGVyaWFsIiwiZ2FsYXh5Iiwic2V0U2l6ZSIsImRvY3VtZW50IiwiYm9keSIsImFwcGVuZENoaWxkIiwiZG9tRWxlbWVudCIsInNldCIsImVuYWJsZWQiLCJyZWNlaXZlU2hhZG93IiwiY2FzdFNoYWRvdyIsImNlbnRlciIsImFkZEV2ZW50TGlzdGVuZXIiLCJ1cGRhdGVQcm9qZWN0aW9uTWF0cml4IiwicmVuZGVyIiwicm90YXRpb24iLCJsb29rQXQiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJndWkiLCJkYXQiLCJHVUkiLCJndWlDYW1lcmEiLCJhZGRGb2xkZXIiLCJndWlTdXJmYWNlIiwiZ3VpTWFya2VycyIsImd1aUF0bW9zcGhlcmUiLCJndWlBdG1vc3BoZXJpY0dsb3ciLCJjYW1lcmFDb250cm9scyIsInNwZWVkIiwic3VyZmFjZUNvbnRyb2xzIiwibWFya2Vyc0NvbnRyb2xzIiwiYXRtb3NwaGVyZUNvbnRyb2xzIiwiYXRtb3NwaGVyaWNHbG93Q29udHJvbHMiLCJzdGVwIiwib25DaGFuZ2UiLCJhZGRDb2xvciIsInNldEhleCJdLCJtYXBwaW5ncyI6IkFBQ0EsZUFBZSxTQUFTQSxHQUFULEdBQXVCO0FBQ3BDLFNBQU8sQ0FBUDtBQUNEOztBQUVEO0FBQ0EsTUFBTUMsV0FBVyxJQUFJQyxNQUFNQyxhQUFWLEVBQWpCO0FBQ0EsTUFBTUMsUUFBUSxJQUFJRixNQUFNRyxLQUFWLEVBQWQ7QUFDQSxNQUFNQyxTQUFTQyxPQUFPQyxVQUFQLEdBQW9CRCxPQUFPRSxXQUExQztBQUNBLE1BQU1DLFNBQVMsSUFBSVIsTUFBTVMsaUJBQVYsQ0FBNEIsRUFBNUIsRUFBZ0NMLE1BQWhDLEVBQXdDLEdBQXhDLEVBQTZDLElBQTdDLENBQWY7QUFDQSxJQUFJTSxpQkFBaUIsQ0FBckI7QUFDQSxJQUFJQyxzQkFBc0IsS0FBMUI7QUFDQSxJQUFJQyxxQkFBcUIsSUFBekI7QUFDQSxNQUFNQyxnQkFBZ0IsSUFBSWIsTUFBTWMsYUFBVixDQUF3Qk4sTUFBeEIsQ0FBdEI7O0FBRUE7QUFDQSxJQUFJTyxZQUFZLElBQUlmLE1BQU1nQixTQUFWLENBQW9CLFFBQXBCLEVBQThCLENBQTlCLEVBQWlDLENBQWpDLEVBQW9DLEVBQXBDLEVBQXdDLENBQXhDLENBQWhCOztB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QyxFQUFpRCxDQUFqRCxFQUFvRCxDQUFwRCxFQUF1REcsUUFBdkQsQ0FBZ0UsVUFBU3BJLEtBQVQsRUFBZ0I7QUFDOUV3QyxRQUFNdUQsZUFBTixDQUFzQixZQUF0QixFQUFvQzFHLFFBQXBDLENBQTZDMEQsT0FBN0MsR0FBdUQvQyxLQUF2RDtBQUNELENBRkQ7O0FBSUE0SCxtQkFBbUJ2RixHQUFuQixDQUF1QjZGLHVCQUF2QixFQUFnRCxXQUFoRCxFQUE2RCxDQUE3RCxFQUFnRSxDQUFoRSxFQUFtRUUsUUFBbkUsQ0FBNEUsVUFBU3BJLEtBQVQsRUFBZ0I7QUFDMUZ3QyxRQUFNdUQsZUFBTixDQUFzQixpQkFBdEIsRUFBeUMxRyxRQUF6QyxDQUFrRFMsUUFBbEQsQ0FBMkQsR0FBM0QsRUFBZ0VFLEtBQWhFLEdBQXdFQSxLQUF4RTtBQUNELENBRkQ7QUFHQTRILG1CQUFtQnZGLEdBQW5CLENBQXVCNkYsdUJBQXZCLEVBQWdELE1BQWhELEVBQXdELENBQXhELEVBQTJELEVBQTNELEVBQStERSxRQUEvRCxDQUF3RSxVQUFTcEksS0FBVCxFQUFnQjtBQUN0RndDLFFBQU11RCxlQUFOLENBQXNCLGlCQUF0QixFQUF5QzFHLFFBQXpDLENBQWtEUyxRQUFsRCxDQUEyRCxHQUEzRCxFQUFnRUUsS0FBaEUsR0FBd0VBLEtBQXhFO0FBQ0QsQ0FGRDtBQUdBNEgsbUJBQW1CUyxRQUFuQixDQUE0QkgsdUJBQTVCLEVBQXFELE9BQXJELEVBQThERSxRQUE5RCxDQUF1RSxVQUFTcEksS0FBVCxFQUFnQjtBQUNyRndDLFFBQU11RCxlQUFOLENBQXNCLGlCQUF0QixFQUF5QzFHLFFBQXpDLENBQWtEUyxRQUFsRCxDQUEyREcsU0FBM0QsQ0FBcUVELEtBQXJFLENBQTJFc0ksTUFBM0UsQ0FBa0Z0SSxLQUFsRjtBQUNELENBRkQiLCJmaWxlIjoiZ2xvYmUuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NhdG9taS93b3Jrc3BhY2UvcHJhY3RpY2UvdGhyZWUvdHJ5Iiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZvbygpOiBudW1iZXIge1xuICByZXR1cm4gMTtcbn1cblxuLy8gU2NlbmUsIENhbWVyYSwgUmVuZGVyZXJcbmNvbnN0IHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbmNvbnN0IHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5jb25zdCBhc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcbmNvbnN0IGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg0NSwgYXNwZWN0LCAwLjEsIDE1MDApO1xubGV0IGNhbWVyYVJvdGF0aW9uID0gMDtcbmxldCBjYW1lcmFSb3RhdGlvblNwZWVkID0gMC4wMDE7XG5sZXQgY2FtZXJhQXV0b1JvdGF0aW9uID0gdHJ1ZTtcbmNvbnN0IG9yYml0Q29udHJvbHMgPSBuZXcgVEhSRUUuT3JiaXRDb250cm9scyhjYW1lcmEpO1xuXG4vLyBMaWdodHNcbmxldCBzcG90TGlnaHQgPSBuZXcgVEhSRUUuU3BvdExpZ2h0KDB4ZmZmZmZmLCAxLCAwLCAxMCwgMik7XG5cbi8vIFRleHR1cmUgTG9hZGVyXG5sZXQgdGV4dHVyZUxvYWRlciA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCk7XG5cbi8vIFBsYW5ldCBQcm90b1xubGV0IHBsYW5ldFByb3RvID0ge1xuICBzcGhlcmU6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICBsZXQgc3BoZXJlID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHNpemUsIDMyLCAzMik7XG4gICAgXG4gICAgcmV0dXJuIHNwaGVyZTtcbiAgfSxcbiAgbWF0ZXJpYWw6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoKTtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgZm9yICh2YXIgcHJvcGVydHkgaW4gb3B0aW9ucykge1xuICAgICAgICBtYXRlcmlhbFtwcm9wZXJ0eV0gPSBvcHRpb25zW3Byb3BlcnR5XTtcbiAgICAgIH0gXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBtYXRlcmlhbDtcbiAgfSxcbiAgZ2xvd01hdGVyaWFsOiBmdW5jdGlvbihpbnRlbnNpdHksIGZhZGUsIGNvbG9yKSB7XG4gICAgLy8gQ3VzdG9tIGdsb3cgc2hhZGVyIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3N0ZW1rb3NraS9zdGVta29za2kuZ2l0aHViLmNvbS90cmVlL21hc3Rlci9UaHJlZS5qc1xuICAgIGxldCBnbG93TWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoe1xuICAgICAgdW5pZm9ybXM6IHsgXG4gICAgICAgICdjJzoge1xuICAgICAgICAgIHR5cGU6ICdmJyxcbiAgICAgICAgICB2YWx1ZTogaW50ZW5zaXR5XG4gICAgICAgIH0sXG4gICAgICAgICdwJzogeyBcbiAgICAgICAgICB0eXBlOiAnZicsXG4gICAgICAgICAgdmFsdWU6IGZhZGVcbiAgICAgICAgfSxcbiAgICAgICAgZ2xvd0NvbG9yOiB7IFxuICAgICAgICAgIHR5cGU6ICdjJyxcbiAgICAgICAgICB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKGNvbG9yKVxuICAgICAgICB9LFxuICAgICAgICB2aWV3VmVjdG9yOiB7XG4gICAgICAgICAgdHlwZTogJ3YzJyxcbiAgICAgICAgICB2YWx1ZTogY2FtZXJhLnBvc2l0aW9uXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IGBcbiAgICAgICAgdW5pZm9ybSB2ZWMzIHZpZXdWZWN0b3I7XG4gICAgICAgIHVuaWZvcm0gZmxvYXQgYztcbiAgICAgICAgdW5pZm9ybSBmbG9hdCBwO1xuICAgICAgICB2YXJ5aW5nIGZsb2F0IGludGVuc2l0eTtcbiAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgIHZlYzMgdk5vcm1hbCA9IG5vcm1hbGl6ZSggbm9ybWFsTWF0cml4ICogbm9ybWFsICk7XG4gICAgICAgICAgdmVjMyB2Tm9ybWVsID0gbm9ybWFsaXplKCBub3JtYWxNYXRyaXggKiB2aWV3VmVjdG9yICk7XG4gICAgICAgICAgaW50ZW5zaXR5ID0gcG93KCBjIC0gZG90KHZOb3JtYWwsIHZOb3JtZWwpLCBwICk7XG4gICAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNCggcG9zaXRpb24sIDEuMCApO1xuICAgICAgICB9YFxuICAgICAgLFxuICAgICAgZnJhZ21lbnRTaGFkZXI6IGBcbiAgICAgICAgdW5pZm9ybSB2ZWMzIGdsb3dDb2xvcjtcbiAgICAgICAgdmFyeWluZyBmbG9hdCBpbnRlbnNpdHk7XG4gICAgICAgIHZvaWQgbWFpbigpIFxuICAgICAgICB7XG4gICAgICAgICAgdmVjMyBnbG93ID0gZ2xvd0NvbG9yICogaW50ZW5zaXR5O1xuICAgICAgICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoIGdsb3csIDEuMCApO1xuICAgICAgICB9YFxuICAgICAgLFxuICAgICAgc2lkZTogVEhSRUUuQmFja1NpZGUsXG4gICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlXG4gICAgfSk7XG4gICAgXG4gICAgcmV0dXJuIGdsb3dNYXRlcmlhbDtcbiAgfSxcbiAgdGV4dHVyZTogZnVuY3Rpb24obWF0ZXJpYWwsIHByb3BlcnR5LCB1cmkpIHtcbiAgICBsZXQgdGV4dHVyZUxvYWRlciA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCk7XG4gICAgdGV4dHVyZUxvYWRlci5jcm9zc09yaWdpbiA9IHRydWU7XG4gICAgdGV4dHVyZUxvYWRlci5sb2FkKFxuICAgICAgdXJpLFxuICAgICAgZnVuY3Rpb24odGV4dHVyZSkge1xuICAgICAgICBtYXRlcmlhbFtwcm9wZXJ0eV0gPSB0ZXh0dXJlO1xuICAgICAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICB9XG4gICAgKTtcbiAgfVxufTtcblxubGV0IGNyZWF0ZVBsYW5ldCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgLy8gQ3JlYXRlIHRoZSBwbGFuZXQncyBTdXJmYWNlXG4gIGxldCBzdXJmYWNlR2VvbWV0cnkgPSBwbGFuZXRQcm90by5zcGhlcmUob3B0aW9ucy5zdXJmYWNlLnNpemUpO1xuICBsZXQgc3VyZmFjZU1hdGVyaWFsID0gcGxhbmV0UHJvdG8ubWF0ZXJpYWwob3B0aW9ucy5zdXJmYWNlLm1hdGVyaWFsKTtcbiAgbGV0IHN1cmZhY2UgPSBuZXcgVEhSRUUuTWVzaChzdXJmYWNlR2VvbWV0cnksIHN1cmZhY2VNYXRlcmlhbCk7XG4gIFxuICAvLyBDcmVhdGUgdGhlIHBsYW5ldCdzIEF0bW9zcGhlcmVcbiAgbGV0IGF0bW9zcGhlcmVHZW9tZXRyeSA9IHBsYW5ldFByb3RvLnNwaGVyZShvcHRpb25zLnN1cmZhY2Uuc2l6ZSArIG9wdGlvbnMuYXRtb3NwaGVyZS5zaXplKTtcbiAgbGV0IGF0bW9zcGhlcmVNYXRlcmlhbERlZmF1bHRzID0ge1xuICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgdHJhbnNwYXJlbnQ6IHRydWVcbiAgfVxuICBsZXQgYXRtb3NwaGVyZU1hdGVyaWFsT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oYXRtb3NwaGVyZU1hdGVyaWFsRGVmYXVsdHMsIG9wdGlvbnMuYXRtb3NwaGVyZS5tYXRlcmlhbCk7XG4gIGxldCBhdG1vc3BoZXJlTWF0ZXJpYWwgPSBwbGFuZXRQcm90by5tYXRlcmlhbChhdG1vc3BoZXJlTWF0ZXJpYWxPcHRpb25zKTtcbiAgbGV0IGF0bW9zcGhlcmUgPSBuZXcgVEhSRUUuTWVzaChhdG1vc3BoZXJlR2VvbWV0cnksIGF0bW9zcGhlcmVNYXRlcmlhbCk7XG4gIFxuICAvLyBDcmVhdGUgdGhlIHBsYW5ldCdzIEF0bW9zcGhlcmljIGdsb3dcbiAgbGV0IGF0bW9zcGhlcmljR2xvd0dlb21ldHJ5ID0gcGxhbmV0UHJvdG8uc3BoZXJlKG9wdGlvbnMuc3VyZmFjZS5zaXplICsgb3B0aW9ucy5hdG1vc3BoZXJlLnNpemUgKyBvcHRpb25zLmF0bW9zcGhlcmUuZ2xvdy5zaXplKTtcbiAgbGV0IGF0bW9zcGhlcmljR2xvd01hdGVyaWFsID0gcGxhbmV0UHJvdG8uZ2xvd01hdGVyaWFsKG9wdGlvbnMuYXRtb3NwaGVyZS5nbG93LmludGVuc2l0eSwgb3B0aW9ucy5hdG1vc3BoZXJlLmdsb3cuZmFkZSwgb3B0aW9ucy5hdG1vc3BoZXJlLmdsb3cuY29sb3IpO1xuICBsZXQgYXRtb3NwaGVyaWNHbG93ID0gbmV3IFRIUkVFLk1lc2goYXRtb3NwaGVyaWNHbG93R2VvbWV0cnksIGF0bW9zcGhlcmljR2xvd01hdGVyaWFsKTtcbiAgXG4gIC8vIE5lc3QgdGhlIHBsYW5ldCdzIFN1cmZhY2UgYW5kIEF0bW9zcGhlcmUgaW50byBhIHBsYW5ldCBvYmplY3RcbiAgbGV0IHBsYW5ldCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICBzdXJmYWNlLm5hbWUgPSAnc3VyZmFjZSc7XG4gIGF0bW9zcGhlcmUubmFtZSA9ICdhdG1vc3BoZXJlJztcbiAgYXRtb3NwaGVyaWNHbG93Lm5hbWUgPSAnYXRtb3NwaGVyaWNHbG93JztcbiAgcGxhbmV0LmFkZChzdXJmYWNlKTtcbiAgcGxhbmV0LmFkZChhdG1vc3BoZXJlKTtcbiAgcGxhbmV0LmFkZChhdG1vc3BoZXJpY0dsb3cpO1xuXG4gIC8vIExvYWQgdGhlIFN1cmZhY2UncyB0ZXh0dXJlc1xuICBmb3IgKGxldCB0ZXh0dXJlUHJvcGVydHkgaW4gb3B0aW9ucy5zdXJmYWNlLnRleHR1cmVzKSB7XG4gICAgcGxhbmV0UHJvdG8udGV4dHVyZShcbiAgICAgIHN1cmZhY2VNYXRlcmlhbCxcbiAgICAgIHRleHR1cmVQcm9wZXJ0eSxcbiAgICAgIG9wdGlvbnMuc3VyZmFjZS50ZXh0dXJlc1t0ZXh0dXJlUHJvcGVydHldXG4gICAgKTsgXG4gIH1cbiAgXG4gIC8vIExvYWQgdGhlIEF0bW9zcGhlcmUncyB0ZXh0dXJlXG4gIGZvciAobGV0IHRleHR1cmVQcm9wZXJ0eSBpbiBvcHRpb25zLmF0bW9zcGhlcmUudGV4dHVyZXMpIHtcbiAgICBwbGFuZXRQcm90by50ZXh0dXJlKFxuICAgICAgYXRtb3NwaGVyZU1hdGVyaWFsLFxuICAgICAgdGV4dHVyZVByb3BlcnR5LFxuICAgICAgb3B0aW9ucy5hdG1vc3BoZXJlLnRleHR1cmVzW3RleHR1cmVQcm9wZXJ0eV1cbiAgICApO1xuICB9XG4gIFxuICByZXR1cm4gcGxhbmV0O1xufTtcblxubGV0IGVhcnRoID0gY3JlYXRlUGxhbmV0KHtcbiAgc3VyZmFjZToge1xuICAgIHNpemU6IDAuNSxcbiAgICBtYXRlcmlhbDoge1xuICAgICAgYnVtcFNjYWxlOiAwLjA1LFxuICAgICAgc3BlY3VsYXI6IG5ldyBUSFJFRS5Db2xvcignZ3JleScpLFxuICAgICAgc2hpbmluZXNzOiAxMFxuICAgIH0sXG4gICAgdGV4dHVyZXM6IHtcbiAgICAgIG1hcDogJ2h0dHBzOi8vczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vcy5jZHBuLmlvLzE0MTIyOC9lYXJ0aG1hcDFrLmpwZycsXG4gICAgICBidW1wTWFwOiAnaHR0cHM6Ly9zMy11cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9zLmNkcG4uaW8vMTQxMjI4L2VhcnRoYnVtcDFrLmpwZycsXG4gICAgICBzcGVjdWxhck1hcDogJ2h0dHBzOi8vczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vcy5jZHBuLmlvLzE0MTIyOC9lYXJ0aHNwZWMxay5qcGcnXG4gICAgfVxuICB9LFxuICBhdG1vc3BoZXJlOiB7XG4gICAgc2l6ZTogMC4wMDMsXG4gICAgbWF0ZXJpYWw6IHtcbiAgICAgIG9wYWNpdHk6IDAuOFxuICAgIH0sXG4gICAgdGV4dHVyZXM6IHtcbiAgICAgIG1hcDogJ2h0dHBzOi8vczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vcy5jZHBuLmlvLzE0MTIyOC9lYXJ0aGNsb3VkbWFwLmpwZycsXG4gICAgICBhbHBoYU1hcDogJ2h0dHBzOi8vczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vcy5jZHBuLmlvLzE0MTIyOC9lYXJ0aGNsb3VkbWFwdHJhbnMuanBnJ1xuICAgIH0sXG4gICAgZ2xvdzoge1xuICAgICAgc2l6ZTogMC4wMixcbiAgICAgIGludGVuc2l0eTogMC43LFxuICAgICAgZmFkZTogNyxcbiAgICAgIGNvbG9yOiAweDkzY2ZlZlxuICAgIH1cbiAgfSxcbn0pO1xuXG4vLyBNYXJrZXIgUHJvdG9cbmxldCBtYXJrZXJQcm90byA9IHtcbiAgbGF0TG9uZ1RvVmVjdG9yMzogZnVuY3Rpb24gbGF0TG9uZ1RvVmVjdG9yMyhsYXRpdHVkZSwgbG9uZ2l0dWRlLCByYWRpdXMsIGhlaWdodCkge1xuICAgIHZhciBwaGkgPSAobGF0aXR1ZGUpKk1hdGguUEkvMTgwO1xuICAgIHZhciB0aGV0YSA9IChsb25naXR1ZGUtMTgwKSpNYXRoLlBJLzE4MDtcblxuICAgIHZhciB4ID0gLShyYWRpdXMraGVpZ2h0KSAqIE1hdGguY29zKHBoaSkgKiBNYXRoLmNvcyh0aGV0YSk7XG4gICAgdmFyIHkgPSAocmFkaXVzK2hlaWdodCkgKiBNYXRoLnNpbihwaGkpO1xuICAgIHZhciB6ID0gKHJhZGl1cytoZWlnaHQpICogTWF0aC5jb3MocGhpKSAqIE1hdGguc2luKHRoZXRhKTtcblxuICAgIHJldHVybiBuZXcgVEhSRUUuVmVjdG9yMyh4LHkseik7XG4gIH0sXG4gIG1hcmtlcjogZnVuY3Rpb24gbWFya2VyKHNpemUsIGNvbG9yLCB2ZWN0b3IzUG9zaXRpb24pIHtcbiAgICBsZXQgbWFya2VyR2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoc2l6ZSk7XG4gICAgbGV0IG1hcmtlck1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe1xuICAgICAgY29sb3I6IGNvbG9yXG4gICAgfSk7XG4gICAgbGV0IG1hcmtlck1lc2ggPSBuZXcgVEhSRUUuTWVzaChtYXJrZXJHZW9tZXRyeSwgbWFya2VyTWF0ZXJpYWwpO1xuICAgIG1hcmtlck1lc2gucG9zaXRpb24uY29weSh2ZWN0b3IzUG9zaXRpb24pO1xuICAgIFxuICAgIHJldHVybiBtYXJrZXJNZXNoO1xuICB9XG59XG5cbi8vIFBsYWNlIE1hcmtlclxubGV0IHBsYWNlTWFya2VyID0gZnVuY3Rpb24ob2JqZWN0LCBvcHRpb25zKSB7XG4gIGxldCBwb3NpdGlvbiA9IG1hcmtlclByb3RvLmxhdExvbmdUb1ZlY3RvcjMob3B0aW9ucy5sYXRpdHVkZSwgb3B0aW9ucy5sb25naXR1ZGUsIG9wdGlvbnMucmFkaXVzLCBvcHRpb25zLmhlaWdodCk7XG4gIGxldCBtYXJrZXIgPSBtYXJrZXJQcm90by5tYXJrZXIob3B0aW9ucy5zaXplLCBvcHRpb25zLmNvbG9yLCBwb3NpdGlvbik7XG4gIG9iamVjdC5hZGQobWFya2VyKTtcbn1cblxuLy8gUGxhY2UgTWFya2VyIEF0IEFkZHJlc3NcbmxldCBwbGFjZU1hcmtlckF0QWRkcmVzcyA9IGZ1bmN0aW9uKGFkZHJlc3MsIGNvbG9yKSB7XG4gIGxldCBlbmNvZGVkTG9jYXRpb24gPSBhZGRyZXNzLnJlcGxhY2UoL1xccy9nLCAnKycpO1xuICBsZXQgaHR0cFJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgXG4gIGh0dHBSZXF1ZXN0Lm9wZW4oJ0dFVCcsICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvZ2VvY29kZS9qc29uP2FkZHJlc3M9JyArIGVuY29kZWRMb2NhdGlvbik7XG4gIGh0dHBSZXF1ZXN0LnNlbmQobnVsbCk7XG4gIGh0dHBSZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChodHRwUmVxdWVzdC5yZWFkeVN0YXRlID09IDQgJiYgaHR0cFJlcXVlc3Quc3RhdHVzID09IDIwMCkge1xuICAgICAgbGV0IHJlc3VsdCA9IEpTT04ucGFyc2UoaHR0cFJlcXVlc3QucmVzcG9uc2VUZXh0KTtcbiAgICAgIFxuICAgICAgaWYgKHJlc3VsdC5yZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGV0IGxhdGl0dWRlID0gcmVzdWx0LnJlc3VsdHNbMF0uZ2VvbWV0cnkubG9jYXRpb24ubGF0O1xuICAgICAgICBsZXQgbG9uZ2l0dWRlID0gcmVzdWx0LnJlc3VsdHNbMF0uZ2VvbWV0cnkubG9jYXRpb24ubG5nO1xuXG4gICAgICAgIHBsYWNlTWFya2VyKGVhcnRoLmdldE9iamVjdEJ5TmFtZSgnc3VyZmFjZScpLHtcbiAgICAgICAgICBsYXRpdHVkZTogbGF0aXR1ZGUsXG4gICAgICAgICAgbG9uZ2l0dWRlOiBsb25naXR1ZGUsXG4gICAgICAgICAgcmFkaXVzOiAwLjUsXG4gICAgICAgICAgaGVpZ2h0OiAwLFxuICAgICAgICAgIHNpemU6IDAuMDEsXG4gICAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbi8vIEdhbGF4eVxubGV0IGdhbGF4eUdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDEwMCwgMzIsIDMyKTtcbmxldCBnYWxheHlNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XG4gIHNpZGU6IFRIUkVFLkJhY2tTaWRlXG59KTtcbmxldCBnYWxheHkgPSBuZXcgVEhSRUUuTWVzaChnYWxheHlHZW9tZXRyeSwgZ2FsYXh5TWF0ZXJpYWwpO1xuXG4vLyBMb2FkIEdhbGF4eSBUZXh0dXJlc1xudGV4dHVyZUxvYWRlci5jcm9zc09yaWdpbiA9IHRydWU7XG50ZXh0dXJlTG9hZGVyLmxvYWQoXG4gICdodHRwczovL3MzLXVzLXdlc3QtMi5hbWF6b25hd3MuY29tL3MuY2Rwbi5pby8xNDEyMjgvc3RhcmZpZWxkLnBuZycsXG4gIGZ1bmN0aW9uKHRleHR1cmUpIHtcbiAgICBnYWxheHlNYXRlcmlhbC5tYXAgPSB0ZXh0dXJlO1xuICAgIHNjZW5lLmFkZChnYWxheHkpO1xuICB9XG4pO1xuXG4vLyBTY2VuZSwgQ2FtZXJhLCBSZW5kZXJlciBDb25maWd1cmF0aW9uXG5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcblxuY2FtZXJhLnBvc2l0aW9uLnNldCgxLDEsMSk7XG5vcmJpdENvbnRyb2xzLmVuYWJsZWQgPSAhY2FtZXJhQXV0b1JvdGF0aW9uO1xuXG5zY2VuZS5hZGQoY2FtZXJhKTtcbnNjZW5lLmFkZChzcG90TGlnaHQpO1xuc2NlbmUuYWRkKGVhcnRoKTtcblxuLy8gTGlnaHQgQ29uZmlndXJhdGlvbnNcbnNwb3RMaWdodC5wb3NpdGlvbi5zZXQoMiwgMCwgMSk7XG5cbi8vIE1lc2ggQ29uZmlndXJhdGlvbnNcbmVhcnRoLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xuZWFydGguY2FzdFNoYWRvdyA9IHRydWU7XG5lYXJ0aC5nZXRPYmplY3RCeU5hbWUoJ3N1cmZhY2UnKS5nZW9tZXRyeS5jZW50ZXIoKTtcblxuLy8gT24gd2luZG93IHJlc2l6ZSwgYWRqdXN0IGNhbWVyYSBhc3BlY3QgcmF0aW8gYW5kIHJlbmRlcmVyIHNpemVcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbigpIHtcbiAgY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuICBjYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICByZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xufSk7XG5cbi8vIE1haW4gcmVuZGVyIGZ1bmN0aW9uXG5sZXQgcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIGVhcnRoLmdldE9iamVjdEJ5TmFtZSgnc3VyZmFjZScpLnJvdGF0aW9uLnkgKz0gMS8zMiAqIDAuMDE7XG4gIGVhcnRoLmdldE9iamVjdEJ5TmFtZSgnYXRtb3NwaGVyZScpLnJvdGF0aW9uLnkgKz0gMS8xNiAqIDAuMDE7XG4gIGlmIChjYW1lcmFBdXRvUm90YXRpb24pIHtcbiAgICBjYW1lcmFSb3RhdGlvbiArPSBjYW1lcmFSb3RhdGlvblNwZWVkO1xuICAgIGNhbWVyYS5wb3NpdGlvbi55ID0gMDtcbiAgICBjYW1lcmEucG9zaXRpb24ueCA9IDIgKiBNYXRoLnNpbihjYW1lcmFSb3RhdGlvbik7XG4gICAgY2FtZXJhLnBvc2l0aW9uLnogPSAyICogTWF0aC5jb3MoY2FtZXJhUm90YXRpb24pO1xuICAgIGNhbWVyYS5sb29rQXQoZWFydGgucG9zaXRpb24pO1xuICB9XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG59O1xuXG5yZW5kZXIoKTtcblxuLy8gZGF0Lmd1aVxudmFyIGd1aSA9IG5ldyBkYXQuR1VJKCk7XG52YXIgZ3VpQ2FtZXJhID0gZ3VpLmFkZEZvbGRlcignQ2FtZXJhJyk7XG52YXIgZ3VpU3VyZmFjZSA9IGd1aS5hZGRGb2xkZXIoJ1N1cmZhY2UnKTtcbnZhciBndWlNYXJrZXJzID0gZ3VpU3VyZmFjZS5hZGRGb2xkZXIoJ01hcmtlcnMnKTtcbnZhciBndWlBdG1vc3BoZXJlID0gZ3VpLmFkZEZvbGRlcignQXRtb3NwaGVyZScpO1xudmFyIGd1aUF0bW9zcGhlcmljR2xvdyA9IGd1aUF0bW9zcGhlcmUuYWRkRm9sZGVyKCdHbG93Jyk7XG5cbi8vIGRhdC5ndWkgY29udHJvbHMgb2JqZWN0XG52YXIgY2FtZXJhQ29udHJvbHMgPSBuZXcgZnVuY3Rpb24oKSB7XG4gIHRoaXMuc3BlZWQgPSBjYW1lcmFSb3RhdGlvblNwZWVkO1xuICB0aGlzLm9yYml0Q29udHJvbHMgPSAhY2FtZXJhQXV0b1JvdGF0aW9uO1xufVxuXG52YXIgc3VyZmFjZUNvbnRyb2xzID0gbmV3IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJvdGF0aW9uID0gMDtcbiAgdGhpcy5idW1wU2NhbGUgPSAwLjA1O1xuICB0aGlzLnNoaW5pbmVzcyA9IDEwO1xufVxuXG52YXIgbWFya2Vyc0NvbnRyb2xzID0gbmV3IGZ1bmN0aW9uKCkge1xuICB0aGlzLmFkZHJlc3MgPSAnJztcbiAgdGhpcy5jb2xvciA9IDB4ZmYwMDAwO1xuICB0aGlzLnBsYWNlTWFya2VyPSBmdW5jdGlvbigpIHtcbiAgICBwbGFjZU1hcmtlckF0QWRkcmVzcyh0aGlzLmFkZHJlc3MsIHRoaXMuY29sb3IpO1xuICB9XG59XG5cbnZhciBhdG1vc3BoZXJlQ29udHJvbHMgPSBuZXcgZnVuY3Rpb24oKSB7XG4gIHRoaXMub3BhY2l0eSA9IDAuODtcbn1cblxudmFyIGF0bW9zcGhlcmljR2xvd0NvbnRyb2xzID0gbmV3IGZ1bmN0aW9uKCkge1xuICB0aGlzLmludGVuc2l0eSA9IDAuNztcbiAgdGhpcy5mYWRlID0gNztcbiAgdGhpcy5jb2xvciA9IDB4OTNjZmVmO1xufVxuXG4vLyBkYXQuZ3VpIGNvbnRyb2xzXG5ndWlDYW1lcmEuYWRkKGNhbWVyYUNvbnRyb2xzLCAnc3BlZWQnLCAwLCAwLjEpLnN0ZXAoMC4wMDEpLm9uQ2hhbmdlKGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGNhbWVyYVJvdGF0aW9uU3BlZWQgPSB2YWx1ZTtcbn0pO1xuZ3VpQ2FtZXJhLmFkZChjYW1lcmFDb250cm9scywgJ29yYml0Q29udHJvbHMnKS5vbkNoYW5nZShmdW5jdGlvbih2YWx1ZSkge1xuICBjYW1lcmFBdXRvUm90YXRpb24gPSAhdmFsdWU7XG4gIG9yYml0Q29udHJvbHMuZW5hYmxlZCA9IHZhbHVlO1xufSk7XG5cbmd1aVN1cmZhY2UuYWRkKHN1cmZhY2VDb250cm9scywgJ3JvdGF0aW9uJywgMCwgNikub25DaGFuZ2UoZnVuY3Rpb24odmFsdWUpIHtcbiAgZWFydGguZ2V0T2JqZWN0QnlOYW1lKCdzdXJmYWNlJykucm90YXRpb24ueSA9IHZhbHVlO1xufSk7XG5ndWlTdXJmYWNlLmFkZChzdXJmYWNlQ29udHJvbHMsICdidW1wU2NhbGUnLCAwLCAxKS5zdGVwKDAuMDEpLm9uQ2hhbmdlKGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGVhcnRoLmdldE9iamVjdEJ5TmFtZSgnc3VyZmFjZScpLm1hdGVyaWFsLmJ1bXBTY2FsZSA9IHZhbHVlO1xufSk7XG5ndWlTdXJmYWNlLmFkZChzdXJmYWNlQ29udHJvbHMsICdzaGluaW5lc3MnLCAwLCAzMCkub25DaGFuZ2UoZnVuY3Rpb24odmFsdWUpIHtcbiAgZWFydGguZ2V0T2JqZWN0QnlOYW1lKCdzdXJmYWNlJykubWF0ZXJpYWwuc2hpbmluZXNzID0gdmFsdWU7XG59KTtcblxuZ3VpTWFya2Vycy5hZGQobWFya2Vyc0NvbnRyb2xzLCAnYWRkcmVzcycpO1xuZ3VpTWFya2Vycy5hZGRDb2xvcihtYXJrZXJzQ29udHJvbHMsICdjb2xvcicpO1xuZ3VpTWFya2Vycy5hZGQobWFya2Vyc0NvbnRyb2xzLCAncGxhY2VNYXJrZXInKTtcblxuZ3VpQXRtb3NwaGVyZS5hZGQoYXRtb3NwaGVyZUNvbnRyb2xzLCAnb3BhY2l0eScsIDAsIDEpLm9uQ2hhbmdlKGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGVhcnRoLmdldE9iamVjdEJ5TmFtZSgnYXRtb3NwaGVyZScpLm1hdGVyaWFsLm9wYWNpdHkgPSB2YWx1ZTtcbn0pO1xuXG5ndWlBdG1vc3BoZXJpY0dsb3cuYWRkKGF0bW9zcGhlcmljR2xvd0NvbnRyb2xzLCAnaW50ZW5zaXR5JywgMCwgMSkub25DaGFuZ2UoZnVuY3Rpb24odmFsdWUpIHtcbiAgZWFydGguZ2V0T2JqZWN0QnlOYW1lKCdhdG1vc3BoZXJpY0dsb3cnKS5tYXRlcmlhbC51bmlmb3Jtc1snYyddLnZhbHVlID0gdmFsdWU7XG59KTtcbmd1aUF0bW9zcGhlcmljR2xvdy5hZGQoYXRtb3NwaGVyaWNHbG93Q29udHJvbHMsICdmYWRlJywgMCwgNTApLm9uQ2hhbmdlKGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGVhcnRoLmdldE9iamVjdEJ5TmFtZSgnYXRtb3NwaGVyaWNHbG93JykubWF0ZXJpYWwudW5pZm9ybXNbJ3AnXS52YWx1ZSA9IHZhbHVlO1xufSk7XG5ndWlBdG1vc3BoZXJpY0dsb3cuYWRkQ29sb3IoYXRtb3NwaGVyaWNHbG93Q29udHJvbHMsICdjb2xvcicpLm9uQ2hhbmdlKGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGVhcnRoLmdldE9iamVjdEJ5TmFtZSgnYXRtb3NwaGVyaWNHbG93JykubWF0ZXJpYWwudW5pZm9ybXMuZ2xvd0NvbG9yLnZhbHVlLnNldEhleCh2YWx1ZSk7XG59KTsiXX0=

/***/ }
/******/ ]);