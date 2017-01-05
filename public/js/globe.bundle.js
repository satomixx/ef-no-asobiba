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
let renderer = new THREE.WebGLRenderer();
let scene = new THREE.Scene();
let aspect = window.innerWidth / window.innerHeight;
let camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1500);
let cameraRotation = 0;
let cameraRotationSpeed = 0.001;
let cameraAutoRotation = true;
let orbitControls = new THREE.OrbitControls(camera);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9qcy9nbG9iZS5qcyJdLCJuYW1lcyI6WyJmb28iLCJyZW5kZXJlciIsIlRIUkVFIiwiV2ViR0xSZW5kZXJlciIsInNjZW5lIiwiU2NlbmUiLCJhc3BlY3QiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJjYW1lcmEiLCJQZXJzcGVjdGl2ZUNhbWVyYSIsImNhbWVyYVJvdGF0aW9uIiwiY2FtZXJhUm90YXRpb25TcGVlZCIsImNhbWVyYUF1dG9Sb3RhdGlvbiIsIm9yYml0Q29udHJvbHMiLCJPcmJpdENvbnRyb2xzIiwic3BvdExpZ2h0IiwiU3BvdExpZ2h0IiwidGV4dHVyZUxvYWRlciIsIlRleHR1cmVMb2FkZXIiLCJwbGFuZXRQcm90byIsInNwaGVyZSIsInNpemUiLCJTcGhlcmVHZW9tZXRyeSIsIm1hdGVyaWFsIiwib3B0aW9ucyIsIk1lc2hQaG9uZ01hdGVyaWFsIiwicHJvcGVydHkiLCJnbG93TWF0ZXJpYWwiLCJpbnRlbnNpdHkiLCJmYWRlIiwiY29sb3IiLCJTaGFkZXJNYXRlcmlhbCIsInVuaWZvcm1zIiwidHlwZSIsInZhbHVlIiwiZ2xvd0NvbG9yIiwiQ29sb3IiLCJ2aWV3VmVjdG9yIiwicG9zaXRpb24iLCJ2ZXJ0ZXhTaGFkZXIiLCJmcmFnbWVudFNoYWRlciIsInNpZGUiLCJCYWNrU2lkZSIsImJsZW5kaW5nIiwiQWRkaXRpdmVCbGVuZGluZyIsInRyYW5zcGFyZW50IiwidGV4dHVyZSIsInVyaSIsImNyb3NzT3JpZ2luIiwibG9hZCIsIm5lZWRzVXBkYXRlIiwiY3JlYXRlUGxhbmV0Iiwic3VyZmFjZUdlb21ldHJ5Iiwic3VyZmFjZSIsInN1cmZhY2VNYXRlcmlhbCIsIk1lc2giLCJhdG1vc3BoZXJlR2VvbWV0cnkiLCJhdG1vc3BoZXJlIiwiYXRtb3NwaGVyZU1hdGVyaWFsRGVmYXVsdHMiLCJEb3VibGVTaWRlIiwiYXRtb3NwaGVyZU1hdGVyaWFsT3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsImF0bW9zcGhlcmVNYXRlcmlhbCIsImF0bW9zcGhlcmljR2xvd0dlb21ldHJ5IiwiZ2xvdyIsImF0bW9zcGhlcmljR2xvd01hdGVyaWFsIiwiYXRtb3NwaGVyaWNHbG93IiwicGxhbmV0IiwiT2JqZWN0M0QiLCJuYW1lIiwiYWRkIiwidGV4dHVyZVByb3BlcnR5IiwidGV4dHVyZXMiLCJlYXJ0aCIsImJ1bXBTY2FsZSIsInNwZWN1bGFyIiwic2hpbmluZXNzIiwibWFwIiwiYnVtcE1hcCIsInNwZWN1bGFyTWFwIiwib3BhY2l0eSIsImFscGhhTWFwIiwibWFya2VyUHJvdG8iLCJsYXRMb25nVG9WZWN0b3IzIiwibGF0aXR1ZGUiLCJsb25naXR1ZGUiLCJyYWRpdXMiLCJoZWlnaHQiLCJwaGkiLCJNYXRoIiwiUEkiLCJ0aGV0YSIsIngiLCJjb3MiLCJ5Iiwic2luIiwieiIsIlZlY3RvcjMiLCJtYXJrZXIiLCJ2ZWN0b3IzUG9zaXRpb24iLCJtYXJrZXJHZW9tZXRyeSIsIm1hcmtlck1hdGVyaWFsIiwiTWVzaExhbWJlcnRNYXRlcmlhbCIsIm1hcmtlck1lc2giLCJjb3B5IiwicGxhY2VNYXJrZXIiLCJvYmplY3QiLCJwbGFjZU1hcmtlckF0QWRkcmVzcyIsImFkZHJlc3MiLCJlbmNvZGVkTG9jYXRpb24iLCJyZXBsYWNlIiwiaHR0cFJlcXVlc3QiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJzZW5kIiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsInN0YXR1cyIsInJlc3VsdCIsIkpTT04iLCJwYXJzZSIsInJlc3BvbnNlVGV4dCIsInJlc3VsdHMiLCJsZW5ndGgiLCJnZW9tZXRyeSIsImxvY2F0aW9uIiwibGF0IiwibG5nIiwiZ2V0T2JqZWN0QnlOYW1lIiwiZ2FsYXh5R2VvbWV0cnkiLCJnYWxheHlNYXRlcmlhbCIsIk1lc2hCYXNpY01hdGVyaWFsIiwiZ2FsYXh5Iiwic2V0U2l6ZSIsImRvY3VtZW50IiwiYm9keSIsImFwcGVuZENoaWxkIiwiZG9tRWxlbWVudCIsInNldCIsImVuYWJsZWQiLCJyZWNlaXZlU2hhZG93IiwiY2FzdFNoYWRvdyIsImNlbnRlciIsImFkZEV2ZW50TGlzdGVuZXIiLCJ1cGRhdGVQcm9qZWN0aW9uTWF0cml4IiwicmVuZGVyIiwicm90YXRpb24iLCJsb29rQXQiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJndWkiLCJkYXQiLCJHVUkiLCJndWlDYW1lcmEiLCJhZGRGb2xkZXIiLCJndWlTdXJmYWNlIiwiZ3VpTWFya2VycyIsImd1aUF0bW9zcGhlcmUiLCJndWlBdG1vc3BoZXJpY0dsb3ciLCJjYW1lcmFDb250cm9scyIsInNwZWVkIiwic3VyZmFjZUNvbnRyb2xzIiwibWFya2Vyc0NvbnRyb2xzIiwiYXRtb3NwaGVyZUNvbnRyb2xzIiwiYXRtb3NwaGVyaWNHbG93Q29udHJvbHMiLCJzdGVwIiwib25DaGFuZ2UiLCJhZGRDb2xvciIsInNldEhleCJdLCJtYXBwaW5ncyI6IkFBQ0EsZUFBZSxTQUFTQSxHQUFULEdBQXVCO0FBQ3BDLFNBQU8sQ0FBUDtBQUNEOztBQUVEO0FBQ0EsSUFBSUMsV0FBVyxJQUFJQyxNQUFNQyxhQUFWLEVBQWY7QUFDQSxJQUFJQyxRQUFRLElBQUlGLE1BQU1HLEtBQVYsRUFBWjtBQUNBLElBQUlDLFNBQVNDLE9BQU9DLFVBQVAsR0FBb0JELE9BQU9FLFdBQXhDO0FBQ0EsSUFBSUMsU0FBUyxJQUFJUixNQUFNUyxpQkFBVixDQUE0QixFQUE1QixFQUFnQ0wsTUFBaEMsRUFBd0MsR0FBeEMsRUFBNkMsSUFBN0MsQ0FBYjtBQUNBLElBQUlNLGlCQUFpQixDQUFyQjtBQUNBLElBQUlDLHNCQUFzQixLQUExQjtBQUNBLElBQUlDLHFCQUFxQixJQUF6QjtBQUNBLElBQUlDLGdCQUFnQixJQUFJYixNQUFNYyxhQUFWLENBQXdCTixNQUF4QixDQUFwQjs7QUFFQTtBQUNBLElBQUlPLFlBQVksSUFBSWYsTUFBTWdCLFNBQVYsQ0FBb0IsUUFBcEIsRUFBOEIsQ0FBOUIsRUFBaUMsQ0FBakMsRUFBb0MsRUFBcEMsRUFBd0MsQ0FBeEMsQ0FBaEI7O0FB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LEVBQWlELENBQWpELEVBQW9ELENBQXBELEVBQXVERyxRQUF2RCxDQUFnRSxVQUFTcEksS0FBVCxFQUFnQjtBQUM5RXdDLFFBQU11RCxlQUFOLENBQXNCLFlBQXRCLEVBQW9DMUcsUUFBcEMsQ0FBNkMwRCxPQUE3QyxHQUF1RC9DLEtBQXZEO0FBQ0QsQ0FGRDs7QUFJQTRILG1CQUFtQnZGLEdBQW5CLENBQXVCNkYsdUJBQXZCLEVBQWdELFdBQWhELEVBQTZELENBQTdELEVBQWdFLENBQWhFLEVBQW1FRSxRQUFuRSxDQUE0RSxVQUFTcEksS0FBVCxFQUFnQjtBQUMxRndDLFFBQU11RCxlQUFOLENBQXNCLGlCQUF0QixFQUF5QzFHLFFBQXpDLENBQWtEUyxRQUFsRCxDQUEyRCxHQUEzRCxFQUFnRUUsS0FBaEUsR0FBd0VBLEtBQXhFO0FBQ0QsQ0FGRDtBQUdBNEgsbUJBQW1CdkYsR0FBbkIsQ0FBdUI2Rix1QkFBdkIsRUFBZ0QsTUFBaEQsRUFBd0QsQ0FBeEQsRUFBMkQsRUFBM0QsRUFBK0RFLFFBQS9ELENBQXdFLFVBQVNwSSxLQUFULEVBQWdCO0FBQ3RGd0MsUUFBTXVELGVBQU4sQ0FBc0IsaUJBQXRCLEVBQXlDMUcsUUFBekMsQ0FBa0RTLFFBQWxELENBQTJELEdBQTNELEVBQWdFRSxLQUFoRSxHQUF3RUEsS0FBeEU7QUFDRCxDQUZEO0FBR0E0SCxtQkFBbUJTLFFBQW5CLENBQTRCSCx1QkFBNUIsRUFBcUQsT0FBckQsRUFBOERFLFFBQTlELENBQXVFLFVBQVNwSSxLQUFULEVBQWdCO0FBQ3JGd0MsUUFBTXVELGVBQU4sQ0FBc0IsaUJBQXRCLEVBQXlDMUcsUUFBekMsQ0FBa0RTLFFBQWxELENBQTJERyxTQUEzRCxDQUFxRUQsS0FBckUsQ0FBMkVzSSxNQUEzRSxDQUFrRnRJLEtBQWxGO0FBQ0QsQ0FGRCIsImZpbGUiOiJnbG9iZS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2F0b21pL3dvcmtzcGFjZS9wcmFjdGljZS90aHJlZS90cnkiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZm9vKCk6IG51bWJlciB7XG4gIHJldHVybiAxO1xufVxuXG4vLyBTY2VuZSwgQ2FtZXJhLCBSZW5kZXJlclxubGV0IHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbmxldCBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xubGV0IGFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xubGV0IGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg0NSwgYXNwZWN0LCAwLjEsIDE1MDApO1xubGV0IGNhbWVyYVJvdGF0aW9uID0gMDtcbmxldCBjYW1lcmFSb3RhdGlvblNwZWVkID0gMC4wMDE7XG5sZXQgY2FtZXJhQXV0b1JvdGF0aW9uID0gdHJ1ZTtcbmxldCBvcmJpdENvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHMoY2FtZXJhKTtcblxuLy8gTGlnaHRzXG5sZXQgc3BvdExpZ2h0ID0gbmV3IFRIUkVFLlNwb3RMaWdodCgweGZmZmZmZiwgMSwgMCwgMTAsIDIpO1xuXG4vLyBUZXh0dXJlIExvYWRlclxubGV0IHRleHR1cmVMb2FkZXIgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpO1xuXG4vLyBQbGFuZXQgUHJvdG9cbmxldCBwbGFuZXRQcm90byA9IHtcbiAgc3BoZXJlOiBmdW5jdGlvbihzaXplKSB7XG4gICAgbGV0IHNwaGVyZSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeShzaXplLCAzMiwgMzIpO1xuICAgIFxuICAgIHJldHVybiBzcGhlcmU7XG4gIH0sXG4gIG1hdGVyaWFsOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKCk7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIGZvciAodmFyIHByb3BlcnR5IGluIG9wdGlvbnMpIHtcbiAgICAgICAgbWF0ZXJpYWxbcHJvcGVydHldID0gb3B0aW9uc1twcm9wZXJ0eV07XG4gICAgICB9IFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gbWF0ZXJpYWw7XG4gIH0sXG4gIGdsb3dNYXRlcmlhbDogZnVuY3Rpb24oaW50ZW5zaXR5LCBmYWRlLCBjb2xvcikge1xuICAgIC8vIEN1c3RvbSBnbG93IHNoYWRlciBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9zdGVta29za2kvc3RlbWtvc2tpLmdpdGh1Yi5jb20vdHJlZS9tYXN0ZXIvVGhyZWUuanNcbiAgICBsZXQgZ2xvd01hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcbiAgICAgIHVuaWZvcm1zOiB7IFxuICAgICAgICAnYyc6IHtcbiAgICAgICAgICB0eXBlOiAnZicsXG4gICAgICAgICAgdmFsdWU6IGludGVuc2l0eVxuICAgICAgICB9LFxuICAgICAgICAncCc6IHsgXG4gICAgICAgICAgdHlwZTogJ2YnLFxuICAgICAgICAgIHZhbHVlOiBmYWRlXG4gICAgICAgIH0sXG4gICAgICAgIGdsb3dDb2xvcjogeyBcbiAgICAgICAgICB0eXBlOiAnYycsXG4gICAgICAgICAgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcihjb2xvcilcbiAgICAgICAgfSxcbiAgICAgICAgdmlld1ZlY3Rvcjoge1xuICAgICAgICAgIHR5cGU6ICd2MycsXG4gICAgICAgICAgdmFsdWU6IGNhbWVyYS5wb3NpdGlvblxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdmVydGV4U2hhZGVyOiBgXG4gICAgICAgIHVuaWZvcm0gdmVjMyB2aWV3VmVjdG9yO1xuICAgICAgICB1bmlmb3JtIGZsb2F0IGM7XG4gICAgICAgIHVuaWZvcm0gZmxvYXQgcDtcbiAgICAgICAgdmFyeWluZyBmbG9hdCBpbnRlbnNpdHk7XG4gICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICB2ZWMzIHZOb3JtYWwgPSBub3JtYWxpemUoIG5vcm1hbE1hdHJpeCAqIG5vcm1hbCApO1xuICAgICAgICAgIHZlYzMgdk5vcm1lbCA9IG5vcm1hbGl6ZSggbm9ybWFsTWF0cml4ICogdmlld1ZlY3RvciApO1xuICAgICAgICAgIGludGVuc2l0eSA9IHBvdyggYyAtIGRvdCh2Tm9ybWFsLCB2Tm9ybWVsKSwgcCApO1xuICAgICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTtcbiAgICAgICAgfWBcbiAgICAgICxcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBgXG4gICAgICAgIHVuaWZvcm0gdmVjMyBnbG93Q29sb3I7XG4gICAgICAgIHZhcnlpbmcgZmxvYXQgaW50ZW5zaXR5O1xuICAgICAgICB2b2lkIG1haW4oKSBcbiAgICAgICAge1xuICAgICAgICAgIHZlYzMgZ2xvdyA9IGdsb3dDb2xvciAqIGludGVuc2l0eTtcbiAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KCBnbG93LCAxLjAgKTtcbiAgICAgICAgfWBcbiAgICAgICxcbiAgICAgIHNpZGU6IFRIUkVFLkJhY2tTaWRlLFxuICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZVxuICAgIH0pO1xuICAgIFxuICAgIHJldHVybiBnbG93TWF0ZXJpYWw7XG4gIH0sXG4gIHRleHR1cmU6IGZ1bmN0aW9uKG1hdGVyaWFsLCBwcm9wZXJ0eSwgdXJpKSB7XG4gICAgbGV0IHRleHR1cmVMb2FkZXIgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpO1xuICAgIHRleHR1cmVMb2FkZXIuY3Jvc3NPcmlnaW4gPSB0cnVlO1xuICAgIHRleHR1cmVMb2FkZXIubG9hZChcbiAgICAgIHVyaSxcbiAgICAgIGZ1bmN0aW9uKHRleHR1cmUpIHtcbiAgICAgICAgbWF0ZXJpYWxbcHJvcGVydHldID0gdGV4dHVyZTtcbiAgICAgICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgfVxuICAgICk7XG4gIH1cbn07XG5cbmxldCBjcmVhdGVQbGFuZXQgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIC8vIENyZWF0ZSB0aGUgcGxhbmV0J3MgU3VyZmFjZVxuICBsZXQgc3VyZmFjZUdlb21ldHJ5ID0gcGxhbmV0UHJvdG8uc3BoZXJlKG9wdGlvbnMuc3VyZmFjZS5zaXplKTtcbiAgbGV0IHN1cmZhY2VNYXRlcmlhbCA9IHBsYW5ldFByb3RvLm1hdGVyaWFsKG9wdGlvbnMuc3VyZmFjZS5tYXRlcmlhbCk7XG4gIGxldCBzdXJmYWNlID0gbmV3IFRIUkVFLk1lc2goc3VyZmFjZUdlb21ldHJ5LCBzdXJmYWNlTWF0ZXJpYWwpO1xuICBcbiAgLy8gQ3JlYXRlIHRoZSBwbGFuZXQncyBBdG1vc3BoZXJlXG4gIGxldCBhdG1vc3BoZXJlR2VvbWV0cnkgPSBwbGFuZXRQcm90by5zcGhlcmUob3B0aW9ucy5zdXJmYWNlLnNpemUgKyBvcHRpb25zLmF0bW9zcGhlcmUuc2l6ZSk7XG4gIGxldCBhdG1vc3BoZXJlTWF0ZXJpYWxEZWZhdWx0cyA9IHtcbiAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxuICAgIHRyYW5zcGFyZW50OiB0cnVlXG4gIH1cbiAgbGV0IGF0bW9zcGhlcmVNYXRlcmlhbE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKGF0bW9zcGhlcmVNYXRlcmlhbERlZmF1bHRzLCBvcHRpb25zLmF0bW9zcGhlcmUubWF0ZXJpYWwpO1xuICBsZXQgYXRtb3NwaGVyZU1hdGVyaWFsID0gcGxhbmV0UHJvdG8ubWF0ZXJpYWwoYXRtb3NwaGVyZU1hdGVyaWFsT3B0aW9ucyk7XG4gIGxldCBhdG1vc3BoZXJlID0gbmV3IFRIUkVFLk1lc2goYXRtb3NwaGVyZUdlb21ldHJ5LCBhdG1vc3BoZXJlTWF0ZXJpYWwpO1xuICBcbiAgLy8gQ3JlYXRlIHRoZSBwbGFuZXQncyBBdG1vc3BoZXJpYyBnbG93XG4gIGxldCBhdG1vc3BoZXJpY0dsb3dHZW9tZXRyeSA9IHBsYW5ldFByb3RvLnNwaGVyZShvcHRpb25zLnN1cmZhY2Uuc2l6ZSArIG9wdGlvbnMuYXRtb3NwaGVyZS5zaXplICsgb3B0aW9ucy5hdG1vc3BoZXJlLmdsb3cuc2l6ZSk7XG4gIGxldCBhdG1vc3BoZXJpY0dsb3dNYXRlcmlhbCA9IHBsYW5ldFByb3RvLmdsb3dNYXRlcmlhbChvcHRpb25zLmF0bW9zcGhlcmUuZ2xvdy5pbnRlbnNpdHksIG9wdGlvbnMuYXRtb3NwaGVyZS5nbG93LmZhZGUsIG9wdGlvbnMuYXRtb3NwaGVyZS5nbG93LmNvbG9yKTtcbiAgbGV0IGF0bW9zcGhlcmljR2xvdyA9IG5ldyBUSFJFRS5NZXNoKGF0bW9zcGhlcmljR2xvd0dlb21ldHJ5LCBhdG1vc3BoZXJpY0dsb3dNYXRlcmlhbCk7XG4gIFxuICAvLyBOZXN0IHRoZSBwbGFuZXQncyBTdXJmYWNlIGFuZCBBdG1vc3BoZXJlIGludG8gYSBwbGFuZXQgb2JqZWN0XG4gIGxldCBwbGFuZXQgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAgc3VyZmFjZS5uYW1lID0gJ3N1cmZhY2UnO1xuICBhdG1vc3BoZXJlLm5hbWUgPSAnYXRtb3NwaGVyZSc7XG4gIGF0bW9zcGhlcmljR2xvdy5uYW1lID0gJ2F0bW9zcGhlcmljR2xvdyc7XG4gIHBsYW5ldC5hZGQoc3VyZmFjZSk7XG4gIHBsYW5ldC5hZGQoYXRtb3NwaGVyZSk7XG4gIHBsYW5ldC5hZGQoYXRtb3NwaGVyaWNHbG93KTtcblxuICAvLyBMb2FkIHRoZSBTdXJmYWNlJ3MgdGV4dHVyZXNcbiAgZm9yIChsZXQgdGV4dHVyZVByb3BlcnR5IGluIG9wdGlvbnMuc3VyZmFjZS50ZXh0dXJlcykge1xuICAgIHBsYW5ldFByb3RvLnRleHR1cmUoXG4gICAgICBzdXJmYWNlTWF0ZXJpYWwsXG4gICAgICB0ZXh0dXJlUHJvcGVydHksXG4gICAgICBvcHRpb25zLnN1cmZhY2UudGV4dHVyZXNbdGV4dHVyZVByb3BlcnR5XVxuICAgICk7IFxuICB9XG4gIFxuICAvLyBMb2FkIHRoZSBBdG1vc3BoZXJlJ3MgdGV4dHVyZVxuICBmb3IgKGxldCB0ZXh0dXJlUHJvcGVydHkgaW4gb3B0aW9ucy5hdG1vc3BoZXJlLnRleHR1cmVzKSB7XG4gICAgcGxhbmV0UHJvdG8udGV4dHVyZShcbiAgICAgIGF0bW9zcGhlcmVNYXRlcmlhbCxcbiAgICAgIHRleHR1cmVQcm9wZXJ0eSxcbiAgICAgIG9wdGlvbnMuYXRtb3NwaGVyZS50ZXh0dXJlc1t0ZXh0dXJlUHJvcGVydHldXG4gICAgKTtcbiAgfVxuICBcbiAgcmV0dXJuIHBsYW5ldDtcbn07XG5cbmxldCBlYXJ0aCA9IGNyZWF0ZVBsYW5ldCh7XG4gIHN1cmZhY2U6IHtcbiAgICBzaXplOiAwLjUsXG4gICAgbWF0ZXJpYWw6IHtcbiAgICAgIGJ1bXBTY2FsZTogMC4wNSxcbiAgICAgIHNwZWN1bGFyOiBuZXcgVEhSRUUuQ29sb3IoJ2dyZXknKSxcbiAgICAgIHNoaW5pbmVzczogMTBcbiAgICB9LFxuICAgIHRleHR1cmVzOiB7XG4gICAgICBtYXA6ICdodHRwczovL3MzLXVzLXdlc3QtMi5hbWF6b25hd3MuY29tL3MuY2Rwbi5pby8xNDEyMjgvZWFydGhtYXAxay5qcGcnLFxuICAgICAgYnVtcE1hcDogJ2h0dHBzOi8vczMtdXMtd2VzdC0yLmFtYXpvbmF3cy5jb20vcy5jZHBuLmlvLzE0MTIyOC9lYXJ0aGJ1bXAxay5qcGcnLFxuICAgICAgc3BlY3VsYXJNYXA6ICdodHRwczovL3MzLXVzLXdlc3QtMi5hbWF6b25hd3MuY29tL3MuY2Rwbi5pby8xNDEyMjgvZWFydGhzcGVjMWsuanBnJ1xuICAgIH1cbiAgfSxcbiAgYXRtb3NwaGVyZToge1xuICAgIHNpemU6IDAuMDAzLFxuICAgIG1hdGVyaWFsOiB7XG4gICAgICBvcGFjaXR5OiAwLjhcbiAgICB9LFxuICAgIHRleHR1cmVzOiB7XG4gICAgICBtYXA6ICdodHRwczovL3MzLXVzLXdlc3QtMi5hbWF6b25hd3MuY29tL3MuY2Rwbi5pby8xNDEyMjgvZWFydGhjbG91ZG1hcC5qcGcnLFxuICAgICAgYWxwaGFNYXA6ICdodHRwczovL3MzLXVzLXdlc3QtMi5hbWF6b25hd3MuY29tL3MuY2Rwbi5pby8xNDEyMjgvZWFydGhjbG91ZG1hcHRyYW5zLmpwZydcbiAgICB9LFxuICAgIGdsb3c6IHtcbiAgICAgIHNpemU6IDAuMDIsXG4gICAgICBpbnRlbnNpdHk6IDAuNyxcbiAgICAgIGZhZGU6IDcsXG4gICAgICBjb2xvcjogMHg5M2NmZWZcbiAgICB9XG4gIH0sXG59KTtcblxuLy8gTWFya2VyIFByb3RvXG5sZXQgbWFya2VyUHJvdG8gPSB7XG4gIGxhdExvbmdUb1ZlY3RvcjM6IGZ1bmN0aW9uIGxhdExvbmdUb1ZlY3RvcjMobGF0aXR1ZGUsIGxvbmdpdHVkZSwgcmFkaXVzLCBoZWlnaHQpIHtcbiAgICB2YXIgcGhpID0gKGxhdGl0dWRlKSpNYXRoLlBJLzE4MDtcbiAgICB2YXIgdGhldGEgPSAobG9uZ2l0dWRlLTE4MCkqTWF0aC5QSS8xODA7XG5cbiAgICB2YXIgeCA9IC0ocmFkaXVzK2hlaWdodCkgKiBNYXRoLmNvcyhwaGkpICogTWF0aC5jb3ModGhldGEpO1xuICAgIHZhciB5ID0gKHJhZGl1cytoZWlnaHQpICogTWF0aC5zaW4ocGhpKTtcbiAgICB2YXIgeiA9IChyYWRpdXMraGVpZ2h0KSAqIE1hdGguY29zKHBoaSkgKiBNYXRoLnNpbih0aGV0YSk7XG5cbiAgICByZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjMoeCx5LHopO1xuICB9LFxuICBtYXJrZXI6IGZ1bmN0aW9uIG1hcmtlcihzaXplLCBjb2xvciwgdmVjdG9yM1Bvc2l0aW9uKSB7XG4gICAgbGV0IG1hcmtlckdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHNpemUpO1xuICAgIGxldCBtYXJrZXJNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtcbiAgICAgIGNvbG9yOiBjb2xvclxuICAgIH0pO1xuICAgIGxldCBtYXJrZXJNZXNoID0gbmV3IFRIUkVFLk1lc2gobWFya2VyR2VvbWV0cnksIG1hcmtlck1hdGVyaWFsKTtcbiAgICBtYXJrZXJNZXNoLnBvc2l0aW9uLmNvcHkodmVjdG9yM1Bvc2l0aW9uKTtcbiAgICBcbiAgICByZXR1cm4gbWFya2VyTWVzaDtcbiAgfVxufVxuXG4vLyBQbGFjZSBNYXJrZXJcbmxldCBwbGFjZU1hcmtlciA9IGZ1bmN0aW9uKG9iamVjdCwgb3B0aW9ucykge1xuICBsZXQgcG9zaXRpb24gPSBtYXJrZXJQcm90by5sYXRMb25nVG9WZWN0b3IzKG9wdGlvbnMubGF0aXR1ZGUsIG9wdGlvbnMubG9uZ2l0dWRlLCBvcHRpb25zLnJhZGl1cywgb3B0aW9ucy5oZWlnaHQpO1xuICBsZXQgbWFya2VyID0gbWFya2VyUHJvdG8ubWFya2VyKG9wdGlvbnMuc2l6ZSwgb3B0aW9ucy5jb2xvciwgcG9zaXRpb24pO1xuICBvYmplY3QuYWRkKG1hcmtlcik7XG59XG5cbi8vIFBsYWNlIE1hcmtlciBBdCBBZGRyZXNzXG5sZXQgcGxhY2VNYXJrZXJBdEFkZHJlc3MgPSBmdW5jdGlvbihhZGRyZXNzLCBjb2xvcikge1xuICBsZXQgZW5jb2RlZExvY2F0aW9uID0gYWRkcmVzcy5yZXBsYWNlKC9cXHMvZywgJysnKTtcbiAgbGV0IGh0dHBSZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIFxuICBodHRwUmVxdWVzdC5vcGVuKCdHRVQnLCAnaHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2dlb2NvZGUvanNvbj9hZGRyZXNzPScgKyBlbmNvZGVkTG9jYXRpb24pO1xuICBodHRwUmVxdWVzdC5zZW5kKG51bGwpO1xuICBodHRwUmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoaHR0cFJlcXVlc3QucmVhZHlTdGF0ZSA9PSA0ICYmIGh0dHBSZXF1ZXN0LnN0YXR1cyA9PSAyMDApIHtcbiAgICAgIGxldCByZXN1bHQgPSBKU09OLnBhcnNlKGh0dHBSZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG4gICAgICBcbiAgICAgIGlmIChyZXN1bHQucmVzdWx0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxldCBsYXRpdHVkZSA9IHJlc3VsdC5yZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uLmxhdDtcbiAgICAgICAgbGV0IGxvbmdpdHVkZSA9IHJlc3VsdC5yZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uLmxuZztcblxuICAgICAgICBwbGFjZU1hcmtlcihlYXJ0aC5nZXRPYmplY3RCeU5hbWUoJ3N1cmZhY2UnKSx7XG4gICAgICAgICAgbGF0aXR1ZGU6IGxhdGl0dWRlLFxuICAgICAgICAgIGxvbmdpdHVkZTogbG9uZ2l0dWRlLFxuICAgICAgICAgIHJhZGl1czogMC41LFxuICAgICAgICAgIGhlaWdodDogMCxcbiAgICAgICAgICBzaXplOiAwLjAxLFxuICAgICAgICAgIGNvbG9yOiBjb2xvcixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG4vLyBHYWxheHlcbmxldCBnYWxheHlHZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgxMDAsIDMyLCAzMik7XG5sZXQgZ2FsYXh5TWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICBzaWRlOiBUSFJFRS5CYWNrU2lkZVxufSk7XG5sZXQgZ2FsYXh5ID0gbmV3IFRIUkVFLk1lc2goZ2FsYXh5R2VvbWV0cnksIGdhbGF4eU1hdGVyaWFsKTtcblxuLy8gTG9hZCBHYWxheHkgVGV4dHVyZXNcbnRleHR1cmVMb2FkZXIuY3Jvc3NPcmlnaW4gPSB0cnVlO1xudGV4dHVyZUxvYWRlci5sb2FkKFxuICAnaHR0cHM6Ly9zMy11cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9zLmNkcG4uaW8vMTQxMjI4L3N0YXJmaWVsZC5wbmcnLFxuICBmdW5jdGlvbih0ZXh0dXJlKSB7XG4gICAgZ2FsYXh5TWF0ZXJpYWwubWFwID0gdGV4dHVyZTtcbiAgICBzY2VuZS5hZGQoZ2FsYXh5KTtcbiAgfVxuKTtcblxuLy8gU2NlbmUsIENhbWVyYSwgUmVuZGVyZXIgQ29uZmlndXJhdGlvblxucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cbmNhbWVyYS5wb3NpdGlvbi5zZXQoMSwxLDEpO1xub3JiaXRDb250cm9scy5lbmFibGVkID0gIWNhbWVyYUF1dG9Sb3RhdGlvbjtcblxuc2NlbmUuYWRkKGNhbWVyYSk7XG5zY2VuZS5hZGQoc3BvdExpZ2h0KTtcbnNjZW5lLmFkZChlYXJ0aCk7XG5cbi8vIExpZ2h0IENvbmZpZ3VyYXRpb25zXG5zcG90TGlnaHQucG9zaXRpb24uc2V0KDIsIDAsIDEpO1xuXG4vLyBNZXNoIENvbmZpZ3VyYXRpb25zXG5lYXJ0aC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbmVhcnRoLmNhc3RTaGFkb3cgPSB0cnVlO1xuZWFydGguZ2V0T2JqZWN0QnlOYW1lKCdzdXJmYWNlJykuZ2VvbWV0cnkuY2VudGVyKCk7XG5cbi8vIE9uIHdpbmRvdyByZXNpemUsIGFkanVzdCBjYW1lcmEgYXNwZWN0IHJhdGlvIGFuZCByZW5kZXJlciBzaXplXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZnVuY3Rpb24oKSB7XG4gIGNhbWVyYS5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcbiAgY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbn0pO1xuXG4vLyBNYWluIHJlbmRlciBmdW5jdGlvblxubGV0IHJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICBlYXJ0aC5nZXRPYmplY3RCeU5hbWUoJ3N1cmZhY2UnKS5yb3RhdGlvbi55ICs9IDEvMzIgKiAwLjAxO1xuICBlYXJ0aC5nZXRPYmplY3RCeU5hbWUoJ2F0bW9zcGhlcmUnKS5yb3RhdGlvbi55ICs9IDEvMTYgKiAwLjAxO1xuICBpZiAoY2FtZXJhQXV0b1JvdGF0aW9uKSB7XG4gICAgY2FtZXJhUm90YXRpb24gKz0gY2FtZXJhUm90YXRpb25TcGVlZDtcbiAgICBjYW1lcmEucG9zaXRpb24ueSA9IDA7XG4gICAgY2FtZXJhLnBvc2l0aW9uLnggPSAyICogTWF0aC5zaW4oY2FtZXJhUm90YXRpb24pO1xuICAgIGNhbWVyYS5wb3NpdGlvbi56ID0gMiAqIE1hdGguY29zKGNhbWVyYVJvdGF0aW9uKTtcbiAgICBjYW1lcmEubG9va0F0KGVhcnRoLnBvc2l0aW9uKTtcbiAgfVxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbiAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xufTtcblxucmVuZGVyKCk7XG5cbi8vIGRhdC5ndWlcbnZhciBndWkgPSBuZXcgZGF0LkdVSSgpO1xudmFyIGd1aUNhbWVyYSA9IGd1aS5hZGRGb2xkZXIoJ0NhbWVyYScpO1xudmFyIGd1aVN1cmZhY2UgPSBndWkuYWRkRm9sZGVyKCdTdXJmYWNlJyk7XG52YXIgZ3VpTWFya2VycyA9IGd1aVN1cmZhY2UuYWRkRm9sZGVyKCdNYXJrZXJzJyk7XG52YXIgZ3VpQXRtb3NwaGVyZSA9IGd1aS5hZGRGb2xkZXIoJ0F0bW9zcGhlcmUnKTtcbnZhciBndWlBdG1vc3BoZXJpY0dsb3cgPSBndWlBdG1vc3BoZXJlLmFkZEZvbGRlcignR2xvdycpO1xuXG4vLyBkYXQuZ3VpIGNvbnRyb2xzIG9iamVjdFxudmFyIGNhbWVyYUNvbnRyb2xzID0gbmV3IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNwZWVkID0gY2FtZXJhUm90YXRpb25TcGVlZDtcbiAgdGhpcy5vcmJpdENvbnRyb2xzID0gIWNhbWVyYUF1dG9Sb3RhdGlvbjtcbn1cblxudmFyIHN1cmZhY2VDb250cm9scyA9IG5ldyBmdW5jdGlvbigpIHtcbiAgdGhpcy5yb3RhdGlvbiA9IDA7XG4gIHRoaXMuYnVtcFNjYWxlID0gMC4wNTtcbiAgdGhpcy5zaGluaW5lc3MgPSAxMDtcbn1cblxudmFyIG1hcmtlcnNDb250cm9scyA9IG5ldyBmdW5jdGlvbigpIHtcbiAgdGhpcy5hZGRyZXNzID0gJyc7XG4gIHRoaXMuY29sb3IgPSAweGZmMDAwMDtcbiAgdGhpcy5wbGFjZU1hcmtlcj0gZnVuY3Rpb24oKSB7XG4gICAgcGxhY2VNYXJrZXJBdEFkZHJlc3ModGhpcy5hZGRyZXNzLCB0aGlzLmNvbG9yKTtcbiAgfVxufVxuXG52YXIgYXRtb3NwaGVyZUNvbnRyb2xzID0gbmV3IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9wYWNpdHkgPSAwLjg7XG59XG5cbnZhciBhdG1vc3BoZXJpY0dsb3dDb250cm9scyA9IG5ldyBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbnRlbnNpdHkgPSAwLjc7XG4gIHRoaXMuZmFkZSA9IDc7XG4gIHRoaXMuY29sb3IgPSAweDkzY2ZlZjtcbn1cblxuLy8gZGF0Lmd1aSBjb250cm9sc1xuZ3VpQ2FtZXJhLmFkZChjYW1lcmFDb250cm9scywgJ3NwZWVkJywgMCwgMC4xKS5zdGVwKDAuMDAxKS5vbkNoYW5nZShmdW5jdGlvbih2YWx1ZSkge1xuICBjYW1lcmFSb3RhdGlvblNwZWVkID0gdmFsdWU7XG59KTtcbmd1aUNhbWVyYS5hZGQoY2FtZXJhQ29udHJvbHMsICdvcmJpdENvbnRyb2xzJykub25DaGFuZ2UoZnVuY3Rpb24odmFsdWUpIHtcbiAgY2FtZXJhQXV0b1JvdGF0aW9uID0gIXZhbHVlO1xuICBvcmJpdENvbnRyb2xzLmVuYWJsZWQgPSB2YWx1ZTtcbn0pO1xuXG5ndWlTdXJmYWNlLmFkZChzdXJmYWNlQ29udHJvbHMsICdyb3RhdGlvbicsIDAsIDYpLm9uQ2hhbmdlKGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGVhcnRoLmdldE9iamVjdEJ5TmFtZSgnc3VyZmFjZScpLnJvdGF0aW9uLnkgPSB2YWx1ZTtcbn0pO1xuZ3VpU3VyZmFjZS5hZGQoc3VyZmFjZUNvbnRyb2xzLCAnYnVtcFNjYWxlJywgMCwgMSkuc3RlcCgwLjAxKS5vbkNoYW5nZShmdW5jdGlvbih2YWx1ZSkge1xuICBlYXJ0aC5nZXRPYmplY3RCeU5hbWUoJ3N1cmZhY2UnKS5tYXRlcmlhbC5idW1wU2NhbGUgPSB2YWx1ZTtcbn0pO1xuZ3VpU3VyZmFjZS5hZGQoc3VyZmFjZUNvbnRyb2xzLCAnc2hpbmluZXNzJywgMCwgMzApLm9uQ2hhbmdlKGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGVhcnRoLmdldE9iamVjdEJ5TmFtZSgnc3VyZmFjZScpLm1hdGVyaWFsLnNoaW5pbmVzcyA9IHZhbHVlO1xufSk7XG5cbmd1aU1hcmtlcnMuYWRkKG1hcmtlcnNDb250cm9scywgJ2FkZHJlc3MnKTtcbmd1aU1hcmtlcnMuYWRkQ29sb3IobWFya2Vyc0NvbnRyb2xzLCAnY29sb3InKTtcbmd1aU1hcmtlcnMuYWRkKG1hcmtlcnNDb250cm9scywgJ3BsYWNlTWFya2VyJyk7XG5cbmd1aUF0bW9zcGhlcmUuYWRkKGF0bW9zcGhlcmVDb250cm9scywgJ29wYWNpdHknLCAwLCAxKS5vbkNoYW5nZShmdW5jdGlvbih2YWx1ZSkge1xuICBlYXJ0aC5nZXRPYmplY3RCeU5hbWUoJ2F0bW9zcGhlcmUnKS5tYXRlcmlhbC5vcGFjaXR5ID0gdmFsdWU7XG59KTtcblxuZ3VpQXRtb3NwaGVyaWNHbG93LmFkZChhdG1vc3BoZXJpY0dsb3dDb250cm9scywgJ2ludGVuc2l0eScsIDAsIDEpLm9uQ2hhbmdlKGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGVhcnRoLmdldE9iamVjdEJ5TmFtZSgnYXRtb3NwaGVyaWNHbG93JykubWF0ZXJpYWwudW5pZm9ybXNbJ2MnXS52YWx1ZSA9IHZhbHVlO1xufSk7XG5ndWlBdG1vc3BoZXJpY0dsb3cuYWRkKGF0bW9zcGhlcmljR2xvd0NvbnRyb2xzLCAnZmFkZScsIDAsIDUwKS5vbkNoYW5nZShmdW5jdGlvbih2YWx1ZSkge1xuICBlYXJ0aC5nZXRPYmplY3RCeU5hbWUoJ2F0bW9zcGhlcmljR2xvdycpLm1hdGVyaWFsLnVuaWZvcm1zWydwJ10udmFsdWUgPSB2YWx1ZTtcbn0pO1xuZ3VpQXRtb3NwaGVyaWNHbG93LmFkZENvbG9yKGF0bW9zcGhlcmljR2xvd0NvbnRyb2xzLCAnY29sb3InKS5vbkNoYW5nZShmdW5jdGlvbih2YWx1ZSkge1xuICBlYXJ0aC5nZXRPYmplY3RCeU5hbWUoJ2F0bW9zcGhlcmljR2xvdycpLm1hdGVyaWFsLnVuaWZvcm1zLmdsb3dDb2xvci52YWx1ZS5zZXRIZXgodmFsdWUpO1xufSk7Il19

/***/ }
/******/ ]);