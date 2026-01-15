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

// --- Volumetric Corona Shader ---
// Renders the "atmosphere" of the sun using an inverted sphere and Fresnel math.
// This creates a 3D glow that wraps around the object, visible from all angles.
const CoronaShaderMaterial = shaderMaterial(
    {
        uColor: new THREE.Color('#ffaa00'), // Yellow-Gold
        uCoefficient: 0.7, // Bias for the fresnel
        uPower: 2.5,       // Tightness of the glow
    },
    // Vertex Shader
    `
    varying vec3 vNormal;
    varying vec3 vPositionEye;
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vPositionEye = mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
    }
    `,
    // Fragment Shader
    `
    uniform vec3 uColor;
    uniform float uCoefficient;
    uniform float uPower;
    varying vec3 vNormal;
    varying vec3 vPositionEye;
    void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(-vPositionEye);
        
        // Calculate Fresnel for BackSide Sphere
        // Normal points OUT (away from camera at center). ViewDir points TO camera.
        // Dot product is ~ -1 at center, 0 at lim/edge.
        // We want 1.0 intensity at center (dense atmosphere) and 0.0 at edge (thin).
        
        float dotProd = dot(normal, viewDir);
        
        // Use abs() or just negate to be safe. We want the magnitude.
        // 1.0 at center, 0.0 at edge.
        float intensity = pow(abs(dotProd), uPower);
        
        // Boost brightness slightly
        intensity = intensity * uCoefficient;

        // Additive blending will take this alpha and add color
        gl_FragColor = vec4(uColor, intensity);
    }
    `
);

