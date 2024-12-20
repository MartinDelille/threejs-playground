import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Demo } from "../common/demo";

const demo = new Demo();

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 }),
);

plane.rotation.x = -Math.PI / 2;
demo.scene.add(plane);

// Create a plane
const groundMaterial = new CANNON.Material('ground')
//groundMaterial.friction = 0.3
const planeShape = new CANNON.Plane();
const planeBody = new CANNON.Body({ mass: 0, material: groundMaterial });
planeBody.addShape(planeShape);
planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
demo.world.addBody(planeBody);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(10, 10, 10),
  new THREE.MeshStandardMaterial({ color: 0xff0000 }),
);

demo.scene.add(cube);

const slipperyMaterial = new CANNON.Material('slippery')
//slipperyMaterial.friction = 0.01

const contactMaterial = new CANNON.ContactMaterial(groundMaterial, slipperyMaterial, {
  friction: 0.1,
  restitution: 0.5,
  contactEquationStiffness: 1e9,
  contactEquationRelaxation: 3,
  frictionEquationStiffness: 1e5,
  frictionEquationRelaxation: 3,
});

const cubeShape = new CANNON.Box(new CANNON.Vec3(5, 5, 5));
const cubeBody = new CANNON.Body({
  mass: 1,
  material: slipperyMaterial
});
cubeBody.addShape(cubeShape);
cubeBody.position.set(0, 30, 0);
demo.world.addBody(cubeBody);

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


demo.start(() => {
  // Calculate the forward direction
  const forward = new THREE.Vector3(0, 0, -1);
  forward.applyQuaternion(cube.quaternion);
  forward.normalize();

  // Apply the velocity in the forward direction
  cubeBody.velocity.set(forward.x * speed * 5, cubeBody.velocity.y, forward.z * speed * 5);
  cubeBody.angularVelocity.set(0, rotationSpeed * 1, 0);
  cube.position.copy(cubeBody.position);
  cube.quaternion.copy(cubeBody.quaternion);
})
