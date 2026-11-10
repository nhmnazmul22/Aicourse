import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

const root = document.querySelector("#game-root");
const overlay = document.querySelector("#game-overlay");
const startButton = document.querySelector("#start-button");
const overlayTitle = document.querySelector("#overlay-title");
const overlayCopy = document.querySelector("#overlay-copy");
const overlayKicker = document.querySelector("#overlay-kicker");
const startButtonLabel = document.querySelector("#start-button-label");
const playerHealthBar = document.querySelector("#player-health-bar");
const enemyHealthBar = document.querySelector("#enemy-health-bar");
const opponentHealthBar = document.querySelector("#opponent-health-bar");
const playerHealthText = document.querySelector("#player-health");
const enemyHealthText = document.querySelector("#enemy-health");
const hitCountText = document.querySelector("#hit-count");
const targetDistanceText = document.querySelector("#target-distance");
const hitMarker = document.querySelector("#hit-marker");

const scene = new THREE.Scene();
scene.background = new THREE.Color("#263337");
scene.fog = new THREE.Fog("#263337", 15, 42);

const camera = new THREE.PerspectiveCamera(73, 1, 0.1, 90);
camera.position.set(0, 1.65, 6);
scene.add(camera);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  root.appendChild(renderer.domElement);
} catch (error) {
  console.error("WebGL renderer could not be initialized.", error);
  overlayTitle.textContent = "WEBGL REQUIRED";
  overlayCopy.textContent = "This arena needs WebGL. Enable hardware acceleration or try a browser that supports it.";
  overlayKicker.textContent = "GRAPHICS UNAVAILABLE";
  startButton.hidden = true;
  document.querySelector(".game-hud").hidden = true;
  document.querySelector(".overlay-footnote").hidden = true;
  document.querySelector(".game-caption > span:first-child").textContent = "RENDERER OFFLINE";
}

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const arenaLimit = 12.1;
const player = { health: 100, yaw: 0, speed: 5.3, shootCooldown: 0, invulnerable: 0, hits: 0 };
const enemy = { health: 100, position: new THREE.Vector3(0, 0, -6), shootCooldown: 1.5, strafe: 1, flash: 0 };
const keys = new Set();
const effects = [];
let running = false;
let gameOver = false;
let elapsed = 0;
let hitMarkerTimeout;

const materials = {
  floor: new THREE.MeshStandardMaterial({ color: "#46504a", roughness: 0.93 }),
  wall: new THREE.MeshStandardMaterial({ color: "#354244", roughness: 0.86 }),
  trim: new THREE.MeshStandardMaterial({ color: "#728176", roughness: 0.63, metalness: 0.2 }),
  dark: new THREE.MeshStandardMaterial({ color: "#222d2f", roughness: 0.82 }),
  teal: new THREE.MeshStandardMaterial({ color: "#78d8b8", emissive: "#286b56", emissiveIntensity: 0.5, roughness: 0.42 }),
  orange: new THREE.MeshStandardMaterial({ color: "#db8050", emissive: "#642815", emissiveIntensity: 0.35, roughness: 0.48 }),
  playerBolt: new THREE.MeshBasicMaterial({ color: "#a8ffe1" }),
  enemyBolt: new THREE.MeshBasicMaterial({ color: "#ff9761" }),
};

scene.add(new THREE.HemisphereLight("#b5c9c0", "#303638", 1.7));
const keyLight = new THREE.DirectionalLight("#f0d7b4", 2.4);
keyLight.position.set(-5, 12, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.left = -17;
keyLight.shadow.camera.right = 17;
keyLight.shadow.camera.top = 17;
keyLight.shadow.camera.bottom = -17;
scene.add(keyLight);

const arenaLight = new THREE.PointLight("#79d7b4", 38, 17, 2);
arenaLight.position.set(0, 7, 0);
scene.add(arenaLight);

function box(parent, size, position, material, castShadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function buildArena() {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), materials.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(28, 28, "#64756d", "#53615b");
  grid.position.y = 0.012;
  grid.material.transparent = true;
  grid.material.opacity = 0.29;
  scene.add(grid);

  box(scene, [28, 5, 0.8], [0, 2.5, -14], materials.wall);
  box(scene, [28, 5, 0.8], [0, 2.5, 14], materials.wall);
  box(scene, [0.8, 5, 28], [-14, 2.5, 0], materials.wall);
  box(scene, [0.8, 5, 28], [14, 2.5, 0], materials.wall);
  for (const z of [-14, 14]) box(scene, [28, 0.13, 0.9], [0, 4.65, z], materials.trim, false);
  for (const x of [-14, 14]) box(scene, [0.9, 0.13, 28], [x, 4.65, 0], materials.trim, false);

  const pillarPositions = [
    [-7, -7], [7, -7], [-7, 7], [7, 7],
    [0, -10], [0, 10], [-10, 0], [10, 0],
  ];
  for (const [x, z] of pillarPositions) {
    box(scene, [1.25, 3.2, 1.25], [x, 1.6, z], materials.dark);
    box(scene, [1.42, 0.18, 1.42], [x, 3.1, z], materials.trim);
    box(scene, [0.09, 2.05, 0.09], [x, 1.6, z + 0.64], materials.teal, false);
  }

  for (let x = -10; x <= 10; x += 5) {
    box(scene, [0.05, 2.7, 0.05], [x, 1.35, -13.56], materials.teal, false);
    box(scene, [0.05, 2.7, 0.05], [x, 1.35, 13.56], materials.teal, false);
  }

  const spawnPad = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.04, 32), materials.dark);
  spawnPad.position.set(0, 0.025, -6);
  scene.add(spawnPad);
  const padRing = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.035, 8, 48), materials.orange);
  padRing.rotation.x = Math.PI / 2;
  padRing.position.set(0, 0.07, -6);
  scene.add(padRing);

  const ceilingBars = new THREE.Group();
  for (let z = -10; z <= 10; z += 5) {
    box(ceilingBars, [28, 0.1, 0.12], [0, 5.2, z], materials.dark, false);
  }
  scene.add(ceilingBars);
}

