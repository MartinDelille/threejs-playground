import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Demo } from "../common/demo";
import { WaveGeometry } from "./WaveGeometry";

const debugObject = {
  color: 0x52ebff,
  buoyancyFactor: 3000,
}

const demo = new Demo();

let plane = new THREE.Mesh(
  new WaveGeometry(800, 40),
  new THREE.MeshStandardMaterial({
    color: debugObject.color,
    transparent: true,
    opacity: 0.5,
    flatShading: true,
  }),
);

const waterGui = demo.gui.addFolder("Water");
waterGui.add(plane.material, "wireframe");
waterGui.add(debugObject, "buoyancyFactor", 0, 10000);

demo.scene.add(plane);

const group = new THREE.Group();
demo.scene.add(group);

const length = 50;
const width = 30;
const height = 10;

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(length, height, width),
  new THREE.MeshStandardMaterial({ color: 0x34ff1a, opacity: 1.0, transparent: true }),
);
demo.gui.addColor(debugObject, "color").onChange((value: THREE.Color) => {
  cube.material.color.set(value);
});

const cubeGui = demo.gui.addFolder("Cube");
cubeGui.add(cube, "visible");
cubeGui.add(cube.material, "opacity", 0, 1);
cubeGui.add(cube.material, "wireframe");
demo.scene.add(cube);
group.add(cube);

const cubeShape = new CANNON.Box(new CANNON.Vec3(length / 2, height / 2, width / 2));
const cubeBody = new CANNON.Body({
  mass: 10000,
});

cubeBody.addShape(cubeShape);
cubeBody.position.set(0, height, 0);
demo.world.addBody(cubeBody);
cubeGui.add(cubeBody, "mass", 1, 20000);

const arrows = [
  new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-length / 2, -height / 2, -width / 2), 0, 0xff0000),
  new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -height / 2, -width / 2), 0, 0xff0000),
  new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(length / 2, -height / 2, -width / 2), 0, 0xff0000),
  new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(length / 2, -height / 2, width / 2), 0, 0xff0000),
  new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -height / 2, width / 2), 0, 0xff0000),
  new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-length / 2, -height / 2, width / 2), 0, 0xff0000),
];


for (let i = 0; i < arrows.length; i++) {
  group.add(arrows[i]);
}
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

const waveAngle = 0;
const cosAngle = Math.cos(waveAngle);
const sinAngle = Math.sin(waveAngle);
const waveSpeed = 0.3;
const wavePeriod = 40;
const waveHeight = 18;

function getWaterHeightAt(x: number, z: number, time: number): number {
  const rotatedX = x * cosAngle - z * sinAngle;
  return Math.sin(rotatedX / wavePeriod + waveSpeed * time) * waveHeight;
}

demo.start((time: number) => {
  demo.controls.target.copy(cubeBody.position);
  demo.controls.update();
  const vertices = plane.geometry.attributes.position.array;

  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const z = vertices[i + 2];
    vertices[i + 1] = getWaterHeightAt(x, z, time);
  }

  plane.geometry.attributes.position.needsUpdate = true;


  // Calculate the forward direction
  const forward = new THREE.Vector3(1, 0, 0);
  forward.applyQuaternion(group.quaternion);
  forward.normalize();

  const speedFactor = 15;
  cubeBody.velocity.set(forward.x * speed * speedFactor, cubeBody.velocity.y, forward.z * speed * speedFactor);
  cubeBody.angularVelocity.set(0, rotationSpeed * 1, 0);

  let damping = 0.01;
  for (let i = 0; i < arrows.length; i++) {
    const arrow = arrows[i];
    const arrowWorldPosition = new CANNON.Vec3();
    cubeBody.quaternion.vmult(new CANNON.Vec3(arrow.position.x, arrow.position.y, arrow.position.z), arrowWorldPosition);
    arrowWorldPosition.vadd(cubeBody.position, arrowWorldPosition);

    const wh = getWaterHeightAt(arrowWorldPosition.x, arrowWorldPosition.z, time);
    let submersion = Math.min(Math.max((wh - arrowWorldPosition.y) / height, 0), 1);
    let buoyancyForce = 0;
    if (arrowWorldPosition.y < wh) {
      buoyancyForce = debugObject.buoyancyFactor * (wh - arrowWorldPosition.y);
    }
    cubeBody.applyForce(new CANNON.Vec3(0, buoyancyForce, 0), new CANNON.Vec3(arrow.position.x, 0, arrow.position.z));
    arrow.setLength(buoyancyForce / 20);
    damping += 0.1 * submersion;
  }
  cubeBody.linearDamping = damping;

  group.position.copy(cubeBody.position);
  group.quaternion.copy(cubeBody.quaternion);
});
