/**
 * GradientFollow.js
 */
import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6';
import TWEEN from '@tweenjs/tween.js';

class GradientFollow {

  constructor() {

    this.mouse = new THREE.Vector2();
    this.scene;
    this.aspect;
    this.camera;
    this.controls;
    this.renderer;
    this.mesh;
    this.hemisphere;
    this.mouseLightSky;
    this.mouseLightGround;
    this.iteration = 0;
    this.previousColor;
    this.previousGroundColor;
    this.scrollStarted = false;
    this.tweening = false;
    this.orientationScale;

    this.build();

    window.addEventListener('mousemove', (e) => this.onMouseMove(e), false);

    window.addEventListener('deviceorientation', (e) => this.onDeviceMove(e), false);

    window.addEventListener('resize', () => {
      window.requestAnimationFrame(() => this.onResizeScene());
    }, false);

    document.body.addEventListener('mouseenter', (e) => this.tweenValues(e), false);

  }

  build() {

    this.buildScene();

    this.addMouseControls();

    this.colorShape();

    this.buildRenderer();

    this.animate();

  }

  addMouseControls() {

    this.controls = new OrbitControls(this.camera);

    this.controls.enableKeys = false;
    this.controls.enablePan = false;
    this.controls.enableRotate = false;

    this.controls.maxDistance = 9999;
    this.controls.minDistance = this.camera.position.z;

  }

  buildScene() {

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.aspect = window.innerWidth / window.innerHeight;
    this.orientationScale = Math.floor(this.aspect);
    this.camera = new THREE.PerspectiveCamera(45, this.aspect, 1, 10000);
    this.camera.position.z = window.innerHeight;

  }

  buildRenderer() {

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

  }

  colorShape() {

    const geometry = new THREE.CylinderGeometry(window.innerHeight / 2, window.innerHeight / 2, window.innerWidth, 32);

    const material = new THREE.MeshPhongMaterial({color: 0xffffff});

    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.rotation.z = Math.PI / 2;

    this.scene.add(this.mesh);

    this.hemisphere = new THREE.HemisphereLight(0x00ffe1, 0xff4e18, 1);

    this.scene.add(this.hemisphere);

    this.mouseLightSky = new THREE.SpotLight(0x00ffe1, 0.5, window.innerHeight / 3, 1, 1);

    this.scene.add(this.mouseLightSky);

    this.mouseLightGround = new THREE.SpotLight(0x00ffe1, 0.5, window.innerHeight / 3, 1, 1);

    this.scene.add(this.mouseLightGround);

  }

  onMouseMove(event) {

    this.mouse.x = event.clientX / window.innerWidth;
    this.mouse.y = event.clientY / window.innerHeight;

  }

  onDeviceMove(event) {

    if (event.gamma === null || event.beta === null) {
      return;
    }

    const config = {
      gamma: {
        min: -25,
        max: 25
      },
      beta: {
        min: 30,
        max: 65
      }
    }

    this.mouse.x = event.gamma / (-(config.gamma.min) + config.gamma.max) + 0.5;

    if (this.mouse.x < 0) {
      this.mouse.x = 0;
    } else if (this.mouse.x > 1) {
      this.mouse.x = 1;
    }

    this.mouse.y = (event.beta - config.beta.min) / (config.beta.max - config.beta.min);

    if (this.mouse.y < 0) {
      this.mouse.y = 0;
    } else if (this.mouse.y > 1) {
      this.mouse.y = 1;
    }

  }

  onResizeScene() {

    if (this.orientationScale !== Math.floor(window.innerWidth / window.innerHeight)) {
      return this.rebuild();
    }

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();

  }

  onScroll() {

    this.scrollStarted = true;

    this.controls.dispose();

    console.log('scroll started');

  }

  mouseAnimations() {

    const mouseSplitX = this.mouse.x * 2 - 1;

    this.camera.rotation.z = Math.PI / 14 * -mouseSplitX;

    this.mesh.scale.x = 1 + (window.innerWidth / window.innerHeight / 10 * Math.abs(mouseSplitX));

    this.hemisphere.color.setHSL(this.mouse.x / 14 + 0.01, 0.9, 0.5);

    this.hemisphere.groundColor.setHSL(this.mouse.y / 10 + 0.55, 0.9, 0.5);

  }

  rebuild() {

    document.body.removeChild(this.renderer.domElement);

    this.build();

  }

  tweenValues(event, firstTime = true) {

    this.tweening = true;

    if (event) {
      this.onMouseMove(event);
    }

    const animationSpeed = 300;

    const mouseSplitX = this.mouse.x * 2 - 1;

    new TWEEN.Tween({z: this.camera.rotation.z})
      .to({z: Math.PI / 14 * -mouseSplitX}, animationSpeed)
      .easing(TWEEN.Easing.Quartic.InOut)
      .onUpdate((_this) => {
        this.camera.rotation.z = _this.z;
      })
      .onComplete(() => {
        if (firstTime && (event.clientX !== this.mouse.x || event.clientY !== this.mouse.y)) {
          this.tweenValues(false, false);
        } else {
          this.tweening = false;
        }
      })
      .start();

    new TWEEN.Tween({x: this.mesh.scale.x})
      .to({x: 1 + (window.innerWidth / window.innerHeight / 10 * Math.abs(mouseSplitX))}, animationSpeed)
      .easing(TWEEN.Easing.Quartic.InOut)
      .onUpdate((_this) => {
        this.mesh.scale.x = _this.x;
      })
      .start();

    new TWEEN.Tween(this.hemisphere.color.getHSL())
      .to({h: this.mouse.x / 14 + 0.01}, animationSpeed)
      .easing(TWEEN.Easing.Quartic.InOut)
      .onUpdate((_this) => {
        this.hemisphere.color.setHSL(_this.h, _this.s, _this.l);
      })
      .start();

    new TWEEN.Tween(this.hemisphere.groundColor.getHSL())
      .to({h: this.mouse.y / 10 + 0.55}, animationSpeed)
      .easing(TWEEN.Easing.Quartic.InOut)
      .onUpdate((_this) => {
        this.hemisphere.groundColor.setHSL(_this.h, _this.s, _this.l);
      })
      .start();

  }

  mouseLightControl() {

    const mouseSplitX = this.mouse.x * 2 - 1;
    const mouseSplitY = -this.mouse.y * 2 + 1;
    const distance = window.innerHeight / 3 * 2;

    this.mouseLightSky.position.set(mouseSplitX * (window.innerWidth / 4), mouseSplitY * (window.innerHeight / 4), distance);
    this.mouseLightGround.position.set(mouseSplitX * (window.innerWidth / 4), mouseSplitY * (window.innerHeight / 4), distance);

    this.mouseLightSky.color.setHSL(this.mouse.x / 14 + 0.01, 0.8, 0.5);
    this.mouseLightGround.color.setHSL(this.mouse.y / 10 + 0.55, 0.8, 0.5);

    this.mouseLightSky.intensity = -(this.mouse.y / 10 - (1 / 10));
    this.mouseLightGround.intensity = this.mouse.y / 10;

  }

  animate(time) {

    requestAnimationFrame(() => this.animate());

    if (this.tweening) {
      TWEEN.update(time);
    } else {
      this.mouseAnimations();
    }

    this.mouseLightControl();

    if (this.camera.position.z > this.controls.minDistance && !this.scrollStarted) {
      this.onScroll();
    }

    this.render();

  }

  render() {

    this.renderer.render(this.scene, this.camera);

  }

}
new GradientFollow();