function buildEnemy() {
  const group = new THREE.Group();
  const core = new THREE.Group();
  group.add(core);
  box(core, [0.82, 1.05, 0.52], [0, 1.38, 0], materials.orange);

  const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.44, 0.08), materials.dark);
  chestPlate.position.set(0, 1.48, 0.29);
  core.add(chestPlate);
  const eye = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.07, 0.04), materials.teal);
  eye.position.set(0, 2.06, 0.3);
  core.add(eye);
  box(core, [0.58, 0.48, 0.5], [0, 2.06, 0], materials.trim);
  box(core, [0.25, 0.12, 0.54], [0, 1.98, 0.06], materials.dark);
  box(core, [0.22, 0.8, 0.24], [-0.56, 1.43, 0], materials.dark);
  box(core, [0.22, 0.8, 0.24], [0.56, 1.43, 0], materials.dark);
  box(core, [0.3, 0.65, 0.32], [-0.24, 0.52, 0], materials.trim);
  box(core, [0.3, 0.65, 0.32], [0.24, 0.52, 0], materials.trim);
  box(core, [0.74, 0.13, 0.57], [0, 0.12, 0.06], materials.dark);
  const shoulder = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.22, 0.48), materials.orange);
  shoulder.position.set(0, 1.78, 0);
  core.add(shoulder);

  group.position.copy(enemy.position);
  group.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  scene.add(group);
  enemy.group = group;
  enemy.core = core;
  enemy.hitMeshes = [];
  core.traverse((object) => { if (object.isMesh) enemy.hitMeshes.push(object); });
}

function resize() {
  if (!renderer) return;
  const { width, height } = root.getBoundingClientRect();
  if (!width || !height) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function updateHud() {
  playerHealthText.textContent = String(Math.ceil(player.health));
  enemyHealthText.textContent = String(Math.ceil(enemy.health));
  playerHealthBar.style.width = `${player.health}%`;
  enemyHealthBar.style.width = `${enemy.health}%`;
  opponentHealthBar.style.width = `${enemy.health}%`;
  hitCountText.textContent = String(player.hits).padStart(2, "0");
  if (enemy.group.visible) {
    const distance = camera.position.distanceTo(enemy.group.position);
    targetDistanceText.textContent = `${distance.toFixed(1)}M TO TARGET`;
  } else {
    targetDistanceText.textContent = "TARGET DOWN";
  }
}

function showHitMarker() {
  hitMarker.classList.add("visible");
  clearTimeout(hitMarkerTimeout);
  hitMarkerTimeout = setTimeout(() => hitMarker.classList.remove("visible"), 110);
}

function addBolt(start, end, material, speed, damage, target) {
  const direction = end.clone().sub(start).normalize();
  const bolt = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), material);
  bolt.position.copy(start);
  scene.add(bolt);
  effects.push({ mesh: bolt, direction, speed, damage, target, life: 2.1 });
}

function shoot() {
  if (!running || gameOver || player.shootCooldown > 0) return;
  player.shootCooldown = 0.24;

  const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  raycaster.set(camera.position, direction);
  raycaster.far = 35;
  const hits = enemy.group.visible ? raycaster.intersectObjects(enemy.hitMeshes, false) : [];
  const hit = hits[0];
  const end = hit ? hit.point : camera.position.clone().addScaledVector(direction, 22);
  const muzzle = camera.position.clone().addScaledVector(direction, 0.48);
  addBolt(muzzle, end, materials.playerBolt, 36, 0, enemy);

  if (hit && enemy.health > 0) {
    enemy.health = Math.max(0, enemy.health - 20);
    enemy.flash = 0.12;
    player.hits += 1;
    showHitMarker();
    if (enemy.health === 0) finishGame(true);
    updateHud();
  }
}

function enemyFire() {
  if (!enemy.group.visible || enemy.health <= 0) return;
  const origin = enemy.group.position.clone().add(new THREE.Vector3(0, 1.35, 0));
  const target = camera.position.clone();
  target.y -= 0.25;
  addBolt(origin, target, materials.enemyBolt, 7.6, 13, "player");
}

