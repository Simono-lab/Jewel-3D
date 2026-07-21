import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const hero = document.getElementById('hero3d');
const enterBtn = document.getElementById('enterBtn');
const phoneShell = document.getElementById('phoneShell');

enterBtn.addEventListener('click', () => {
  phoneShell.classList.remove('hidden');
  enterBtn.textContent = 'Entered';
  enterBtn.disabled = true;
});

function createScene(el) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(el.clientWidth, el.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.innerHTML = '';
  el.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const metalMat = new THREE.MeshPhysicalMaterial({
    color: 0xc98963,
    metalness: 1,
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.04
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x8fbfe8,
    metalness: 0,
    roughness: 0.03,
    transmission: 1,
    thickness: 0.85,
    ior: 1.45,
    transparent: true,
    opacity: 1
  });

  const torusMain = new THREE.Mesh(
    new THREE.TorusGeometry(1.38, 0.30, 96, 240),
    metalMat
  );
  group.add(torusMain);

  const torusInner = new THREE.Mesh(
    new THREE.TorusGeometry(1.20, 0.11, 64, 180),
    metalMat
  );
  torusInner.rotation.z = 0.12;
  torusInner.rotation.x = 0.3;
  group.add(torusInner);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1.02, 96, 96),
    glassMat
  );
  group.add(core);

  const faintShell = new THREE.Mesh(
    new THREE.SphereGeometry(1.16, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.03
    })
  );
  group.add(faintShell);

  const ambient = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(3, 4, 5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xffd0b0, 1.4);
  rim.position.set(-4, 1, 2);
  scene.add(rim);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  new RGBELoader()
    .setDataType(THREE.HalfFloatType)
    .load('assets/hdr/studio.hdr', (texture) => {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = envMap;
      scene.background = null;
      texture.dispose();
      pmremGenerator.dispose();
    });

  group.rotation.x = 0.12;
  group.rotation.z = -0.16;

  function animate() {
    group.rotation.y += 0.006;
    group.rotation.x = 0.12 + Math.sin(Date.now() * 0.001) * 0.03;
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
