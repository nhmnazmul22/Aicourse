import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

const $ = (selector) => document.querySelector(selector);
const root = $("#game-root");
const overlay = $("#game-overlay");
const setupModal = $("#setup-modal");
const levelSelect = $("#level-select");
const minimap = $("#minimap");
const mapContext = minimap.getContext("2d");
const ui = {
  start: $("#start-button"),
  deploy: $("#deploy-button"),
  title: $("#overlay-title"),
  copy: $("#overlay-copy"),
  kicker: $("#overlay-kicker"),
  startLabel: $("#start-button-label"),
  playerHp: $("#player-health"),
  playerBar: $("#player-health-bar"),
  enemyHp: $("#enemy-health"),
  enemyBar: $("#enemy-health-bar"),
  hitCount: $("#hit-count"),
  level: $("#level-readout"),
  enemyLabel: $("#enemy-label"),
  weapon: $("#weapon-level"),
  hitMarker: $("#hit-marker"),
  weaponView: $("#weapon"),
};

const scene = new THREE.Scene();
scene.background = new THREE.Color("#899b83");
scene.fog = new THREE.Fog("#899b83", 17, 43);
const camera = new THREE.PerspectiveCamera(76, 1, 0.1, 90);
camera.position.set(0, 1.65, 7);
scene.add(camera);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
root.appendChild(renderer.domElement);

const materials = {
  ground: new THREE.MeshStandardMaterial({ color: "#526344", roughness: 1 }),
  bark: new THREE.MeshStandardMaterial({ color: "#493b2d", roughness: 1 }),
  leaf: ["#294c38", "#365d3f", "#496a43", "#58764b"].map(
    (color) => new THREE.MeshStandardMaterial({ color, roughness: 1 }),
  ),
  rock: new THREE.MeshStandardMaterial({ color: "#62695b", roughness: 1 }),
  enemy: ["#a8583d", "#667c43", "#496979", "#726641", "#754952"].map(
    (color) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.7,
        metalness: 0.12,
      }),
  ),
  dark: new THREE.MeshStandardMaterial({
    color: "#292e2b",
    roughness: 0.8,
    metalness: 0.25,
  }),
  skin: new THREE.MeshStandardMaterial({ color: "#c58b64", roughness: 0.78 }),
  playerBolt: new THREE.MeshBasicMaterial({ color: "#b9ffdf" }),
  enemyBolt: new THREE.MeshBasicMaterial({ color: "#ffad72" }),
};
scene.add(new THREE.HemisphereLight("#dce8cd", "#384133", 1.75));
const sun = new THREE.DirectionalLight("#ffe1b4", 2.25);
sun.position.set(-8, 15, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = sun.shadow.camera.bottom = -19;
sun.shadow.camera.right = sun.shadow.camera.top = 19;
scene.add(sun);

const box = (parent, size, position, material, cast = true) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};

