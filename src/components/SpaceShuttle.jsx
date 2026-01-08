import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { shaderMaterial, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// --- Custom GLSL Shader for Engine Plumes ---
const PlumeShaderMaterial = shaderMaterial(
  // Uniforms
  {
    uTime: 0,
    uColorStart: new THREE.Color("#ffaa00"), // Orange core
    uColorEnd: new THREE.Color("#0055ff"), // Blue trail
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying float vDisplacement;
    uniform float uTime;

    // Simplex Noise (minimal version for displacement)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                        dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
        vUv = uv;

        // Displace the mesh along the normal based on noise + time
        // High frequency noise for "crackle"
        float noise = snoise(vec3(position.x * 2.0, position.y * 5.0 - uTime * 5.0, position.z * 2.0));
        vDisplacement = noise;

        vec3 newPosition = position + normal * noise * 0.1;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  // Fragment Shader
  `
    varying vec2 vUv;
    varying float vDisplacement;
    uniform float uTime;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;

    void main() {
        // Create a gradient from top to bottom (flame core to tip)
        float gradient = 1.0 - vUv.y;

        // Add noise turbulence to the alpha/intensity
        float intensity = gradient + vDisplacement * 0.2;

        // Mix colors
        vec3 color = mix(uColorStart, uColorEnd, 1.0 - intensity);

        // Alpha fade out at the bottom
        float alpha = smoothstep(0.0, 0.8, intensity);

        gl_FragColor = vec4(color * 2.0, alpha); // Multiply color for HDR glow
    }
  `,
);

extend({ PlumeShaderMaterial });

const EnginePlume = ({ position, scale = 1 }) => {
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
    }
  });

  return (
    <mesh
      position={position}
      rotation={[Math.PI, 0, 0]}
      scale={[scale, scale * 3, scale]}
    >
      {/* Cone geometry for the flame shape */}
      <cylinderGeometry args={[0.2, 0, 1, 16, 8, true]} />
      <plumeShaderMaterial
        ref={materialRef}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const SpaceShuttle = ({
  isFlyby = false,
  startOffset = [5, 2, 10], // Start behind/right of camera
  flySpeed = 10,  // Speed of flyby
  shrinkSpeed = 0, // Rate of scaling down per second
  vanishDistance = 100, // Distance to fly before vanishing
  respawnDelay = 5000, // Time in ms before respawn
  ...props
}) => {
  const { scene } = useGLTF("/space_shuttle.glb");
  const clone = useMemo(() => scene.clone(), [scene]);

  const groupRef = useRef();

  // Custom Visual Tunings (Hardcoded)
  const plumeGroupZ = 0.3;
  const plumeGroupRotation = [-1.59, 0, 0];
  const modelRotation = [0, Math.PI, 0];
  const mainEnginePos = [0, 5.0, 12.5];
  const mainScale = 5.0;
  const leftEnginePos = [-1.8, 5.0, 9.8];
  const rightEnginePos = [1.8, 5.0, 9.8];
  const sideScale = 5.0;

  // Animation State
  const animState = useRef({
    active: true,
    timer: 0,
    initialScale: props.scale === undefined ? 1 : (typeof props.scale === 'number' ? props.scale : 1)
  });

  // Animation Loop
  useFrame((state, delta) => {
    if (!isFlyby || !groupRef.current) return;

    const s = animState.current;

    if (s.active) {
      // Move -Z (Forward into space)
      groupRef.current.position.z -= flySpeed * delta;

      // Shrink over time
      if (shrinkSpeed > 0) {
        // current scale - rate * delta
        const currentScale = groupRef.current.scale.x;
        // Use X as proxy for uniform scale
        const nextScale = Math.max(0, currentScale - (shrinkSpeed * delta));
        groupRef.current.scale.setScalar(nextScale);
      }

      // Check if too far
      if (groupRef.current.position.z < -vanishDistance) {
        // "Destroy" / Hide
        s.active = false;
        groupRef.current.visible = false;
        s.timer = 0;
      }
    } else {
      // Respawn timer
      s.timer += delta * 1000;
      if (s.timer > respawnDelay) {
        // Reset and show
        s.active = true;
        groupRef.current.visible = true;

        // Reset Position
        groupRef.current.position.set(startOffset[0], startOffset[1], startOffset[2]);

        // Reset Scale
        groupRef.current.scale.setScalar(s.initialScale);
      }
    }
  });

  // Initialize Position & Scale
  useEffect(() => {
    if (isFlyby && groupRef.current) {
      groupRef.current.position.set(startOffset[0], startOffset[1], startOffset[2]);
      // Note: Scale is handled by props initially, but we must ensure we reset it correctly
      // stored in animState.initialScale
    }
  }, [isFlyby, startOffset]);

  return (
    <group ref={groupRef} {...props}>
      <group>
        <primitive object={clone} rotation={modelRotation} />
        <group position={[0, 0, plumeGroupZ]} rotation={plumeGroupRotation}>
          <EnginePlume position={mainEnginePos} scale={mainScale} />
          <EnginePlume position={leftEnginePos} scale={sideScale} />
          <EnginePlume position={rightEnginePos} scale={sideScale} />
        </group>
      </group>
    </group>
  );
};
