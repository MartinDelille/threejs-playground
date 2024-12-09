import * as THREE from 'three';
import { Demo } from "../common/demo";

const demo = new Demo();


const planeGeometry = new THREE.PlaneGeometry(30, 30, 10, 10);

const blueMaterial = new THREE.MeshStandardMaterial({
  color: 0x156289,
  transparent: true,
  opacity: 0.5,
  emissive: 0x072534,
  flatShading: true,
});

// Create a plane mesh with blue faces
const planeMesh = new THREE.Mesh(planeGeometry, blueMaterial);
demo.scene.add(planeMesh);
demo.gui.add(planeMesh.rotation, "x").min(-Math.PI).max(Math.PI).name("Rotation X");

let planeGui = demo.gui.addFolder("Plane");
planeGui.add(planeMesh.material, "wireframe").name("Wireframe");

demo.start(() => {
  planeMesh.rotation.x += 0.01;
  planeMesh.rotation.y += 0.01;
});
