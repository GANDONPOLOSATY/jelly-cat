import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { CatSkin3D } from '../skins3d';
import { sound } from '../audio';
import { createCat3DModel } from '../jellyModel';

interface JellyView3DProps {
  skin: CatSkin3D;
  lightDirection: number;
  quality: 'Low' | 'Medium' | 'Ultra';
  enableBlur: boolean;
  onPet: () => void;
  onSquish: () => void;
}

export const JellyView3D: React.FC<JellyView3DProps> = ({
  skin,
  lightDirection,
  quality,
  enableBlur,
  onPet,
  onSquish,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const catGroupRef = useRef<THREE.Group | null>(null);
  const catMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);

  // Squish spring physics (Scale & Shear)
  const scaleRef = useRef(new THREE.Vector3(1, 1, 1));
  const targetScaleRef = useRef(new THREE.Vector3(1, 1, 1));
  const scaleVelRef = useRef(new THREE.Vector3(0, 0, 0));

  const rotRef = useRef(new THREE.Euler(0, 0, 0));
  const targetRotRef = useRef(new THREE.Euler(0, 0, 0));
  const rotVelRef = useRef(new THREE.Vector3(0, 0, 0));

  const isPointerDownRef = useRef(false);
  const lastPointerPosRef = useRef({ x: 0, y: 0 });
  const petDistanceRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f3f6);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 0.8, 5.2);
    camera.lookAt(0, 0.1, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: quality !== 'Low',
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'Ultra' ? 2 : 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.8);
    dirLight.position.set(3, 6, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(-4, 2, -4);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(skin.glowColor, 3, 6);
    pointLight.position.set(0, 0.4, 0);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // 4. Studio Floor Platform (bevel track like in TikTok video)
    const floorGeom = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xebedf2,
      roughness: 0.5,
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Studio track bevel slot (under the cat)
    const slotGeom = new THREE.CylinderGeometry(1.9, 1.9, 0.1, 32);
    const slotMat = new THREE.MeshStandardMaterial({ color: 0xdde0e8, roughness: 0.6 });
    const slot = new THREE.Mesh(slotGeom, slotMat);
    slot.position.set(0, -1.02, 0);
    slot.receiveShadow = true;
    scene.add(slot);

    // 5. Jelly Physical Material (Real 3D glass transmission shader)
    const jellyMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(skin.color),
      emissive: new THREE.Color(skin.color).multiplyScalar(0.1),
      roughness: skin.roughness,
      metalness: 0.05,
      transmission: skin.transmission,
      ior: skin.ior,
      thickness: skin.thickness,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      attenuationColor: new THREE.Color(skin.glowColor),
      attenuationDistance: 1.5,
      transparent: true,
      opacity: 0.98,
    });
    catMaterialRef.current = jellyMaterial;

    // 6. Build Clean 3D Cat Model
    const catModel = createCat3DModel(jellyMaterial);
    scene.add(catModel);
    catGroupRef.current = catModel;

    // 7. Interaction Handlers
    const handlePointerDown = (e: PointerEvent) => {
      container.setPointerCapture(e.pointerId);
      isPointerDownRef.current = true;
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

      sound.startPurr();
      sound.playSquish(0.9);
      onSquish();

      // Immediate squish bounce: squash Y, stretch X and Z
      targetScaleRef.current.set(1.28, 0.72, 1.25);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current) return;

      const dx = e.clientX - lastPointerPosRef.current.x;
      const dy = e.clientY - lastPointerPosRef.current.y;
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

      petDistanceRef.current += Math.hypot(dx, dy);
      if (petDistanceRef.current > 180) {
        petDistanceRef.current = 0;
        onPet();
        sound.playSquish(0.4);
      }

      // Drag squish & tilt
      const tiltX = THREE.MathUtils.clamp(-dy * 0.008, -0.4, 0.4);
      const tiltY = THREE.MathUtils.clamp(dx * 0.008, -0.6, 0.6);
      targetRotRef.current.x = tiltX;
      targetRotRef.current.y = tiltY;

      // Dynamic stretch based on drag speed
      const speed = Math.hypot(dx, dy);
      const stretch = Math.min(speed * 0.015, 0.45);
      if (Math.abs(dx) > Math.abs(dy)) {
        targetScaleRef.current.set(1 + stretch, 1 - stretch * 0.5, 1);
      } else {
        targetScaleRef.current.set(1 - stretch * 0.5, 1 + stretch, 1 - stretch * 0.5);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isPointerDownRef.current) {
        isPointerDownRef.current = false;
        try {
          container.releasePointerCapture(e.pointerId);
        } catch {}
        sound.stopPurr();
        sound.playBoing();

        // Release rebound to neutral scale with overshoot
        targetScaleRef.current.set(1, 1, 1);
        targetRotRef.current.set(0, 0, 0);

        // Add energetic rebound impulse
        scaleVelRef.current.set(
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.15
        );
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointercancel', handlePointerUp);

    // 8. Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation Loop with Spring Harmonic Physics
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();
      const delta = Math.min(clock.getDelta(), 0.04);

      if (catGroupRef.current) {
        const cat = catGroupRef.current;

        // Idle breathing and gentle floating bob
        const breathe = Math.sin(time * 2.8) * 0.025;
        const idleRot = Math.sin(time * 0.8) * 0.06;

        // Spring physics for scale (Jelly Jiggle)
        const springK = 80.0;
        const damp = 0.84;

        const curS = scaleRef.current;
        const tgtS = targetScaleRef.current;
        const velS = scaleVelRef.current;

        velS.x = (velS.x + (tgtS.x - curS.x) * springK * delta) * damp;
        velS.y = (velS.y + (tgtS.y - curS.y) * springK * delta) * damp;
        velS.z = (velS.z + (tgtS.z - curS.z) * springK * delta) * damp;

        curS.add(velS);

        // Apply scale with breathing modulation
        cat.scale.set(
          curS.x * (1 - breathe * 0.4),
          curS.y * (1 + breathe),
          curS.z * (1 - breathe * 0.4)
        );

        // Spring physics for rotation
        const curR = rotRef.current;
        const tgtR = targetRotRef.current;
        const velR = rotVelRef.current;

        velR.x = (velR.x + (tgtR.x - curR.x) * springK * delta) * damp;
        velR.y = (velR.y + (tgtR.y + idleRot - curR.y) * springK * delta) * damp;

        curR.x += velR.x;
        curR.y += velR.y;

        cat.rotation.set(curR.x, curR.y, 0);
        cat.position.y = -0.2 + breathe * 0.6;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointercancel', handlePointerUp);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [quality]);

  // Update light direction slider
  useEffect(() => {
    if (dirLightRef.current) {
      const angle = (lightDirection - 0.5) * Math.PI * 1.4;
      dirLightRef.current.position.set(
        Math.sin(angle) * 6,
        5.5,
        Math.cos(angle) * 5
      );
    }
  }, [lightDirection]);

  // Update materials
  useEffect(() => {
    if (catMaterialRef.current) {
      const mat = catMaterialRef.current;
      mat.color.set(skin.color);
      mat.emissive.set(skin.color).multiplyScalar(0.1);
      mat.roughness = skin.roughness;
      mat.transmission = skin.transmission;
      mat.ior = skin.ior;
      mat.thickness = skin.thickness;
      mat.attenuationColor.set(skin.glowColor);
      mat.needsUpdate = true;
    }
    if (pointLightRef.current) {
      pointLightRef.current.color.set(skin.glowColor);
    }
  }, [skin]);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full relative cursor-grab active:cursor-grabbing select-none touch-none ${
        enableBlur ? 'filter blur-[1.5px]' : ''
      }`}
    />
  );
};
