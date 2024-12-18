import * as THREE from "three";
import { Demo } from "../common/demo";

const demo = new Demo();

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(10, 10, 10),
  new THREE.MeshStandardMaterial({ color: 0xff0000 }),
);

demo.scene.add(cube);

demo.start();
