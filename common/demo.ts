import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "lil-gui";
import * as CANNON from "cannon-es";

export class Demo {
  gui: dat.GUI;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  world: CANNON.World;
  worldManual = false;
  time = 0;

  constructor() {
    this.createGUI();
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createControls();
    this.createWorld();

    this.addLights();
    this.addEventListeners();
  }

  createGUI() {
    this.gui = new dat.GUI({ width: 300 });
  }

  createScene() {
    this.scene = new THREE.Scene();
    const axesHelper = new THREE.AxesHelper(50);
    axesHelper.visible = false;
    this.gui.add(axesHelper, "visible").name("Axes Helper");
    this.scene.add(axesHelper);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      1,
      20000,
    );
    this.camera.position.set(100, 30, 100);
    let cameraGui = this.gui.addFolder("Camera").close();
    cameraGui.add(this.camera.position, "x", -100, 100);
    cameraGui.add(this.camera.position, "y", -100, 100);
    cameraGui.add(this.camera.position, "z", -100, 100);
  }

  createRenderer() {
    console.log("Creating renderer...");
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.5;
    document.body.appendChild(this.renderer.domElement);
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxPolarAngle = Math.PI * 0.995;
    this.controls.target.set(0, 0, 0);
    this.controls.minDistance = 10.0;
    this.controls.maxDistance = 1000.0;
    this.controls.update();
  }

  createWorld() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    let worldGui = this.gui.addFolder("World");
    worldGui.add(this, "worldManual").name("Manual World");
    worldGui.add(this, "runWorld").name("Run World");
    worldGui.add(this.world.gravity, "y", -20, 20).name("Gravity").listen();
  }

  runWorld() {
    const duration = 1 / 60;
    this.world.step(duration);
    this.time += duration;
  }

  addLights() {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    this.scene.add(directionalLight);
    const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
    helper.visible = false;
    this.scene.add(helper);
    let lightGui = this.gui.addFolder("Light");

    let v = new THREE.Vector3(0.5, 0.5, 1);
    let onLightChange = () => {
      directionalLight.position.copy(v.clone().normalize());
      helper.update();
    }
    onLightChange();

    lightGui.add(v, "x", -10, 10).onChange(onLightChange);
    lightGui.add(v, "y", -10, 10).onChange(onLightChange);
    lightGui.add(v, "z", -10, 10).onChange(onLightChange);
    lightGui.add(helper, "visible").name("Helper");

    const ambientLight = new THREE.AmbientLight(0x707070, 2);
    this.scene.add(ambientLight);
  }

  addEventListeners() {
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  start(callback = (time: number) => { }) {
    const animate = () => {
      requestAnimationFrame(animate);
      if (!this.worldManual) {
        this.runWorld();
      }
      if (callback) {
        callback(this.time);
      }
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }
}