// --- Saturn Ring Texture Generator ---
// Creates a high-res 1D texture resembling a vinyl record with the Cassini Division
const getRingTexture = () => {
    // Check for browser environment
    if (typeof document === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(1024, 1);

    for (let i = 0; i < 1024; i++) {
        const u = i / 1024;
        const k = i * 4;

        // Base physics: inner rings denser, Cassini division empty
        // Normalized radial distance: 0 (Inner edge) -> 1 (Outer edge)

        let alpha = 1.0;

        // Cassini Division (Sharp gap ~0.7)
        if (u > 0.68 && u < 0.72) {
            image.data[k] = 0;
            image.data[k + 1] = 0;
            image.data[k + 2] = 0;
            image.data[k + 3] = 20; // Almost transparent
            continue;
        }

        // Generate Bands (High frequency noise)
        // High freq sine waves to simulate thousands of ringlets
        const band1 = Math.sin(u * 400.0);
        const band2 = Math.cos(u * 200.0);
        const fine = Math.sin(u * 1000.0);

        let density = 0.6 + 0.2 * band1 + 0.1 * band2 + 0.1 * fine;

        // Color logic
        // Inner C Ring (Darker/Translucent)
        let r = 210, g = 190, b = 150; // Beige/Gold Base

        if (u < 0.25) { // C Ring
            r = 100; g = 90; b = 80;
            alpha = 0.5;
        } else if (u < 0.68) { // B Ring (Brightest)
            r = 230; g = 210; b = 170;
            density += 0.1;
        } else { // A Ring (Outer)
            r = 190; g = 180; b = 160;
        }

        // Apply density
        r *= density;
        g *= density;
        b *= density;

        // Soft Fades at geometry edges
        if (u < 0.05) alpha *= (u / 0.05);
        if (u > 0.95) alpha *= ((1.0 - u) / 0.05);

        image.data[k] = r;
        image.data[k + 1] = g;
        image.data[k + 2] = b;
        image.data[k + 3] = alpha * 255;
    }

    ctx.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    return texture;
};

// --- Saturn Ring Shader (Texture Based) ---
const SaturnRingShaderMaterial = shaderMaterial(
    {
        uTexture: null,
        innerRadius: 1.8,
        outerRadius: 4.0,
    },
    // Vertex Shader
    `
    varying vec3 vPos;
    void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    // Fragment Shader
    `
    uniform sampler2D uTexture;
    uniform float innerRadius;
    uniform float outerRadius;
    varying vec3 vPos;

    void main() {
        // Map local radius to texture UV (0..1)
        float r = length(vPos);
        float u = (r - innerRadius) / (outerRadius - innerRadius);
        
        if (u < 0.0 || u > 1.0) discard;
        
        // Sample texture
        vec4 color = texture2D(uTexture, vec2(u, 0.5));
        
        gl_FragColor = color;
    }
    `
);

extend({ SunShaderMaterial, CoronaShaderMaterial, SaturnRingShaderMaterial });

const Sun = () => {
    const materialRef = useRef();

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime;
        }
    });

    return (
        <group position={[0, 0, -5]}>
            {/* Core Sun Surface */}
            <mesh>
                <sphereGeometry args={[2.5, 64, 64]} />
                <sunShaderMaterial ref={materialRef} transparent />
            </mesh>

            {/* Inner Point Light for Illumination */}
            <pointLight intensity={50} distance={100} decay={1} color="#ffaa00" />

            {/* Layer 1: Inner Dense Glow (Golden/Bright) */}
            <mesh scale={[1.2, 1.2, 1.2]}>
                <sphereGeometry args={[2.5, 64, 64]} />
                <coronaShaderMaterial
                    uColor={new THREE.Color('#ffcc00')}
                    uCoefficient={0.8}
                    uPower={4.0}
                    transparent
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Layer 2: Outer Soft Haze (Orange/Reddish) */}
            <mesh scale={[1.5, 1.5, 1.5]}>
                <sphereGeometry args={[2.5, 64, 64]} />
                <coronaShaderMaterial
                    uColor={new THREE.Color('#ffaa00')}
                    uCoefficient={0.5}
                    uPower={2.0} // Softer falloff
                    transparent
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
        </group>
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

const Saturn = ({ onClick }) => {
    const meshRef = useRef();
    const ringRef = useRef();
    const highlightRef = useRef();
    const [hovered, setHover] = useState(false);

    // Load texture for planet surface
    const texture = useLoader(THREE.TextureLoader, '/saturn_texture.png');

    // Generate ring texture (Memoized to run once)
    const ringTexture = useMemo(() => getRingTexture(), []);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.08;
        }
        if (ringRef.current) {
            // Rings rotate with planet or slightly different? Usually physically locked.
            ringRef.current.rotation.z += delta * 0.02; // Visual interest
        }
        if (highlightRef.current) {
            highlightRef.current.rotation.y += delta * 0.08;
        }
    });

    return (
        <group position={[-8, 1, 4]} rotation={[0.4, 0, 0.2]}> {/* Tilted orbit position */}
            <group rotation={[0, 0, 0.4]}> {/* Axial Tilt */}
                {/* The Planet itself */}
                <mesh
                    ref={meshRef}
                    onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
                    onPointerOut={() => { document.body.style.cursor = 'none'; setHover(false); }}
                    onClick={onClick}
                >
                    <sphereGeometry args={[1.4, 64, 64]} />
                    <meshStandardMaterial
                        map={texture}
                        roughness={0.6}
                        metalness={0.1}
                    />
                </mesh>

                {/* The Rings */}
                <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.8, 4.0, 128]} /> {/* 1.8 to 4.0 matching Shader */}
                    <saturnRingShaderMaterial
                        uTexture={ringTexture}
                        transparent
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>

                {/* Scale-based Outline (Manual "Pass") - Only visible on hover */}
                {hovered && (
                    <mesh ref={highlightRef} scale={[1.05, 1.05, 1.05]}>
                        <sphereGeometry args={[1.4, 64, 64]} />
                        <meshBasicMaterial
                            color="white"
                            transparent
                            opacity={0.3}
                            side={THREE.BackSide} // Outline effect
                        />
                    </mesh>
                )}
            </group>

            {/* HTML Label - Safe from WebGL Font Crashes */}
            <Html position={[0, 2.5, 0]} center style={{ pointerEvents: 'none' }}>
                <div style={{
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.2s',
                    color: '#ffddaa', // Beige/Gold text
                    fontSize: '14px',
                    fontWeight: 'bold',
                    letterSpacing: '2px',
                    textShadow: '0 0 10px rgba(0,0,0,1)',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontFamily: 'sans-serif',
                    whiteSpace: 'nowrap'
                }}>
                    ABOUT ME
                </div>
            </Html>
        </group>
    );
};

const Scene = ({ onProjectEnter, onAboutMeEnter }) => {
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
            <Saturn onClick={onAboutMeEnter} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
};

export const SolarSystemScene = ({ onProjectEnter, onAboutMeEnter }) => {
    return (
        <Scene onProjectEnter={onProjectEnter} onAboutMeEnter={onAboutMeEnter} />
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
