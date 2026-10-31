import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { CatSkin3D } from '../skins3d';
import { sound } from '../audio';
import { createJellyCatGeometry, createCatFaceGroup } from '../jellyModel';

interface JellyView3DProps {
  skin: CatSkin3D;
  lightDirection: number; // 0 to 1 slider as in the reference video
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

  // References to 3D entities
  const catMeshRef = useRef<THREE.Mesh | null>(null);
  const faceGroupRef = useRef<THREE.Group | null>(null);
  const catMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);
  const floorMeshRef = useRef<THREE.Mesh | null>(null);

  // Deformation & Physics
  const originalPositionsRef = useRef<Float32Array | null>(null);
  const currentVelocitiesRef = useRef<Float32Array | null>(null);

  // Mouse / Pointer Drag state
  const isPointerDownRef = useRef(false);
  const lastPointerPosRef = useRef({ x: 0, y: 0 });
  const dragPlaneIntersectRef = useRef<THREE.Vector3 | null>(null);
  const dragForceRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());

  // Pet distance tracker
  const petDistanceRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f2f5);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.2, 5.5);
    camera.lookAt(0, 0.2, 0);
    cameraRef.current = camera;

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

    // 2. Lighting (Studio light matching the TikTok video)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.8);
    dirLight.position.set(3, 6, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = quality === 'Ultra' ? 2048 : 1024;
    dirLight.shadow.mapSize.height = quality === 'Ultra' ? 2048 : 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 15;
    dirLight.shadow.camera.left = -3;
    dirLight.shadow.camera.right = 3;
    dirLight.shadow.camera.top = 3;
    dirLight.shadow.camera.bottom = -3;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Rim/Back Light to accentuate transmission & glass edges
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.6);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    // Glowing point light centered inside the jelly cat
    const pointLight = new THREE.PointLight(skin.glowColor, 3.5, 7);
    pointLight.position.set(0, 0.3, 0);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // 3. Studio Stage Backdrop & Ground (Soft bevel floor)
    const floorGeom = new THREE.PlaneGeometry(30, 30, 32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xebedf2,
      roughness: 0.45,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    floor.receiveShadow = true;
    scene.add(floor);
    floorMeshRef.current = floor;

    // Ground indentation slot (like in the video's slider track)
    const slotGeom = new THREE.BoxGeometry(4.8, 0.15, 1.8);
    const slotMat = new THREE.MeshStandardMaterial({
      color: 0xd8dbe2,
      roughness: 0.6,
    });
    const slot = new THREE.Mesh(slotGeom, slotMat);
    slot.position.set(0, -1.25, 0);
    slot.receiveShadow = true;
    scene.add(slot);

    // 4. Jelly Physical Material (Real 3D transmission shader like in video)
    const jellyMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(skin.color),
      emissive: new THREE.Color(skin.color).multiplyScalar(0.12),
      roughness: skin.roughness,
      metalness: 0.05,
      transmission: skin.transmission,
      ior: skin.ior,
      thickness: skin.thickness,
      specularIntensity: 1.2,
      specularColor: new THREE.Color(0xffffff),
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      attenuationColor: new THREE.Color(skin.glowColor),
      attenuationDistance: 1.4,
      transparent: true,
      opacity: 0.98,
    });
    catMaterialRef.current = jellyMaterial;

    // 5. Build Cat Mesh & Cache Vertices
    const geometry = createJellyCatGeometry();
    const catMesh = new THREE.Mesh(geometry, jellyMaterial);
    catMesh.castShadow = true;
    catMesh.receiveShadow = true;
    catMesh.position.set(0, 0, 0);
    scene.add(catMesh);
    catMeshRef.current = catMesh;

    // Cache initial vertex positions & velocity buffers
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const vertexCount = posAttr.count;
    const origPos = new Float32Array(posAttr.array.length);
    origPos.set(posAttr.array);
    originalPositionsRef.current = origPos;
    currentVelocitiesRef.current = new Float32Array(posAttr.array.length);

    // Face Group
    const face = createCatFaceGroup();
    catMesh.add(face);
    faceGroupRef.current = face;

    // 6. Raycasting & Interaction Planes
    const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const getPointerNDC = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      return new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
    };

    const handlePointerDown = (e: PointerEvent) => {
      container.setPointerCapture(e.pointerId);
      isPointerDownRef.current = true;
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

      const ndc = getPointerNDC(e.clientX, e.clientY);
      raycasterRef.current.setFromCamera(ndc, camera);

      // Check intersection with cat
      const intersects = raycasterRef.current.intersectObject(catMesh, false);
      if (intersects.length > 0) {
        sound.startPurr();
        sound.playSquish(0.9);
        onSquish();

        const hitPoint = intersects[0].point;
        dragPlaneIntersectRef.current = hitPoint.clone();

        // Apply instant radial impulse to vertices around hit point
        const pos = geometry.attributes.position as THREE.BufferAttribute;
        const vels = currentVelocitiesRef.current;
        if (vels) {
          const v = new THREE.Vector3();
          for (let i = 0; i < vertexCount; i++) {
            v.fromBufferAttribute(pos, i);
            const d = v.distanceTo(hitPoint);
            if (d < 1.4) {
              const push = (1 - d / 1.4) * 0.45;
              const dir = v.clone().sub(hitPoint).normalize();
              vels[i * 3] += dir.x * push;
              vels[i * 3 + 1] += dir.y * push;
              vels[i * 3 + 2] += dir.z * push;
            }
          }
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current) return;

      const dx = e.clientX - lastPointerPosRef.current.x;
      const dy = e.clientY - lastPointerPosRef.current.y;
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

      // Accumulate pet distance
      petDistanceRef.current += Math.hypot(dx, dy);
      if (petDistanceRef.current > 180) {
        petDistanceRef.current = 0;
        onPet();
        sound.playSquish(0.4);
      }

      // Drag projection on 3D plane
      const ndc = getPointerNDC(e.clientX, e.clientY);
      raycasterRef.current.setFromCamera(ndc, camera);
      const planeIntersect = new THREE.Vector3();
      raycasterRef.current.ray.intersectPlane(interactionPlane, planeIntersect);

      if (planeIntersect) {
        dragForceRef.current.set(
          (dx / container.clientWidth) * 6,
          (-dy / container.clientHeight) * 6,
          0
        );

        // Pull closest vertices towards pointer
        const pos = geometry.attributes.position as THREE.BufferAttribute;
        const vels = currentVelocitiesRef.current;
        if (vels) {
          const v = new THREE.Vector3();
          for (let i = 0; i < vertexCount; i++) {
            v.fromBufferAttribute(pos, i);
            const d = v.distanceTo(planeIntersect);
            if (d < 1.8) {
              const pullFactor = Math.pow(1 - d / 1.8, 1.5) * 0.35;
              vels[i * 3] += dragForceRef.current.x * pullFactor;
              vels[i * 3 + 1] += dragForceRef.current.y * pullFactor;
              vels[i * 3 + 2] += (Math.random() - 0.5) * 0.1;
            }
          }
        }
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

        // Release rebound shockwave
        const vels = currentVelocitiesRef.current;
        if (vels) {
          for (let i = 0; i < vertexCount; i++) {
            vels[i * 3] *= 1.4;
            vels[i * 3 + 1] *= 1.4;
          }
        }
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointercancel', handlePointerUp);

    // 7. Resize handling
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation & Physics Simulation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();
      const delta = Math.min(clock.getDelta(), 0.05);

      // Idle breathing and slight float
      const breathe = Math.sin(time * 2.8) * 0.04;
      catMesh.position.y = breathe;
      catMesh.rotation.y = Math.sin(time * 0.9) * 0.08;

      // Soft body spring physics simulation across all mesh vertices
      const pos = geometry.attributes.position as THREE.BufferAttribute;
      const positions = pos.array as Float32Array;
      const originals = originalPositionsRef.current;
      const vels = currentVelocitiesRef.current;

      if (originals && vels) {
        const springK = 14.0; // Hooke's spring constant
        const damping = 0.88; // Jelly dampening

        for (let i = 0; i < vertexCount; i++) {
          const idx = i * 3;

          // Displacements from rest
          const dx = originals[idx] - positions[idx];
          const dy = originals[idx + 1] - positions[idx + 1];
          const dz = originals[idx + 2] - positions[idx + 2];

          // Acceleration = Spring force
          vels[idx] = (vels[idx] + dx * springK * delta) * damping;
          vels[idx + 1] = (vels[idx + 1] + dy * springK * delta) * damping;
          vels[idx + 2] = (vels[idx + 2] + dz * springK * delta) * damping;

          // Integrate position
          positions[idx] += vels[idx];
          positions[idx + 1] += vels[idx + 1];
          positions[idx + 2] += vels[idx + 2];
        }

        pos.needsUpdate = true;
        geometry.computeVertexNormals();
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

  // Update light direction slider (like in TikTok video)
  useEffect(() => {
    if (dirLightRef.current) {
      // Map 0..1 to an angle around the cat
      const angle = (lightDirection - 0.5) * Math.PI * 1.4;
      dirLightRef.current.position.set(
        Math.sin(angle) * 6,
        5.5,
        Math.cos(angle) * 5
      );
    }
  }, [lightDirection]);

  // Update Skin 3D Materials dynamically
  useEffect(() => {
    if (catMaterialRef.current) {
      const mat = catMaterialRef.current;
      mat.color.set(skin.color);
      mat.emissive.set(skin.color).multiplyScalar(0.12);
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
