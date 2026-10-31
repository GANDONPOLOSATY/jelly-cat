import * as THREE from 'three';

/**
 * Creates a clean, adorable 3D Cat:
 * - Rounded chubby body
 * - Cute pointed ears
 * - Paws
 * - Curved tail
 */
export function createCat3DModel(material: THREE.Material): THREE.Group {
  const catGroup = new THREE.Group();

  // 1. Chubby Body (Squashed Sphere)
  const bodyGeom = new THREE.SphereGeometry(1.2, 32, 24);
  bodyGeom.scale(1.15, 0.95, 1.05);
  const bodyMesh = new THREE.Mesh(bodyGeom, material);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  catGroup.add(bodyMesh);

  // 2. Head (slightly placed forward and up)
  const headGeom = new THREE.SphereGeometry(0.85, 32, 24);
  headGeom.scale(1.1, 0.95, 1.0);
  const headMesh = new THREE.Mesh(headGeom, material);
  headMesh.position.set(0, 0.75, 0.55);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  catGroup.add(headMesh);

  // 3. Cute Cat Ears (Pointed cones)
  const earGeom = new THREE.ConeGeometry(0.32, 0.65, 16);
  earGeom.scale(0.85, 1, 0.45);

  const leftEar = new THREE.Mesh(earGeom, material);
  leftEar.position.set(-0.48, 1.5, 0.45);
  leftEar.rotation.z = 0.28;
  leftEar.rotation.x = -0.15;
  leftEar.castShadow = true;
  catGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeom, material);
  rightEar.position.set(0.48, 1.5, 0.45);
  rightEar.rotation.z = -0.28;
  rightEar.rotation.x = -0.15;
  rightEar.castShadow = true;
  catGroup.add(rightEar);

  // 4. Front Paws (Soft rounded pills)
  const pawGeom = new THREE.SphereGeometry(0.28, 16, 16);
  pawGeom.scale(0.9, 0.65, 1.3);

  const leftPaw = new THREE.Mesh(pawGeom, material);
  leftPaw.position.set(-0.55, -0.75, 0.85);
  leftPaw.castShadow = true;
  catGroup.add(leftPaw);

  const rightPaw = new THREE.Mesh(pawGeom, material);
  rightPaw.position.set(0.55, -0.75, 0.85);
  rightPaw.castShadow = true;
  catGroup.add(rightPaw);

  // 5. Tail (Curved tube)
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.5, -1.0),
    new THREE.Vector3(0.2, -0.2, -1.35),
    new THREE.Vector3(0.45, 0.35, -1.45),
    new THREE.Vector3(0.65, 0.75, -1.3),
  ]);
  const tailGeom = new THREE.TubeGeometry(curve, 20, 0.12, 12, false);
  const tailMesh = new THREE.Mesh(tailGeom, material);
  tailMesh.castShadow = true;
  catGroup.add(tailMesh);

  // 6. Cute Eyes (Dark glossy with anime sparkles)
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x0f1423,
    roughness: 0.15,
    metalness: 0.1,
  });
  const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const eyeGeom = new THREE.SphereGeometry(0.12, 16, 16);
  eyeGeom.scale(1, 1.15, 0.4);

  // Left Eye
  const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
  leftEye.position.set(-0.35, 0.82, 1.36);

  const sp1 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), sparkleMat);
  sp1.position.set(-0.03, 0.04, 0.09);
  leftEye.add(sp1);
  const sp2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), sparkleMat);
  sp2.position.set(0.04, -0.03, 0.09);
  leftEye.add(sp2);
  catGroup.add(leftEye);

  // Right Eye
  const rightEye = leftEye.clone();
  rightEye.position.set(0.35, 0.82, 1.36);
  catGroup.add(rightEye);

  // Tiny pink nose
  const noseMat = new THREE.MeshStandardMaterial({ color: 0xff70a6, roughness: 0.3 });
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), noseMat);
  nose.position.set(0, 0.71, 1.44);
  catGroup.add(nose);

  // Cute Whiskers
  const whiskerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
  const whiskerGeom = new THREE.CylinderGeometry(0.007, 0.007, 0.4);

  const wL1 = new THREE.Mesh(whiskerGeom, whiskerMat);
  wL1.position.set(-0.62, 0.7, 1.25);
  wL1.rotation.z = Math.PI * 0.45;
  catGroup.add(wL1);

  const wR1 = new THREE.Mesh(whiskerGeom, whiskerMat);
  wR1.position.set(0.62, 0.7, 1.25);
  wR1.rotation.z = -Math.PI * 0.45;
  catGroup.add(wR1);

  return catGroup;
}
