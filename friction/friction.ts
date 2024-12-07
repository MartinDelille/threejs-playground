import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { World, Material, Plane, Body, Box, Vec3 } from "cannon-es";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  1,
  20000,
);
camera.position.set(-30, 30, -10);

const axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
document.body.appendChild(renderer.domElement);

const world = new World();
world.gravity.set(0, -9.82, 0);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(-90, 50, 50).normalize();
scene.add(directionalLight);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 2); // soft white light
scene.add(ambientLight);

// Create a plane
const groundMaterial = new Material('ground')
groundMaterial.friction = 0.3
const planeShape = new Plane();
const planeBody = new Body({ mass: 0, material: groundMaterial });
planeBody.addShape(planeShape);
planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(planeBody);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(10, 10, 10),
  new THREE.MeshStandardMaterial({ color: 0xff0000 }),
);

scene.add(cube);

const slipperyMaterial = new Material('slippery')
slipperyMaterial.friction = 0.01

const cubeShape = new Box(new Vec3(1, 1, 1));
const cubeBody = new Body({
  mass: 1,
  material: slipperyMaterial
});
cubeBody.addShape(cubeShape);
cubeBody.position.set(0, 10, 0);
world.addBody(cubeBody);

let speed = 0;
let rotationSpeed = 0;

window.addEventListener("keydown", (event): void => {
  switch (event.key) {
    case "w":
      speed = 1;
      break;
    case "s":
      speed = -1;
      break;
    case "a":
      rotationSpeed = 1;
      break;
    case "d":
      rotationSpeed = -1;
      break;
  }
});
window.addEventListener("keyup", (event): void => {
  switch (event.key) {
    case "w":
    case "s":
      speed = 0;
      break;
    case "a":
    case "d":
      rotationSpeed = 0;
      break;
  }
});


const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.495;
controls.target.set(0, 10, 0);
controls.minDistance = 40.0;
controls.maxDistance = 200.0;
controls.update();

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  world.step(1 / 60);

  // Calculate the forward direction
  const forward = new THREE.Vector3(0, 0, -1);
  forward.applyQuaternion(cube.quaternion);
  forward.normalize();

  // Apply the velocity in the forward direction
  cubeBody.velocity.set(forward.x * speed * 5, cubeBody.velocity.y, forward.z * speed * 5);
  cubeBody.angularVelocity.set(0, rotationSpeed * 1, 0);
  cube.position.copy(cubeBody.position);
  cube.quaternion.copy(cubeBody.quaternion);
  renderer.render(scene, camera);
}
