import * as THREE from "three";
import * as CANNON from "cannon-es";

import { Demo } from "../common/demo";

const demo = new Demo();

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
demo.world.addBody(heightfieldBody)

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xff0000 }),
);
demo.scene.add(sphere);

const sphereShape = new CANNON.Sphere(1)
const sphereBody = new CANNON.Body()
sphereBody.addShape(sphereShape)
sphereBody.position.set(2.5, 3, 2.5)
sphereBody.position.vadd(heightfieldBody.position, sphereBody.position)
demo.world.addBody(sphereBody)

demo.start(() => {
  sphere.position.copy(sphereBody.position);
  sphere.quaternion.copy(sphereBody.quaternion);
});
