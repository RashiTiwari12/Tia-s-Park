import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const loader = new GLTFLoader();

loader.load(
  "./Tia.glb",
  function (glb) {
    glb.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(glb.scene);
  },
  undefined,
  function (error) {
    console.error(error);
  },
);

const sun = new THREE.DirectionalLight(0xffffff);
sun.position.set(-100, 50, 10);
sun.castShadow = true;
// sun.shadow.camera.left = -100;
// sun.shadow.camera.right = -100;
// sun.shadow.camera.top = -100;
// sun.shadow.camera.bottom = -100;

scene.add(sun);

const shadowHelper = new THREE.CameraHelper(sun.shadow.camera);
scene.add(shadowHelper);
console.log(sun.shadow);
const helper = new THREE.DirectionalLightHelper(sun, 5);
scene.add(helper);
const light = new THREE.AmbientLight(0x404040, 5); // soft white light
scene.add(light);
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
scene.add(camera);
camera.position.x = -69.09721941622294;
camera.position.y = 26.301583891431825;
camera.position.z = -41.9857391959237;

const controls = new OrbitControls(camera, canvas);
controls.update();

// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

function handleResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  const aspect = sizes.width / sizes.height;
  camera.left = -aspect * 50;
  camera.right = aspect * 50;
  camera.top = 50;
  camera.bottom = -50;

  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener("resize", handleResize);

function animate() {
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  console.log(camera.position);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
