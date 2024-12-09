import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "lil-gui";

const gui = new dat.GUI();

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.495;
controls.target.set(0, 10, 0);
controls.minDistance = 40.0;
controls.maxDistance = 200.0;
controls.update();

const lights = [];
lights[0] = new THREE.DirectionalLight(0xffffff, 3);
lights[1] = new THREE.DirectionalLight(0xffffff, 3);
lights[2] = new THREE.DirectionalLight(0xffffff, 3);

lights[0].position.set(0, 200, 0);
lights[1].position.set(100, 200, 100);
lights[2].position.set(- 100, - 200, - 100);

scene.add(lights[0]);
scene.add(lights[1]);
scene.add(lights[2]);

// Create a plane geometry
const planeGeometry = new THREE.PlaneGeometry(30, 30, 10, 10);
console.log(planeGeometry);
console.log(planeGeometry.attributes.position.array);
//planeGeometry.vertices.forEach(vertex => {
//  console.log(`Vertex: (${vertex.x}, ${vertex.y}, ${vertex.z})`);
//   console.log(`Vertex: (${vertex})`);
// });

// Create a material for the faces (blue)
const blueMaterial = new THREE.MeshStandardMaterial({
  color: 0x156289,
  transparent: true,
  opacity: 0.5,
  emissive: 0x072534,
  flatShading: true,
  //wireframe: true,
});

// Create a plane mesh with blue faces
const planeMesh = new THREE.Mesh(planeGeometry, blueMaterial);
scene.add(planeMesh);
gui.add(planeMesh.rotation, "x").min(-Math.PI).max(Math.PI).name("Rotation X");

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  //planeMesh.rotation.x += 0.01;
  // planeMesh.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
