import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as CANNON from "cannon-es";

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
document.body.appendChild(renderer.domElement);

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(-90, 50, 50).normalize();
scene.add(directionalLight);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xf0f0f0, 1); // soft white light
scene.add(ambientLight);

// Create a matrix of height values
const matrix = []
const sizeX = 15
const sizeZ = 15
for (let i = 0; i < sizeX; i++) {
  matrix.push([])
  for (let j = 0; j < sizeZ; j++) {
    if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeZ - 1) {
      const height = 3
      matrix[i].push(height)
      continue
    }

    const height = Math.cos((i / sizeX) * Math.PI * 2) * Math.cos((j / sizeZ) * Math.PI * 2) + 2
    matrix[i].push(height)
  }
}

// Create the heightfield
const heightfieldShape = new CANNON.Heightfield(matrix, {
  elementSize: 1,
})
const heightfieldBody = new CANNON.Body({ mass: 0 })
heightfieldBody.addShape(heightfieldShape)
heightfieldBody.position.set(
  -((sizeX - 1) * heightfieldShape.elementSize) / 2,
  -4,
  ((sizeZ - 1) * heightfieldShape.elementSize) / 2
)
heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
world.addBody(heightfieldBody)

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xff0000 }),
);
scene.add(sphere);

const sphereShape = new CANNON.Sphere(1)
const sphereBody = new CANNON.Body()
sphereBody.addShape(sphereShape)
sphereBody.position.set(2.5, 3, 2.5)
sphereBody.position.vadd(heightfieldBody.position, sphereBody.position)
world.addBody(sphereBody)

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

  sphere.position.copy(sphereBody.position);
  sphere.quaternion.copy(sphereBody.quaternion);
  renderer.render(scene, camera);
}