class Combatant {
  constructor(game, { position, health, damage, type, boss = false }) {
    this.game = game;
    this.type = type;
    this.boss = boss;
    this.maxHealth = health;
    this.health = health;
    this.damage = damage;
    this.position = new THREE.Vector3(...position);
    this.cooldown = 1 + Math.random();
    this.strafe = Math.random() > 0.5 ? 1 : -1;
    this.flash = 0;
    this.alive = true;
    this.group = this.makeModel();
    this.group.position.copy(this.position);
    this.group.scale.setScalar(
      boss ? 1.52 : type === "scout" ? 0.78 : type === "brute" ? 1.2 : 1,
    );
    this.hitMeshes = [];
    this.group.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        this.hitMeshes.push(child);
      }
    });
    scene.add(this.group);
  }
  makeModel() {
    const group = new THREE.Group();
    const suit =
      materials.enemy[
        this.type === "scout"
          ? 1
          : this.type === "ranger"
            ? 2
            : this.type === "brute"
              ? 3
              : this.boss
                ? 4
                : 0
      ];
    const torso = new THREE.Group();
    group.add(torso);
    box(torso, [0.78, 0.88, 0.42], [0, 1.33, 0], suit);
    box(torso, [0.53, 0.48, 0.08], [0, 1.36, 0.24], materials.dark);
    const face = box(torso, [0.42, 0.47, 0.4], [0, 2.08, 0], materials.skin);
    box(torso, [0.5, 0.13, 0.44], [0, 2.32, 0], materials.dark);
    box(
      torso,
      [0.13, 0.09, 0.025],
      [0, 2.08, 0.205],
      new THREE.MeshBasicMaterial({ color: this.boss ? "#ff562f" : "#d9f19c" }),
      false,
    );
    box(torso, [0.22, 0.77, 0.24], [-0.54, 1.43, 0], suit);
    box(torso, [0.22, 0.77, 0.24], [0.54, 1.43, 0], suit);
    box(torso, [0.3, 0.68, 0.3], [-0.23, 0.5, 0], materials.dark);
    box(torso, [0.3, 0.68, 0.3], [0.23, 0.5, 0], materials.dark);
    box(torso, [0.73, 0.14, 0.52], [0, 0.12, 0], materials.dark);
    if (this.type === "ranger" || this.boss)
      box(torso, [0.8, 0.12, 0.12], [0.4, 1.43, 0.14], materials.dark);
    return group;
  }
  update(dt) {
    if (!this.alive) return;
    const toward = this.game.player.position.clone().sub(this.group.position);
    toward.y = 0;
    const distance = toward.length();
    const direction = toward.normalize();
    if (distance > (this.boss ? 7 : 4.5))
      this.group.position.addScaledVector(
        direction,
        (this.boss ? 1.9 : this.type === "scout" ? 2.5 : 1.55) * dt,
      );
    else if (distance < 3.1 && this.type !== "brute")
      this.group.position.addScaledVector(direction, -0.65 * dt);
    this.group.position.addScaledVector(
      new THREE.Vector3(-direction.z, 0, direction.x),
      this.strafe * (this.boss ? 0.22 : 0.42) * dt,
    );
    this.group.position.x = THREE.MathUtils.clamp(
      this.group.position.x,
      -11.5,
      11.5,
    );
    this.group.position.z = THREE.MathUtils.clamp(
      this.group.position.z,
      -11.5,
      11.5,
    );
    this.group.rotation.y = Math.atan2(
      this.game.player.position.x - this.group.position.x,
      this.game.player.position.z - this.group.position.z,
    );
    this.cooldown -= dt;
    this.flash = Math.max(0, this.flash - dt);
    if (this.cooldown <= 0 && distance < 22) {
      this.game.projectile(
        this.group.position.clone().add(new THREE.Vector3(0, 1.45, 0)),
        this.game.player.position.clone().add(new THREE.Vector3(0, -0.2, 0)),
        materials.enemyBolt,
        8,
        this.damage,
        "player",
      );
      this.cooldown =
        Math.max(
          0.65,
          (this.boss ? 0.95 : this.type === "scout" ? 1.8 : 1.45) /
            this.game.difficulty.enemyRate,
        ) +
        Math.random() * 0.6;
      this.strafe *= -1;
    }
    this.group.children[0].position.y =
      Math.sin(this.game.elapsed * 3 + this.position.x) * 0.035;
    this.group.children[0].scale.setScalar(this.flash > 0 ? 1.07 : 1);
  }
  hit(amount) {
    if (!this.alive) return;
    this.health = Math.max(0, this.health - amount);
    this.flash = 0.12;
    if (this.health === 0) {
      this.alive = false;
      scene.remove(this.group);
      this.game.onEnemyDown(this);
    }
  }
}

