import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const hero = document.getElementById('hero3d');
const panelTitle = document.getElementById('panelTitle');
const panelText = document.getElementById('panelText');
const actionBtn = document.getElementById('actionBtn');

const views = {
  home: ['Home', 'Navigation opérationnelle et design conservé.'],
  media: ['Media', 'La scène 3D reste visible pendant la navigation.'],
  settings: ['Settings', 'Fond lumineux, objet plus clair, interface intacte.']
};

function setView(view){
  document.querySelectorAll('[data-view]').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
  panelTitle.textContent = views[view][0];
  panelText.textContent = views[view][1];
}

document.querySelectorAll('[data-view]').forEach(btn => {
  btn.addEventListener('click', () => setView(btn.dataset.view));
});

actionBtn.addEventListener('click', () => setView('settings'));

function createScene(el){
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 5.5);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(el.clientWidth, el.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.7;
  renderer.setClearColor(0x000000, 0);
  el.innerHTML = '';
  el.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minDistance = 4;
  controls.maxDistance = 8;

  const group = new THREE.Group();
  scene.add(group);

  scene.add(new THREE.AmbientLight(0xffffff, 2.1));

  const key = new THREE.DirectionalLight(0xffffff, 4.2);
  key.position.set(5, 6, 7);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffedda, 2.6);
  fill.position.set(-6, 2, 4);
  scene.add(fill);

  const sky = new THREE.DirectionalLight(0xcfe8ff, 1.8);
  sky.position.set(0, 10, 2);
  scene.add(sky);

  const gold = new THREE.MeshPhysicalMaterial({
    color: 0xd8a15f,
    metalness: 1,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 2
  });

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x8bbbe8,
    metalness: 0,
    roughness: 0.02,
    transmission: 1,
    thickness: 1.15,
    ior: 1.42,
    transparent: true,
    opacity: 1,
    envMapIntensity: 2.2
  });

  const body = new THREE.Mesh(new THREE.SphereGeometry(1.7, 96, 96), gold);
  group.add(body);

  const frame1 = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.30, 72, 240), gold);
  frame1.rotation.x = 0.26;
  frame1.rotation.z = -0.08;
  group.add(frame1);

  const frame2 = new THREE.Mesh(new THREE.TorusGeometry(1.10, 0.12, 72, 180), gold);
  frame2.rotation.x = -0.12;
  frame2.rotation.y = 0.18;
  group.add(frame2);

  const glassCore = new THREE.Mesh(new THREE.SphereGeometry(1.02, 128, 128), glass);
  group.add(glassCore);

  const glassHalo = new THREE.Mesh(
    new THREE.SphereGeometry(1.20, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05 })
  );
  group.add(glassHalo);

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  new RGBELoader()
    .setDataType(THREE.HalfFloatType)
    .load('assets/hdr/studio.hdr', (texture) => {
      const env = pmrem.fromEquirectangular(texture).texture;
      scene.environment = env;
      scene.background = null;
      texture.dispose();
      pmrem.dispose();
    }, undefined, () => {
      scene.background = new THREE.Color(0xf2f5f8);
    });

  group.rotation.x = 0.08;
  group.rotation.y = -0.32;
  group.rotation.z = -0.06;

  function animate(){
    controls.update();
    group.rotation.y += 0.005;
    group.rotation.x = 0.08 + Math.sin(Date.now() * 0.0008) * 0.02;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    renderer.setSize(el.clientWidth, el.clientHeight);
    camera.aspect = el.clientWidth / el.clientHeight;
    camera.updateProjectionMatrix();
  });
}

createScene(hero);
setView('home');
