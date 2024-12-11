import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as CANNON from "cannon-es";
import * as dat from "lil-gui";

const gui = new dat.GUI();
const debugObject = {
  color: 0x52ebff,
}

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  1,
  20000,
);
camera.position.set(50, 30, 50);
let cameraGui = gui.addFolder("Camera");
cameraGui.add(camera.position, "x", -100, 100).listen();
cameraGui.add(camera.position, "y", -100, 100).listen();
cameraGui.add(camera.position, "z", -100, 100).listen();

const axesHelper = new THREE.AxesHelper(50);
axesHelper.visible = false;
gui.add(axesHelper, "visible").name("Axes Helper");
scene.add(axesHelper);
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
document.body.appendChild(renderer.domElement);

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(-90, 90, 50).normalize();
scene.add(directionalLight);

let lightGui = gui.addFolder("Light").close();
lightGui.add(directionalLight.position, "x", -100, 100).listen();
lightGui.add(directionalLight.position, "y", -100, 100).listen();
lightGui.add(directionalLight.position, "z", -100, 100).listen();

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 2); // soft white light
scene.add(ambientLight);

let plane = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000, 500, 500),
  new THREE.MeshStandardMaterial({
    color: debugObject.color,
    transparent: true,
    opacity: 0.5,
    flatShading: true,
  }),
);

const planeGui = gui.addFolder("Plane");
planeGui.add(plane.material, "wireframe");
planeGui.addColor(debugObject, "color").onChange((value: THREE.Color) => {
  plane.material.color.set(value);
});

plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const size = 10;
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(size, size, size),
  new THREE.MeshStandardMaterial({ color: 0xff0000 }),
);

const cubeGui = gui.addFolder("Cube");
cubeGui.add(cube, "visible");
cubeGui.add(cube.position, "x", -100, 100).listen();
cubeGui.add(cube.position, "y", -100, 100).listen();
cubeGui.add(cube.position, "z", -100, 100).listen();
scene.add(cube);

const cubeShape = new CANNON.Box(new CANNON.Vec3(size, size, size));
const cubeBody = new CANNON.Body({
  mass: 1,
});
cubeBody.addShape(cubeShape);
cubeBody.position.set(0, size, 0);
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
controls.maxPolarAngle = Math.PI * 0.995;
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

const waveAngle = Math.PI / 2;
const cosAngle = Math.cos(waveAngle);
const sinAngle = Math.sin(waveAngle);
const waveSpeed = 0.9;
const wavePeriod = 20;
const waveHeight = 8;

function getWaterHeightAt(x: number, z: number, time: number): number {
  const rotatedX = x * cosAngle - z * sinAngle;
  return Math.sin(rotatedX / wavePeriod + waveSpeed * time) * waveHeight;
}

function animate() {
  const time = performance.now() * 0.001;
  const vertices = plane.geometry.attributes.position.array;

  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    vertices[i + 2] = getWaterHeightAt(x, y, time);
  }

  plane.geometry.attributes.position.needsUpdate = true;

  world.step(1 / 60);

  // Calculate the forward direction
  const forward = new THREE.Vector3(0, 0, -1);
  forward.applyQuaternion(cube.quaternion);
  forward.normalize();

  const buoyancyForce = 8 * (- cubeBody.position.y);
  cubeBody.applyForce(new CANNON.Vec3(0, buoyancyForce, 0), cubeBody.position);
  // Apply the velocity in the forward direction
  cubeBody.velocity.set(forward.x * speed * 5, cubeBody.velocity.y, forward.z * speed * 5);
  cubeBody.angularVelocity.set(0, rotationSpeed * 1, 0);
  cube.position.copy(cubeBody.position);
  cube.quaternion.copy(cubeBody.quaternion);
  renderer.render(scene, camera);
}