class Pickup {
  constructor(game, kind, x, z) {
    this.game = game;
    this.kind = kind;
    this.group = new THREE.Group();
    this.group.position.set(x, 0.68, z);
    const color = kind === "health" ? "#74e6a6" : "#f4d174";
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.35),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        roughness: 0.3,
      }),
    );
    this.group.add(gem);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.035, 8, 24),
      new THREE.MeshBasicMaterial({ color }),
    );
    ring.rotation.x = Math.PI / 2;
    this.group.add(ring);
    scene.add(this.group);
  }
  update(dt) {
    this.group.rotation.y += dt * 1.4;
    this.group.position.y =
      0.68 + Math.sin(this.game.elapsed * 2.5 + this.group.position.x) * 0.1;
    if (this.group.position.distanceTo(this.game.player.position) < 1.25) {
      if (this.kind === "health") {
        this.game.player.health = Math.min(
          this.game.player.maxHealth,
          this.game.player.health + 60,
        );
        this.game.message("VITALS RESTORED");
      } else {
        this.game.player.weaponLevel = Math.min(
          4,
          this.game.player.weaponLevel + 1,
        );
        this.game.message("WEAPON UPGRADED");
      }
      this.game.removePickup(this);
    }
  }
}

class Game {
  constructor() {
    this.player = {
      position: camera.position,
      health: 200,
      maxHealth: 200,
      yaw: 0,
      speed: 5.3,
      cooldown: 0,
      invulnerable: 0,
      hits: 0,
      weaponLevel: 1,
    };
    this.keys = new Set();
    this.enemies = [];
    this.pickups = [];
    this.effects = [];
    this.level = 1;
    this.targetLevel = 10;
    this.difficulty = {
      key: "normal",
      playerScale: 1,
      enemyScale: 1,
      enemyRate: 1,
      damageScale: 1,
    };
    this.running = false;
    this.ended = false;
    this.elapsed = 0;
    this.hitTimer = null;
    this.trees = [];
    this.buildForest();
    this.buildWeapon();
    this.resize();
    this.updateHud();
  }
  buildForest() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      materials.ground,
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    const grid = new THREE.GridHelper(30, 30, "#87936d", "#657454");
    grid.position.y = 0.015;
    grid.material.transparent = true;
    grid.material.opacity = 0.13;
    scene.add(grid);
    // Woods edge and cover are randomized but seeded by the fixed placement list for fair movement.
    const trees = [
      [-13, -11],
      [-10, -13],
      [-6, -12],
      [-2, -13],
      [3, -12],
      [8, -13],
      [12, -10],
      [13, -5],
      [12, 1],
      [13, 7],
      [10, 12],
      [5, 13],
      [0, 12],
      [-5, 13],
      [-11, 11],
      [-13, 6],
      [-12, 0],
      [-13, -6],
      [-8, -7],
      [8, -7],
      [-9, 2],
      [9, 2],
      [-5, 6],
      [5, 7],
      [-2, 2],
      [3, -2],
      [-7, -1],
      [7, -3],
    ];
    for (const [x, z] of trees) this.makeTree(x, z);
    for (const [x, z, s] of [
      [-4, -9, 1.1],
      [4, -9, 0.9],
      [-9, 5, 1.2],
      [9, 5, 1],
      [0, 8, 1],
    ]) {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(s, 0),
        materials.rock,
      );
      rock.position.set(x, s * 0.48, z);
      rock.scale.y = 0.62;
      rock.castShadow = true;
      rock.receiveShadow = true;
      scene.add(rock);
    }
    const grass = new THREE.Mesh(
      new THREE.CircleGeometry(1.5, 32),
      new THREE.MeshStandardMaterial({ color: "#617347", roughness: 1 }),
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(0, 0.025, 0);
    scene.add(grass);
  }
  makeTree(x, z) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.3, 2.2, 7),
      materials.bark,
    );
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    tree.add(trunk);
    const height = 2.5 + (Math.abs(x + z) % 3) * 0.35;
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(1.35, height, 8),
      materials.leaf[Math.abs(x * 3 + z * 5) % materials.leaf.length],
    );
    crown.position.y = 2.4 + height * 0.34;
    crown.castShadow = true;
    tree.add(crown);
    const crown2 = new THREE.Mesh(
      new THREE.ConeGeometry(0.95, height * 0.72, 8),
      materials.leaf[Math.abs(x * 5 + z * 2 + 1) % materials.leaf.length],
    );
    crown2.position.set(0.08, 3.05 + height * 0.45, 0.04);
    crown2.castShadow = true;
    tree.add(crown2);
    tree.userData.radius = 0.55;
    scene.add(tree);
    this.trees.push(tree);
  }
  buildWeapon() {
    const weapon = new THREE.Group();
    const gunMat = new THREE.MeshStandardMaterial({
      color: "#303d38",
      metalness: 0.72,
      roughness: 0.27,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: "#cf8350",
      metalness: 0.45,
      roughness: 0.35,
    });
    box(weapon, [0.28, 0.23, 0.65], [0, 0, 0], gunMat);
    box(weapon, [0.2, 0.12, 0.48], [0, 0.12, -0.02], trimMat);
    box(weapon, [0.1, 0.25, 0.14], [0, -0.2, 0.16], gunMat);
    box(weapon, [0.12, 0.1, 0.34], [0, -0.035, -0.42], gunMat);
    const muzzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12),
      new THREE.MeshBasicMaterial({ color: "#d4e2ca" }),
    );
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.z = -0.61;
    weapon.add(muzzle);
    // Visible forearm and hand sit under the pistol in the lower right of the view.
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.25, 0.64, 10),
      new THREE.MeshStandardMaterial({ color: "#34483a", roughness: 0.9 }),
    );
    sleeve.rotation.x = -0.55;
    sleeve.rotation.z = -0.2;
    sleeve.position.set(0.42, -0.48, 0.22);
    weapon.add(sleeve);
    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 12, 10),
      materials.skin,
    );
    hand.scale.set(1.3, 0.75, 1.4);
    hand.position.set(0.31, -0.2, -0.04);
    weapon.add(hand);
    weapon.position.set(0.45, -0.42, -0.92);
    camera.add(weapon);
    this.weaponModel = weapon;
  }
  resize() {
    const { width, height } = root.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  openSetup() {
    setupModal.classList.add("visible");
    setupModal.setAttribute("aria-hidden", "false");
  }
  closeSetup() {
    setupModal.classList.remove("visible");
    setupModal.setAttribute("aria-hidden", "true");
  }
  deploy() {
    this.targetLevel = Number(levelSelect.value);
    this.level = 1;
    const mode =
      document.querySelector("[data-difficulty].selected")?.dataset
        .difficulty || "normal";
    this.setDifficulty(mode);
    this.startLevel(true);
    this.closeSetup();
  }
  setDifficulty(mode) {
    this.difficulty =
      mode === "easy"
        ? {
            key: mode,
            playerScale: 0.8,
            enemyScale: 0.72,
            enemyRate: 0.78,
            damageScale: 0.75,
          }
        : mode === "hard"
          ? {
              key: mode,
              playerScale: 1.25,
              enemyScale: 1.48,
              enemyRate: 1.35,
              damageScale: 1.35,
            }
          : {
              key: mode,
              playerScale: 1,
              enemyScale: 1,
              enemyRate: 1,
              damageScale: 1,
            };
  }
  startLevel(fresh = false) {
    this.clearEntities();
    this.ended = false;
    this.running = true;
    this.keys.clear();
    this.player.yaw = 0;
    this.player.cooldown = 0;
    this.player.invulnerable = 0;
    if (fresh) {
      this.player.health = 200 * this.difficulty.playerScale;
      this.player.maxHealth = 200 * this.difficulty.playerScale;
      this.player.hits = 0;
      this.player.weaponLevel = 1;
    }
    camera.position.set(0, 1.65, 7);
    camera.rotation.set(0, 0, 0, "YXZ");
    const count = Math.min(3 + this.level, 9);
    const types = ["scout", "ranger", "soldier", "brute"];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + 0.35;
      const type = types[(i + this.level) % types.length];
      const base =
        type === "scout"
          ? 50
          : type === "brute"
            ? 150
            : type === "ranger"
              ? 100
              : 100;
      this.enemies.push(
        new Combatant(this, {
          position: [
            Math.sin(angle) * (6 + (i % 2)),
            0,
            -Math.cos(angle) * (6 + (i % 2)),
          ],
          health:
            base * this.difficulty.enemyScale * (1 + (this.level - 1) * 0.055),
          damage:
            (type === "brute" ? 17 : type === "scout" ? 8 : 12) *
            this.difficulty.damageScale *
            (1 + (this.level - 1) * 0.045),
          type,
        }),
      );
    }
    const bossHealth =
      360 * this.difficulty.enemyScale * (1 + (this.level - 1) * 0.12);
    this.enemies.push(
      new Combatant(this, {
        position: [0, 0, -10],
        health: bossHealth,
        damage:
          22 * this.difficulty.damageScale * (1 + (this.level - 1) * 0.05),
        type: "brute",
        boss: true,
      }),
    );
    this.pickups.push(
      new Pickup(this, "health", -5, -2),
      new Pickup(this, "weapon", 5, 2),
      new Pickup(this, "health", 0, -11),
    );
    overlay.classList.add("hidden");
    ui.level.textContent = String(this.level).padStart(2, "0");
    ui.kicker.textContent = `LEVEL ${this.level} · ${this.difficulty.key.toUpperCase()}`;
    this.updateHud();
  }
  clearEntities() {
    for (const enemy of this.enemies) scene.remove(enemy.group);
    this.enemies = [];
    for (const pickup of this.pickups) scene.remove(pickup.group);
    this.pickups = [];
    for (const effect of this.effects) {
      scene.remove(effect.mesh);
      effect.mesh.geometry.dispose();
    }
    this.effects = [];
  }
  projectile(start, end, material, speed, damage, target) {
    const direction = end.clone().sub(start).normalize();
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 8, 8),
      material,
    );
    mesh.position.copy(start);
    scene.add(mesh);
    this.effects.push({ mesh, direction, speed, damage, target, life: 2.2 });
  }
  fire() {
    if (!this.running || this.ended || this.player.cooldown > 0) return;
    this.player.cooldown = Math.max(
      0.1,
      0.27 - (this.player.weaponLevel - 1) * 0.035,
    );
    ui.weaponView.classList.remove("kick");
    void ui.weaponView.offsetWidth;
    ui.weaponView.classList.add("kick");
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion,
    );
    const ray = new THREE.Raycaster(camera.position, direction, 0, 36);
    const live = this.enemies.filter((e) => e.alive);
    const hits = ray.intersectObjects(
      live.flatMap((e) => e.hitMeshes),
      false,
    );
    const treeHits = ray.intersectObjects(
      this.trees.map((tree) => tree.children[0]),
      false,
    );
    const hit =
      hits[0] && (!treeHits[0] || hits[0].distance < treeHits[0].distance)
        ? hits[0]
        : null;
    const muzzle = camera.position
      .clone()
      .addScaledVector(direction, 0.72)
      .add(new THREE.Vector3(0.2, -0.25, 0));
    this.projectile(
      muzzle,
      hit ? hit.point : camera.position.clone().addScaledVector(direction, 22),
      materials.playerBolt,
      40,
      0,
      null,
    );
    if (hit) {
      const target = live.find((e) => e.hitMeshes.includes(hit.object));
      if (target) {
        target.hit(
          (26 + this.player.weaponLevel * 4) * this.difficulty.damageScale,
        );
        this.player.hits++;
        ui.hitMarker.classList.add("visible");
        clearTimeout(this.hitTimer);
        this.hitTimer = setTimeout(
          () => ui.hitMarker.classList.remove("visible"),
          120,
        );
      }
    }
    this.updateHud();
  }
  updatePlayer(dt) {
    const turn =
      Number(this.keys.has("ArrowLeft")) -
      Number(this.keys.has("ArrowRight")) +
      Number(this.keys.has("a")) -
      Number(this.keys.has("d"));
    const strafe = Number(this.keys.has("d")) - Number(this.keys.has("a"));
    this.player.yaw += turn * 1.8 * dt;
    const forward =
      Number(this.keys.has("ArrowUp")) +
      Number(this.keys.has("w")) -
      Number(this.keys.has("ArrowDown")) -
      Number(this.keys.has("s"));
    const move = new THREE.Vector3(
      -Math.sin(this.player.yaw),
      0,
      -Math.cos(this.player.yaw),
    );
    camera.position.addScaledVector(move, forward * this.player.speed * dt);
    const side = new THREE.Vector3(
      Math.cos(this.player.yaw),
      0,
      -Math.sin(this.player.yaw),
    );
    camera.position.addScaledVector(side, strafe * this.player.speed * dt);
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -12, 12);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -12, 12);
    for (const tree of this.trees) {
      const dx = camera.position.x - tree.position.x,
        dz = camera.position.z - tree.position.z,
        d = Math.hypot(dx, dz);
      if (d < 0.76) {
        const safeDistance = d || 0.001;
        camera.position.x = tree.position.x + (dx / safeDistance) * 0.76;
        camera.position.z = tree.position.z + (dz / safeDistance) * 0.76;
      }
    }
    camera.rotation.set(0, this.player.yaw, 0, "YXZ");
    this.player.cooldown = Math.max(0, this.player.cooldown - dt);
    this.player.invulnerable = Math.max(0, this.player.invulnerable - dt);
    if (this.keys.has(" ")) this.fire();
    this.weaponModel.position.y =
      -0.42 + Math.sin(this.elapsed * 8) * 0.009 * (forward !== 0 ? 1 : 0);
  }
  updateEffects(dt) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.life -= dt;
      e.mesh.position.addScaledVector(e.direction, e.speed * dt);
      if (
        e.target === "player" &&
        e.life > 0 &&
        this.player.invulnerable <= 0 &&
        e.mesh.position.distanceTo(
          camera.position.clone().add(new THREE.Vector3(0, -0.15, 0)),
        ) < 0.48
      ) {
        this.player.health = Math.max(0, this.player.health - e.damage);
        this.player.invulnerable = 0.42;
        e.life = 0;
        if (this.player.health <= 0) this.end(false);
      }
      if (e.life <= 0) {
        scene.remove(e.mesh);
        e.mesh.geometry.dispose();
        this.effects.splice(i, 1);
      }
    }
  }
  onEnemyDown(enemy) {
    this.updateHud();
    if (!this.enemies.some((e) => e.alive)) {
      this.running = false;
      if (document.pointerLockElement) document.exitPointerLock();
      if (this.level < this.targetLevel) {
        this.player.health = Math.min(
          this.player.maxHealth + 50,
          this.player.health + 50,
        );
        this.player.maxHealth += 50;
        this.level++;
        ui.title.innerHTML = "LEVEL<br /><em>CLEAR.</em>";
        ui.copy.textContent = `Vitals boosted by 50. Level ${this.level} is ready.`;
        ui.kicker.textContent = "BOSS ELIMINATED";
        ui.startLabel.textContent = "Continue";
        this.ended = false;
        ui.start.onclick = () => this.startLevel(false);
        overlay.classList.remove("hidden");
      } else {
        this.end(true);
      }
    }
  }
  end(victory) {
    if (this.ended) return;
    this.running = false;
    if (document.pointerLockElement) document.exitPointerLock();
    this.ended = true;
    this.keys.clear();
    ui.title.innerHTML = victory
      ? "FOREST<br /><em>SECURED.</em>"
      : "YOU'RE<br /><em>DOWN.</em>";
    ui.copy.textContent = victory
      ? `You cleared through level ${this.targetLevel} and defeated every boss.`
      : "You were overwhelmed. Reset your deployment and try again.";
    ui.kicker.textContent = victory ? "MISSION COMPLETE" : "VITALS DEPLETED";
    ui.startLabel.textContent = "Choose mission";
    ui.start.onclick = () => this.openSetup();
    overlay.classList.remove("hidden");
  }
  message(text) {
    ui.kicker.textContent = text;
    setTimeout(() => {
      if (this.running)
        ui.kicker.textContent = `LEVEL ${this.level} · ${this.difficulty.key.toUpperCase()}`;
    }, 1200);
  }
  removePickup(pickup) {
    scene.remove(pickup.group);
    this.pickups = this.pickups.filter((p) => p !== pickup);
  }
  updateHud() {
    ui.playerHp.textContent = `${Math.ceil(this.player.health)} / ${Math.ceil(this.player.maxHealth)}`;
    ui.playerBar.style.width = `${Math.max(0, (this.player.health / this.player.maxHealth) * 100)}%`;
    const alive = this.enemies.filter((e) => e.alive);
    const current = alive.find((e) => e.boss) || alive[0];
    const total = alive.reduce((sum, e) => sum + e.health, 0);
    const max = alive.reduce((sum, e) => sum + e.maxHealth, 0);
    ui.enemyHp.textContent = String(Math.ceil(total));
    ui.enemyBar.style.width = `${max ? (total / max) * 100 : 0}%`;
    ui.enemyLabel.textContent = current?.boss ? "BOSS" : "HOSTILES";
    ui.hitCount.textContent = String(this.player.hits).padStart(2, "0");
    ui.level.textContent = String(this.level).padStart(2, "0");
    ui.weapon.textContent = `MK. ${["I", "II", "III", "IV"][this.player.weaponLevel - 1]}`;
  }
  drawMinimap() {
    const ctx = mapContext,
      w = minimap.width,
      h = minimap.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(14,23,19,.75)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(211,229,191,.18)";
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo((i * w) / 4, 0);
      ctx.lineTo((i * w) / 4, h);
      ctx.moveTo(0, (i * h) / 4);
      ctx.lineTo(w, (i * h) / 4);
      ctx.stroke();
    }
    const px = (x) => ((x + 15) / 30) * w,
      py = (z) => ((z + 15) / 30) * h;
    for (const tree of scene.children.filter((o) => o.userData.radius)) {
      ctx.fillStyle = "#496643";
      ctx.beginPath();
      ctx.arc(px(tree.position.x), py(tree.position.z), 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const e of this.enemies)
      if (e.alive) {
        ctx.fillStyle = e.boss ? "#ff745c" : "#efa16f";
        ctx.beginPath();
        ctx.arc(
          px(e.group.position.x),
          py(e.group.position.z),
          e.boss ? 4 : 2.6,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    for (const p of this.pickups) {
      ctx.fillStyle = p.kind === "health" ? "#76e9a8" : "#f1cf73";
      ctx.fillRect(
        px(p.group.position.x) - 2,
        py(p.group.position.z) - 2,
        4,
        4,
      );
    }
    ctx.save();
    ctx.translate(px(camera.position.x), py(camera.position.z));
    ctx.rotate(this.player.yaw);
    ctx.fillStyle = "#d9fff0";
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, 4);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  tick(dt) {
    if (this.running) {
      this.elapsed += dt;
      this.updatePlayer(dt);
      for (const e of this.enemies) e.update(dt);
      for (const p of [...this.pickups]) p.update(dt);
      this.updateEffects(dt);
      this.updateHud();
    }
    this.drawMinimap();
    renderer.render(scene, camera);
  }
}

const game = new Game();
for (let i = 1; i <= 10; i++) {
  const option = document.createElement("option");
  option.value = String(i);
  option.textContent = `Level ${String(i).padStart(2, "0")}${i === 1 ? " · First deployment" : ""}`;
  levelSelect.append(option);
}
ui.start.onclick = () => game.openSetup();
ui.deploy.addEventListener("click", () => game.deploy());
document.querySelectorAll("[data-difficulty]").forEach((button) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-difficulty]")
      .forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
  }),
);
window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(key))
    event.preventDefault();
  game.keys.add(key);
});
window.addEventListener("keyup", (event) =>
  game.keys.delete(
    event.key.length === 1 ? event.key.toLowerCase() : event.key,
  ),
);
window.addEventListener("blur", () => game.keys.clear());
root.addEventListener("pointerdown", (event) => {
  if (event.button === 0 && game.running) {
    game.fire();
    if (root.requestPointerLock) root.requestPointerLock();
  }
});
window.addEventListener("mousemove", (event) => {
  if (game.running && document.pointerLockElement === root) {
    game.player.yaw -= event.movementX * 0.0022;
    camera.rotation.y = game.player.yaw;
    camera.rotation.x = THREE.MathUtils.clamp(
      camera.rotation.x - event.movementY * 0.0016,
      -0.65,
      0.65,
    );
  }
});
window.addEventListener("resize", () => game.resize());
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  game.tick(Math.min(clock.getDelta(), 0.05));
}
animate();
