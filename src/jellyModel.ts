import * as THREE from 'three';

/**
 * Creates an organic 3D Cat geometry by merging a smooth blob body,
 * two pointed cat ears, a tail base, and cheeks into a single continuous buffer geometry.
 */
export function createJellyCatGeometry(): THREE.BufferGeometry {
  // Base teardrop body (subdivided sphere)
  const geom = new THREE.SphereGeometry(1.5, 64, 48);
  const pos = geom.attributes.position as THREE.BufferAttribute;

  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    // Flatten bottom slightly so it sits comfortably
    if (v.y < -0.3) {
      v.y *= 0.75;
      v.x *= 1.12;
      v.z *= 1.12;
    }

    // Chubby cute cheeks on the front (+z)
    if (v.z > 0.4 && v.y > -0.4 && v.y < 0.5) {
      const cheekFactor = Math.abs(v.x) * 0.35;
      v.z += cheekFactor * 0.45;
      v.x += Math.sign(v.x) * 0.2;
    }

    // Cat ears extrusion on the top (+y)
    // Left ear around x ~ -0.7, y ~ 1.1, z ~ 0.2
    // Right ear around x ~ 0.7, y ~ 1.1, z ~ 0.2
    const earDistLeft = Math.hypot(v.x - (-0.72), v.y - 1.1, v.z - 0.15);
    const earDistRight = Math.hypot(v.x - 0.72, v.y - 1.1, v.z - 0.15);

    if (earDistLeft < 0.75) {
      const earInfluence = Math.pow(1 - earDistLeft / 0.75, 1.8);
      v.y += earInfluence * 0.95;
      v.x -= earInfluence * 0.22;
      v.z += earInfluence * 0.15;
    } else if (earDistRight < 0.75) {
      const earInfluence = Math.pow(1 - earDistRight / 0.75, 1.8);
      v.y += earInfluence * 0.95;
      v.x += earInfluence * 0.22;
      v.z += earInfluence * 0.15;
    }

    // Cute perky tail extrusion on the back (-z)
    const tailDist = Math.hypot(v.x - 0.6, v.y - (-0.3), v.z - (-1.2));
    if (tailDist < 0.8) {
      const tailInf = Math.pow(1 - tailDist / 0.8, 1.6);
      v.z -= tailInf * 0.65;
      v.y += tailInf * 0.4;
      v.x += tailInf * 0.2;
    }

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * Creates 3D eyes and cute inner details that float inside or on the surface of the jelly
 */
export function createCatFaceGroup(): THREE.Group {
  const group = new THREE.Group();

  // Dark glossy eye material
  const eyeMat = new THREE.MeshPhysicalMaterial({
    color: 0x111625,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
  });

  // Sparkle highlight material
  const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Left Eye
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), eyeMat);
  leftEye.position.set(-0.52, 0.16, 1.42);
  leftEye.scale.set(1, 1.15, 0.55);

  const leftSparkle1 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), sparkleMat);
  leftSparkle1.position.set(-0.06, 0.06, 0.14);
  leftEye.add(leftSparkle1);

  const leftSparkle2 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), sparkleMat);
  leftSparkle2.position.set(0.06, -0.05, 0.14);
  leftEye.add(leftSparkle2);

  // Right Eye
  const rightEye = leftEye.clone();
  rightEye.position.set(0.52, 0.16, 1.42);

  group.add(leftEye);
  group.add(rightEye);

  // Cute tiny nose
  const noseMat = new THREE.MeshStandardMaterial({
    color: 0xff70a6,
    roughness: 0.3,
  });
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.08, 16), noseMat);
  nose.position.set(0, 0.03, 1.54);
  nose.rotation.x = Math.PI * 0.55;
  group.add(nose);

  // Whiskers using glowing thin cylinders
  const whiskerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
  const whiskerGeom = new THREE.CylinderGeometry(0.009, 0.009, 0.55);

  // Left Whiskers
  const wL1 = new THREE.Mesh(whiskerGeom, whiskerMat);
  wL1.position.set(-0.95, 0.02, 1.35);
  wL1.rotation.z = Math.PI * 0.44;
  wL1.rotation.y = -0.3;
  group.add(wL1);

  const wL2 = new THREE.Mesh(whiskerGeom, whiskerMat);
  wL2.position.set(-0.95, -0.1, 1.33);
  wL2.rotation.z = Math.PI * 0.56;
  wL2.rotation.y = -0.3;
  group.add(wL2);

  // Right Whiskers
  const wR1 = new THREE.Mesh(whiskerGeom, whiskerMat);
  wR1.position.set(0.95, 0.02, 1.35);
  wR1.rotation.z = -Math.PI * 0.44;
  wR1.rotation.y = 0.3;
  group.add(wR1);

  const wR2 = new THREE.Mesh(whiskerGeom, whiskerMat);
  wR2.position.set(0.95, -0.1, 1.33);
  wR2.rotation.z = -Math.PI * 0.56;
  wR2.rotation.y = 0.3;
  group.add(wR2);

  return group;
}
