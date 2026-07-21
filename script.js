import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const hero = document.getElementById('hero3d');
const chips = document.querySelectorAll('[data-view]');
const screenTitle = document.getElementById('screenTitle');
const screenText = document.getElementById('screenText');
const enterBtn = document.getElementById('enterBtn');

const views = {
  home: {
    title: 'Home',
    text: 'Navigation active. The 3D jewel stays visible on the left.'
  },
  media: {
    title: 'Media',
    text: 'Use the 3D controls to inspect the glass and metal reflections.'
  },
  settings: {
    title: 'Settings',
    text: 'Bright studio lighting is enabled for a cleaner, more premium look.'
  }
};

function setActive(view){
  chips.forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
  screenTitle.textContent = views[view].title;
  screenText.textContent = views[view].text;
}

chips.forEach(btn => {
  btn.addEventListener('click', () => setActive(btn.dataset.view));
});

enterBtn.addEventListener('click', () => {
  setActive('settings');
});

function createJewelScene(el) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 5.2);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(el.clientWidth, el.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  el.innerHTML = '';
  el.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 3.6;
  controls.maxDistance = 7;

  const group = new THREE.Group();
  scene.add(group);

  const brightKey = new THREE.DirectionalLight(0xffffff, 3.8);
  brightKey.position.set(4, 5, 6);
  scene.add(brightKey);

  const softFill = new THREE.DirectionalLight(0xffefdb, 1.9);
  softFill.position.set(-5, 2, 3);
  scene.add(softFill);

  const topLight = new THREE.DirectionalLight(0xddeeff, 1.5);
  topLight.position.set(0, 8, 2);
  scene.add(topLight);

  scene.add(new THREE.AmbientLight(0xffffff, 1.55));

  const goldMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd8a15f,
    metalness: 1,
    roughness: 0.10,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.8
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x8cc5f0,
    metalness: 0,
    roughness: 0.02,
    transmission: 1,
    thickness: 1.0,
    ior: 1.42,
    transparent: true,
    opacity: 1,
    envMapIntensity: 1.7
  });

  const outerSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.55, 96, 96),
    goldMaterial
  );
  group.add(outerSphere);

  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(1.25, 0.28, 72, 240),
    goldMaterial
  );
  ringA.rotation.x = 0.35;
  ringA.rotation.z = -0.16;
  group.add(ringA);

  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(1.12, 0.14, 72, 180),
    goldMaterial
  );
  ringB.rotation.x = -0.22;
  ringB.rotation.y = 0.12;
  group.add(ringB);

  const innerGlass = new THREE.Mesh(
    new THREE.SphereGeometry(1.02, 128, 128),
    glassMaterial
  );
  group.add(innerGlass);

  const glossyCap = new THREE.Mesh(
    new THREE.SphereGeometry(1.52, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.06
    })
  );
  group.add(glossyCap);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  new RGBELoader()
    .setDataType(THREE.HalfFloatType)
    .load('assets/hdr/studio.hdr', (texture) => {
      const env = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = env;
      scene.background = null;
      texture.dispose();
      pmremGenerator.dispose();
    }, undefined, () => {
      scene.background = new THREE.Color(0xf1f4f8);
      scene.environment = null;
    });

  group.rotation.x = 0.12;
  group.rotation.y = -0.35;
  group.rotation.z = -0.10;

  function animate(){
    controls.update();
    group.rotation.y += 0.0045;
    group.rotation.x = 0.12 + Math.sin(Date.now() * 0.0007) * 0.03;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    const w = el.clientWidth;
    const h = el.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

createJewelScene(hero);
setActive('home');
