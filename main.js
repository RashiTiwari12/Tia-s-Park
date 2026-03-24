import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";

const scene = new THREE.Scene();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const canvas = document.getElementById("experience-canvas");

const character = {
  instance: null,
  moveDistance: 3,
  jumpHeight: 2.4,
  isMoving: false,
  moveDuration: 0.4,
  rotateDuration: 0.3,
};

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8;

// ── MODAL SETUP ──────────────────────────────────────────────────────────────
const modal = document.querySelector(".modal");
const modalTitle = document.querySelector(".modal-title");
const modalDesc = document.querySelector(".modal-project-description");
const modalExitButton = document.querySelector(".modal-exit-button");
const modalVisitButton = document.querySelector(".modal-visit-button");

modal.classList.add("hidden");

const modalContentMap = {
  Project: {
    title: "Project One",
    content: "Main showcase scene with beautiful lighting and composition.",
    link: "https://example.com/",
  },
  Project2: {
    title: "Project Two",
    content: "Secondary interactive experience – different aesthetic.",
    link: "https://example.com/",
  },
  Cube010_1: {
    title: "Cube Experiment",
    content: "Procedural geometry test with dynamic lighting.",
    link: "https://example.com/",
  },
  Tia: {
    title: "Tia – Character Presentation",
    content: "High-quality character model showcase.",
    link: "https://example.com/",
  },
};

function showModal(projectName) {
  const data = modalContentMap[projectName];
  if (!data) return;
  modalTitle.textContent = data.title;
  modalDesc.textContent = data.content;
  if (data.link) {
    modalVisitButton.style.display = "inline-block";
    modalVisitButton.href = data.link;
  }
  modal.classList.remove("hidden");
}

function hideModal() {
  modal.classList.add("hidden");
}

modalExitButton.addEventListener("click", hideModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) hideModal();
});

// ── LOAD MODEL & FIND CHARACTER ─────────────────────────────────────────────
const projectNames = ["Project2", "Cube010_1", "Project", "Tia"];
const projectGroups = [];

const loader = new GLTFLoader();

loader.load(
  "./Tia.glb",
  (gltf) => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

      if (projectNames.includes(child.name)) {
        let target =
          child.isMesh && child.parent !== gltf.scene ? child.parent : child;
        if (!projectGroups.includes(target)) {
          projectGroups.push(target);
          console.log("Added project group:", target.name);
        }
      }

      if (child.name === "Tia") {
        character.instance = child;
        console.log("Character 'Tia' found and assigned");
      }
    });

    scene.add(gltf.scene);
  },
  undefined,
  (error) => console.error("GLTF load error:", error),
);
scene.background = new THREE.Color(0x94d56a);

// ── LIGHTS ───────────────────────────────────────────────────────────────────
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.castShadow = true;
sun.position.set(-155, 62, -53);
sun.target.position.set(0, 0, 0);
scene.add(sun.target);

sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -100;
sun.shadow.camera.right = 100;
sun.shadow.camera.top = 100;
sun.shadow.camera.bottom = -100;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 500;
sun.shadow.bias = -0.0005;
sun.shadow.normalBias = 0.1;
scene.add(sun);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// ── CAMERA & CONTROLS ────────────────────────────────────────────────────────
const aspect = sizes.width / sizes.height;
const frustumSize = 10;

const camera = new THREE.OrthographicCamera(
  (-frustumSize * aspect) / 2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  -frustumSize / 2,
  0.1,
  1000,
);

camera.position.set(-66.1, 25.3, -40.0);
// camera.position.set(-69.1, 26.3, -42.0);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.update();

// ── TRANSFORM CONTROLS (sun) ─────────────────────────────────────────────────
const transform = new TransformControls(camera, renderer.domElement);
transform.attach(sun);
scene.add(transform);

transform.addEventListener("dragging-changed", (event) => {
  controls.enabled = !event.value;
});

// ── RAYCAST & MODAL INTERACTION ─────────────────────────────────────────────
let currentIntersect = null;

function onPointerMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (projectGroups.length === 0) return;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(projectGroups, true);

  // Reset previous highlight
  if (currentIntersect?.object?.material?.color) {
    // currentIntersect.object.material.color.set(0xffffff);
  }

  document.body.style.cursor = "default";
  currentIntersect = null;

  if (intersects.length > 0) {
    const hit = intersects[0];
    currentIntersect = hit;

    if (hit.object.material) {
      // hit.object.material.color.set(0xff4444);
    }
    document.body.style.cursor = "pointer";
  }
}

function onClick() {
  if (!currentIntersect) return;

  let current = currentIntersect.object;
  let projectName = null;

  while (current && current !== scene) {
    if (projectNames.includes(current.name)) {
      projectName = current.name;
      break;
    }
    current = current.parent;
  }

  if (projectName) {
    console.log("Clicked project →", projectName);
    showModal(projectName);
  }
}

// ── CHARACTER MOVEMENT ──────────────────────────────────────────────────────
function moveCharacter(targetPosition, targetRotationY) {
  if (!character.instance || character.isMoving) return;

  character.isMoving = true;

  const tl = gsap.timeline({
    onComplete: () => {
      character.isMoving = false;
    },
  });

  tl.to(character.instance.position, {
    x: targetPosition.x,
    z: targetPosition.z,
    duration: character.moveDuration,
    ease: "power2.out",
  });

  tl.to(
    character.instance.rotation,
    {
      y: targetRotationY,
      duration: character.rotateDuration,
      ease: "power1.inOut",
    },
    0,
  );
  tl.to(
    character.instance.position,
    {
      y: character.instance.position.y + character.jumpHeight,
      duration: character.moveDuration / 2,
      yoyo: true,
      repeat: 1,
      ease: "power2.out",
    },
    0,
  );
}

// ── KEYBOARD INPUT ──────────────────────────────────────────────────────────
function onKeyDown(event) {
  if (character.isMoving || !character.instance) return;

  const pos = character.instance.position.clone();
  let rotY = character.instance.rotation.y;

  switch (event.key.toLowerCase()) {
    case "w":
    case "arrowup":
      pos.z += character.moveDistance; // usually -z = forward in gltf/blender
      rotY = Math.PI / 2; // looking forward (negative Z)
      break;

    case "s":
    case "arrowdown":
      pos.z -= character.moveDistance;
      rotY = -Math.PI / 2;
      break;

    case "a":
    case "arrowleft":
      pos.x += character.moveDistance;
      rotY = Math.PI;
      break;

    case "d":
    case "arrowright":
      pos.x -= character.moveDistance;
      rotY = 0;
      break;

    default:
      return;
  }

  console.log("Moving to:", pos.x.toFixed(1), pos.z.toFixed(1));
  moveCharacter(pos, rotY);
}

// ── EVENTS ───────────────────────────────────────────────────────────────────
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  const aspect = sizes.width / sizes.height;
  camera.left = (-frustumSize * aspect) / 2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("pointermove", onPointerMove);
window.addEventListener("click", onClick);
window.addEventListener("keydown", onKeyDown);

// ── ANIMATION LOOP ───────────────────────────────────────────────────────────
function animate() {
  camera.position.copy(
    character.instance
      ? character.instance.position.clone().add(new THREE.Vector3(-10, 10, -10))
      : camera.position,
  );

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
