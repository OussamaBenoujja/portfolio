import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader, extend } from '@react-three/fiber';
import { Sphere, Stars, Html, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- Procedural Sun Shader ---
const SunShaderMaterial = shaderMaterial(
    // Uniforms
    { uTime: 0, uColor1: new THREE.Color('#ffaa00'), uColor2: new THREE.Color('#ff5500') },
    // Vertex Shader
    `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    // Fragment Shader (Simple animated noise)
    `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec2 vUv;
    varying vec3 vPosition;

    // Simplex 3D Noise function (simplified for brevity)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        // First corner
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
        // Permutations
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
        // Turbulence
        float noiseVal = snoise(vPosition * 2.0 + uTime * 0.5);
        // Mix colors based on noise
        vec3 color = mix(uColor1, uColor2, noiseVal * 0.5 + 0.5);
        
        // Add core glow
        float brightness = 1.0 + noiseVal * 0.2;
        
        gl_FragColor = vec4(color * brightness, 1.0);
    }
    `
);

extend({ SunShaderMaterial });

const Sun = () => {
    const materialRef = useRef();

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime;
        }
    });

    return (
        <mesh position={[0, 0, -5]}>
            <sphereGeometry args={[2.5, 64, 64]} />
            <sunShaderMaterial ref={materialRef} transparent />
            {/* Inner Point Light for Illumination */}
            <pointLight intensity={30} distance={100} decay={1} color="#ffaa00" />

            {/* Outer Glow using a larger inverted sphere or Sprite (Optional, kept simple for performance) */}
        </mesh>
    );
};

const Planet = ({ onClick }) => {
    const meshRef = useRef();
    const highlightRef = useRef();
    const [hovered, setHover] = useState(false);

    // Load texture
    const texture = useLoader(THREE.TextureLoader, '/planet_texture.png');

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Rotate planet on its axis
            meshRef.current.rotation.y += delta * 0.1;
        }
        if (highlightRef.current) {
            highlightRef.current.rotation.y += delta * 0.1;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 8]}> {/* Tilt axis */}
            {/* The Planet itself */}
            <mesh
                ref={meshRef}
                position={[5, 0, 2]}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
                onPointerOut={() => { document.body.style.cursor = 'none'; setHover(false); }}
                onClick={onClick}
            >
                <sphereGeometry args={[1.2, 64, 64]} />
                <meshStandardMaterial
                    map={texture}
                    roughness={0.4}
                    metalness={0.2}
                    displacementScale={0.1}
                />
            </mesh>

            {/* Scale-based Outline (Manual "Pass") - Only visible on hover */}
            {hovered && (
                <mesh ref={highlightRef} position={[5, 0, 2]} scale={[1.05, 1.05, 1.05]}>
                    <sphereGeometry args={[1.2, 64, 64]} />
                    <meshBasicMaterial
                        color="white"
                        transparent
                        opacity={0.3}
                        side={THREE.BackSide}
                    />
                </mesh>
            )}

            {/* HTML Label - Safe from WebGL Font Crashes */}
            <Html position={[5, 1.5, 2]} center style={{ pointerEvents: 'none' }}>
                <div style={{
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.2s',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    letterSpacing: '2px',
                    textShadow: '0 0 10px rgba(255,255,255,0.5)',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontFamily: 'sans-serif'
                }}>
                    PROJECTS
                </div>
            </Html>
        </group>
    );
};

const Scene = ({ onProjectEnter }) => {
    const groupRef = useRef();

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Rotate the entire system slowly
            groupRef.current.rotation.y += delta * 0.05;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, -20]} rotation={[0.2, 0, 0]}>
            <Sun />
            <Planet onClick={onProjectEnter} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
};

export const SolarSystemScene = ({ onProjectEnter }) => {
    return (
        <Scene onProjectEnter={onProjectEnter} />
    );
};

// Default export kept for backward compatibility if needed, but App will use the named export
const SolarSystem = ({ onProjectEnter }) => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 0, background: 'black' }}>
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <ambientLight intensity={0.02} />
                <Scene onProjectEnter={onProjectEnter} />
            </Canvas>
        </div>
    );
};

export default SolarSystem;
