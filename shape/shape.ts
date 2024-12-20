import * as THREE from 'three';
import { Demo } from "../common/demo";

const demo = new Demo();


const planeGeometry = new THREE.PlaneGeometry(100, 100, 2, 2);

planeGeometry.rotateX(-Math.PI / 2);
const vertices = planeGeometry.attributes.position.array;

for (let i = 0; i < vertices.length; i += 3) {
  if (i % 6 == 3) {
    console.log("edit:", i);
    vertices[i + 1] = 10;
  }
  console.log(i, vertices[i], vertices[i + 1], vertices[i + 2]);
}
planeGeometry.attributes.position.needsUpdate = true;

const blueMaterial = new THREE.MeshStandardMaterial({
  color: 0xf56289,
  transparent: true,
  opacity: 0.5,
  emissive: 0xf72534,
  flatShading: true,
});

// Create a plane mesh with blue faces
const planeMesh = new THREE.Mesh(planeGeometry, blueMaterial);
demo.scene.add(planeMesh);
demo.gui.add(planeMesh.rotation, "x").min(-Math.PI).max(Math.PI).name("Rotation X");

let planeGui = demo.gui.addFolder("Plane");
planeGui.add(planeMesh.material, "wireframe").name("Wireframe");

demo.start(() => {
});
