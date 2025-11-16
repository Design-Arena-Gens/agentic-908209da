"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type PlatformType = "static" | "moving";

interface PlatformSpec {
  center: THREE.Vector3;
  size: THREE.Vector3;
  color: number;
  type?: PlatformType;
  amplitude?: number;
  axis?: "x" | "z";
  speed?: number;
  phase?: number;
  deadly?: boolean;
}

interface RotatorSpec {
  radius: number;
  height: number;
  speed: number;
  pivot: THREE.Vector3;
  deadly: boolean;
}

const PLAYER_HEIGHT = 1.8;
const PLAYER_WIDTH = 0.9;
const GRAVITY = -22;
const MOVE_SPEED = 8;
const JUMP_FORCE = 10;

const PLATFORM_SPECS: PlatformSpec[] = [
  { center: new THREE.Vector3(0, 0.25, 0), size: new THREE.Vector3(30, 0.5, 30), color: 0xf7f7f7 },
  { center: new THREE.Vector3(0, 2.5, -12), size: new THREE.Vector3(6, 0.5, 6), color: 0xff3d57 },
  { center: new THREE.Vector3(0, 4.5, -20), size: new THREE.Vector3(3, 0.5, 3), color: 0x3ad03a },
  { center: new THREE.Vector3(4, 6.5, -26), size: new THREE.Vector3(3, 0.5, 3), color: 0xffa500 },
  { center: new THREE.Vector3(8, 8.5, -32), size: new THREE.Vector3(3, 0.5, 3), color: 0xfff266 },
  {
    center: new THREE.Vector3(12, 8.5, -38),
    size: new THREE.Vector3(3, 0.5, 3),
    color: 0x4c8dff,
    type: "moving",
    axis: "x",
    amplitude: 2.5,
    speed: 1.2,
    phase: 0
  },
  {
    center: new THREE.Vector3(16, 8.5, -44),
    size: new THREE.Vector3(3, 0.5, 3),
    color: 0xfb65ff,
    type: "moving",
    axis: "z",
    amplitude: 3.5,
    speed: 1.6,
    phase: Math.PI / 2
  },
  { center: new THREE.Vector3(20, 8.5, -50), size: new THREE.Vector3(6, 0.5, 6), color: 0x64ffda },
  {
    center: new THREE.Vector3(20, 7.01, -56),
    size: new THREE.Vector3(6, 0.2, 12),
    color: 0xff5a3c,
    deadly: true
  },
  { center: new THREE.Vector3(20, 9.5, -62), size: new THREE.Vector3(3, 0.5, 3), color: 0x5eff7d },
  { center: new THREE.Vector3(16, 11, -66), size: new THREE.Vector3(3, 0.5, 3), color: 0x5e9aff },
  { center: new THREE.Vector3(12, 12.5, -70), size: new THREE.Vector3(3, 0.5, 3), color: 0xff9bf0 },
  { center: new THREE.Vector3(8, 13.5, -74), size: new THREE.Vector3(3, 0.5, 3), color: 0xffc857 },
  { center: new THREE.Vector3(4, 14.5, -78), size: new THREE.Vector3(3, 0.5, 3), color: 0x52d1ff },
  { center: new THREE.Vector3(0, 15.5, -82), size: new THREE.Vector3(8, 0.5, 8), color: 0x7dff9b }
];

const ROTATOR_SPECS: RotatorSpec[] = [
  {
    radius: 8,
    height: 0.4,
    speed: 1.2,
    pivot: new THREE.Vector3(0, 1.2, -10),
    deadly: false
  },
  {
    radius: 6,
    height: 0.4,
    speed: 1.6,
    pivot: new THREE.Vector3(20, 9, -60),
    deadly: true
  }
];

export default function Page() {
  return (
    <main style={{ height: "100dvh", width: "100dvw" }}>
      <ObbyScene />
    </main>
  );
}

function ObbyScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa5d8ff);

    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / mount.clientHeight,
      0.1,
      500
    );
    camera.position.set(0, 3, 6);

    const ambient = new THREE.HemisphereLight(0xffffff, 0xbad1ff, 0.9);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(12, 24, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);

    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xc5ecff });
    const baseGeometry = new THREE.BoxGeometry(200, 0.5, 200);
    const base = new THREE.Mesh(baseGeometry, groundMaterial);
    base.position.set(0, -0.25, 0);
    base.receiveShadow = true;
    scene.add(base);

    const playerGeometry = new THREE.BoxGeometry(PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_WIDTH);
    const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xfff6d3 });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.castShadow = true;
    player.position.set(0, PLAYER_HEIGHT / 2 + 1, 12);
    scene.add(player);

    const headGeometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffe0a3 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, PLAYER_HEIGHT / 2 + 0.8, 0);
    player.add(head);

    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.1, 0.4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x0096ff });
    const torso = new THREE.Mesh(bodyGeometry, bodyMaterial);
    torso.position.set(0, -0.15, 0);
    player.add(torso);

    const armGeometry = new THREE.BoxGeometry(0.25, 0.9, 0.25);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0xfff6d3 });
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.6, -0.05, 0);
    player.add(leftArm);
    const rightArm = leftArm.clone();
    rightArm.position.set(0.6, -0.05, 0);
    player.add(rightArm);

    const legGeometry = new THREE.BoxGeometry(0.35, 0.95, 0.35);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x0034b3 });
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.25, -1, 0);
    player.add(leftLeg);
    const rightLeg = leftLeg.clone();
    rightLeg.position.set(0.25, -1, 0);
    player.add(rightLeg);

    const platformMeshes = PLATFORM_SPECS.map((spec) => {
      const geometry = new THREE.BoxGeometry(spec.size.x, spec.size.y, spec.size.z);
      const material = new THREE.MeshStandardMaterial({ color: spec.color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.copy(spec.center);
      scene.add(mesh);
      return { mesh, spec, basePosition: spec.center.clone() };
    });

    const deadlyMeshes: THREE.Mesh[] = [];
    platformMeshes.forEach(({ mesh, spec }) => {
      if (spec.deadly) deadlyMeshes.push(mesh);
    });

    const rotatorMeshes = ROTATOR_SPECS.map((rotSpec) => {
      const pivot = new THREE.Object3D();
      pivot.position.copy(rotSpec.pivot);
      scene.add(pivot);

      const beamGeometry = new THREE.BoxGeometry(rotSpec.radius * 2, rotSpec.height, 0.6);
      const beamMaterial = new THREE.MeshStandardMaterial({
        color: rotSpec.deadly ? 0xff2929 : 0xfff066,
        emissive: rotSpec.deadly ? new THREE.Color(0xff5555) : new THREE.Color(0x332200),
        emissiveIntensity: rotSpec.deadly ? 0.4 : 0.15
      });
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      beam.castShadow = true;
      beam.position.set(0, 0, 0);
      pivot.add(beam);
      return { pivot, beam, spec: rotSpec };
    });

    const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({ color: 0xb7e5ff, side: THREE.BackSide });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    const keyState = new Set<string>();
    const pointer = { yaw: Math.PI, pitch: -0.2, locked: false };
    const velocity = new THREE.Vector3();
    const moveVector = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const upVector = new THREE.Vector3(0, 1, 0);
    const playerBox = new THREE.Box3();
    const tempBox = new THREE.Box3();
    const tempBox2 = new THREE.Box3();
    const unitX = new THREE.Vector3(1, 0, 0);
    const unitZ = new THREE.Vector3(0, 0, 1);
    const cameraOffset = new THREE.Vector3(0, 2.6, 6.5);
    const cameraTarget = new THREE.Vector3();
    const cameraOffsetRotated = new THREE.Vector3();
    const cameraQuaternion = new THREE.Quaternion();
    const cameraEuler = new THREE.Euler();
    const platformBoxes = platformMeshes.map(() => new THREE.Box3());
    const desiredCameraPosition = new THREE.Vector3();
    let prevTimestamp = 0;
    let onGround = false;
    const spawnPoint = new THREE.Vector3(0, PLAYER_HEIGHT / 2 + 1, 12);
    const previousPosition = new THREE.Vector3().copy(player.position);

    const handleKeyDown = (event: KeyboardEvent) => {
      keyState.add(event.code);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      keyState.delete(event.code);
    };
    const handlePointerDown = () => {
      renderer.domElement.requestPointerLock();
    };
    const handlePointerMove = (event: MouseEvent) => {
      if (!pointer.locked) return;
      pointer.yaw -= event.movementX * 0.0035;
      pointer.pitch = THREE.MathUtils.clamp(pointer.pitch - event.movementY * 0.003, -0.45, 0.45);
    };
    const handlePointerLockChange = () => {
      pointer.locked = document.pointerLockElement === renderer.domElement;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    renderer.domElement.addEventListener("click", handlePointerDown);
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("mousemove", handlePointerMove);

    const resizeObserver = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(mount);

    const updateMovement = (delta: number) => {
      forward.set(Math.sin(pointer.yaw), 0, Math.cos(pointer.yaw)).normalize();
      right.crossVectors(forward, upVector).negate().normalize();
      moveVector.set(0, 0, 0);
      if (keyState.has("KeyW")) moveVector.add(forward);
      if (keyState.has("KeyS")) moveVector.addScaledVector(forward, -1);
      if (keyState.has("KeyD")) moveVector.add(right);
      if (keyState.has("KeyA")) moveVector.addScaledVector(right, -1);

      if (moveVector.lengthSq()) moveVector.normalize();

      const acceleration = MOVE_SPEED * (onGround ? 1 : 0.6);
      velocity.x = THREE.MathUtils.damp(velocity.x, moveVector.x * acceleration, 10, delta);
      velocity.z = THREE.MathUtils.damp(velocity.z, moveVector.z * acceleration, 10, delta);

      if (onGround && keyState.has("Space")) {
        velocity.y = JUMP_FORCE;
        onGround = false;
      }

      velocity.y += GRAVITY * delta;
      velocity.y = Math.max(velocity.y, -50);
    };

    const handleRespawn = () => {
      player.position.copy(spawnPoint);
      velocity.set(0, 0, 0);
      pointer.yaw = Math.PI;
      pointer.pitch = -0.2;
    };

    const animate = (timestamp: number) => {
      const delta = Math.min((timestamp - prevTimestamp) / 1000 || 0.016, 0.05);
      prevTimestamp = timestamp;

      rotatorMeshes.forEach(({ pivot, spec }) => {
        pivot.rotation.y += spec.speed * delta;
      });

      platformMeshes.forEach((entry, index) => {
        const { mesh, spec, basePosition } = entry;
        if (spec.type === "moving" && spec.amplitude && spec.speed) {
          const axis = spec.axis === "x" ? unitX : unitZ;
          const offset =
            Math.sin(timestamp * 0.001 * spec.speed + (spec.phase ?? 0)) * spec.amplitude;
          mesh.position.copy(basePosition).addScaledVector(axis, offset);
        }
        platformBoxes[index].setFromCenterAndSize(mesh.position, spec.size);
      });

      updateMovement(delta);

      previousPosition.copy(player.position);
      player.position.x += velocity.x * delta;
      player.position.y += velocity.y * delta;
      player.position.z += velocity.z * delta;

      playerBox.setFromCenterAndSize(player.position, new THREE.Vector3(PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_WIDTH));
      onGround = false;

      platformMeshes.forEach((entry, index) => {
        const box = platformBoxes[index];
        if (!playerBox.intersectsBox(box)) return;

        const spec = entry.spec;
        const platformTop = box.max.y;
        const playerBottom = player.position.y - PLAYER_HEIGHT / 2;
        const prevBottom = previousPosition.y - PLAYER_HEIGHT / 2;

        if (prevBottom >= platformTop - 0.05 && velocity.y <= 0) {
          player.position.y = platformTop + PLAYER_HEIGHT / 2;
          velocity.y = 0;
          onGround = !spec.deadly;
        } else {
          player.position.copy(previousPosition);
          velocity.x = 0;
          velocity.z = 0;
        }

        if (spec.deadly) {
          handleRespawn();
        }
      });

      rotatorMeshes.forEach(({ beam, spec }) => {
        tempBox.setFromObject(beam);
        if (tempBox.intersectsBox(playerBox)) {
          if (spec.deadly) {
            handleRespawn();
          } else {
            velocity.x += Math.sin(pointer.yaw) * 2;
            velocity.z += Math.cos(pointer.yaw) * 2;
          }
        }
      });

      deadlyMeshes.forEach((mesh) => {
        tempBox2.setFromObject(mesh);
        if (tempBox2.intersectsBox(playerBox)) {
          handleRespawn();
        }
      });

      if (player.position.y < -10) {
        handleRespawn();
      }

      cameraTarget.copy(player.position);
      cameraTarget.y += 0.9;
      cameraEuler.set(pointer.pitch, pointer.yaw, 0, "YXZ");
      cameraQuaternion.setFromEuler(cameraEuler);
      cameraOffsetRotated.copy(cameraOffset).applyQuaternion(cameraQuaternion);
      desiredCameraPosition.copy(cameraTarget).add(cameraOffsetRotated);
      camera.position.lerp(desiredCameraPosition, 0.12);
      camera.lookAt(cameraTarget);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    let frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      document.removeEventListener("mousemove", handlePointerMove);
      renderer.domElement.removeEventListener("click", handlePointerDown);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
    };
  }, []);

  return <div ref={mountRef} style={{ height: "100%", width: "100%" }} />;
}
