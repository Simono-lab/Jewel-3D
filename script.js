const cover = document.getElementById('cover');
const phone = document.getElementById('phone');
const screen = document.getElementById('screen');

function enterApp() {
  cover.style.display = 'none';
  phone.classList.remove('hidden');
  renderHome();
}

function renderHome() {
  screen.innerHTML = `
    <div style="padding:18px;border-radius:20px;background:rgba(255,255,255,.35);border:1px solid rgba(255,255,255,.45)">
      <h2 style="margin:0 0 10px">Home</h2>
      <p style="margin:0;color:#5f6a7a">Interface prête avec scène 3D et HDRI.</p>
    </div>
  `;
}

document.addEventListener('click', e => {
  if (e.target.matches('.start-btn')) enterApp();
});

function makeJewel3D(el) {
  const scene = new THREE.Scene();
  const w = el.clientWidth || 520;
  const h = el.clientHeight || 520;

  const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 100);
  camera.position.z = 4.2;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.innerHTML = '';
  el.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1.0));

  const key = new THREE.DirectionalLight(0xffffff, 2.8);
  key.position.set(3, 4, 5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffccaa, 1.2);
  fill.position.set(-4, -1, 3);
  scene.add(fill);

  const group = new THREE.Group();
  scene.add(group);

  const metalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc98963,
    metalness: 1,
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    sheen: 0.2,
    sheenColor: 0xffe3d1
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x8fbfe8,
    metalness: 0,
    roughness: 0.03,
    transmission: 1,
    thickness: 0.8,
    ior: 1.45,
    transparent: true,
    opacity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0
  });

  const torus1 = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.28, 80, 240), metalMaterial);
  group.add(torus1);

  const torus2 = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.12, 72, 200), metalMaterial);
  torus2.rotation.x = 0.32;
  torus2.rotation.y = 0.14;
  group.add(torus2);

  const torus3 = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.08, 72, 160), metalMaterial);
  torus3.rotation.x = -0.18;
  torus3.rotation.z = 0.42;
  group.add(torus3);

  const core = new THREE.Mesh(new THREE.SphereGeometry(1.08, 96, 96), glassMaterial);
  group.add(core);

  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(1.21, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.04 })
  );
  group.add(shell);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  new THREE.RGBELoader()
    .setDataType(THREE.HalfFloatType)
    .load('assets/hdr/studio.hdr', (texture) => {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = envMap;
      scene.background = envMap;
      texture.dispose();
      pmremGenerator.dispose();
    });

  group.rotation.z = -0.15;
  group.rotation.x = 0.1;

  function animate() {
    group.rotation.y += 0.006;
    group.rotation.x = 0.14 + Math.sin(Date.now() * 0.001) * 0.04;
    group.rotation.z = -0.16 + Math.cos(Date.now() * 0.001) * 0.03;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}

window.addEventListener('load', () => {
  makeJewel3D(document.getElementById('hero3d'));
});