function updatePlayer(delta) {
  if (keys.has("ArrowLeft")) player.yaw += 1.8 * delta;
  if (keys.has("ArrowRight")) player.yaw -= 1.8 * delta;
  const forward = Number(keys.has("ArrowUp")) - Number(keys.has("ArrowDown"));
  if (forward) {
    const movement = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
    camera.position.addScaledVector(movement, forward * player.speed * delta);
  }
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -arenaLimit, arenaLimit);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -arenaLimit, arenaLimit);
  camera.rotation.set(0, player.yaw, 0, "YXZ");

  player.shootCooldown = Math.max(0, player.shootCooldown - delta);
  player.invulnerable = Math.max(0, player.invulnerable - delta);
  if (keys.has(" ") && player.shootCooldown === 0) shoot();
}

function updateEnemy(delta) {
  if (!enemy.group.visible) return;
  const toPlayer = camera.position.clone().sub(enemy.group.position);
  toPlayer.y = 0;
  const distance = toPlayer.length();
  const direction = toPlayer.normalize();
  if (distance > 4.7) {
    enemy.group.position.addScaledVector(direction, 1.55 * delta);
  } else if (distance < 3.2) {
    enemy.group.position.addScaledVector(direction, -0.8 * delta);
  }

  const strafeDirection = new THREE.Vector3(-direction.z, 0, direction.x);
  enemy.group.position.addScaledVector(strafeDirection, enemy.strafe * 0.35 * delta);
  enemy.group.position.x = THREE.MathUtils.clamp(enemy.group.position.x, -10.6, 10.6);
  enemy.group.position.z = THREE.MathUtils.clamp(enemy.group.position.z, -10.6, 10.6);
  enemy.group.rotation.y = Math.atan2(camera.position.x - enemy.group.position.x, camera.position.z - enemy.group.position.z);
  enemy.core.position.y = Math.sin(elapsed * 3.2) * 0.045;
  enemy.shootCooldown -= delta;
  enemy.flash = Math.max(0, enemy.flash - delta);
  enemy.core.scale.setScalar(enemy.flash > 0 ? 1.04 : 1);

  if (enemy.shootCooldown <= 0) {
    enemyFire();
    enemy.shootCooldown = Math.max(0.75, 1.55 - (100 - enemy.health) * 0.004) + Math.random() * 0.55;
    enemy.strafe *= -1;
  }
}

function updateEffects(delta) {
  for (let index = effects.length - 1; index >= 0; index -= 1) {
    const effect = effects[index];
    effect.life -= delta;
    effect.mesh.position.addScaledVector(effect.direction, effect.speed * delta);
    if (effect.target === "player" && effect.life > 0 && player.invulnerable <= 0) {
      const playerCenter = camera.position.clone();
      playerCenter.y -= 0.2;
      if (effect.mesh.position.distanceTo(playerCenter) < 0.48) {
        player.health = Math.max(0, player.health - effect.damage);
        player.invulnerable = 0.45;
        effect.life = 0;
        updateHud();
        if (player.health === 0) finishGame(false);
      }
    }
    if (effect.life <= 0) {
      scene.remove(effect.mesh);
      effect.mesh.geometry.dispose();
      effects.splice(index, 1);
    }
  }
}

function finishGame(victory) {
  if (gameOver) return;
  running = false;
  gameOver = true;
  keys.clear();
  overlayTitle.innerHTML = victory ? "TARGET<br /><em>DOWN.</em>" : "YOU'RE<br /><em>DOWN.</em>";
  overlayCopy.textContent = victory
    ? `Warden neutralized in ${player.hits} hits. The arena is clear.`
    : "The Warden got the better of you this time. Get back in there.";
  overlayKicker.textContent = victory ? "SIMULATION COMPLETE" : "VITALS DEPLETED";
  startButtonLabel.textContent = "Run it back";
  overlay.classList.remove("hidden");
}

function startGame() {
  player.health = 100;
  player.yaw = 0;
  player.hits = 0;
  player.shootCooldown = 0;
  player.invulnerable = 0;
  camera.position.set(0, 1.65, 6);
  enemy.health = 100;
  enemy.position.set(0, 0, -6);
  enemy.group.position.copy(enemy.position);
  enemy.group.visible = true;
  enemy.shootCooldown = 1.6;
  enemy.strafe = 1;
  enemy.flash = 0;
  for (const effect of effects) {
    scene.remove(effect.mesh);
    effect.mesh.geometry.dispose();
  }
  effects.length = 0;
  gameOver = false;
  running = true;
  overlay.classList.add("hidden");
  updateHud();
}

function animate() {
  if (!renderer) return;
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  if (running) {
    elapsed += delta;
    updatePlayer(delta);
    updateEnemy(delta);
    updateEffects(delta);
    updateHud();
  }
  renderer.render(scene, camera);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
    keys.add(event.key);
  }
});
window.addEventListener("keyup", (event) => keys.delete(event.key));
window.addEventListener("blur", () => keys.clear());
startButton.addEventListener("click", startGame);
window.addEventListener("resize", resize);

buildArena();
buildEnemy();
resize();
updateHud();
animate();
