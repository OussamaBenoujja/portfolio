import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useFBX, useAnimations, useKeyboardControls, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useControls } from 'leva';

const Character = forwardRef((props, ref) => {
    // Internal ref for the group
    const localRef = useRef();

    // Expose the internal ref to the parent
    useImperativeHandle(ref, () => localRef.current);

    // Use FBX Loader with Cache Busting v9
    const fbx = useFBX('/astronaut.fbx?v=9');

    // Load Textures
    const textures = useTexture({
        mat0_color: '/textures/Image_0.png',
        mat0_norm: '/textures/Image_1.png',
        mat0_rough: '/textures/Image_2.png',
        mat0_metal: '/textures/Image_3.png',
        mat2_color: '/textures/Image_4.png',
        mat2_norm: '/textures/Image_5.png',
        mat2_rough: '/textures/Image_6.png',
        mat2_metal: '/textures/Image_7.png',
    });

    // Apply Textures & Fix UVs
    useEffect(() => {
        // Fix UV orientation
        Object.values(textures).forEach(t => {
            t.flipY = true;
            t.colorSpace = THREE.SRGBColorSpace;
        });

        fbx.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                if (child.material) {
                    const materials = Array.isArray(child.material) ? child.material : [child.material];
                    materials.forEach((mat) => {
                        if (mat.name === 'material_0') {
                            mat.map = textures.mat0_color;
                            mat.normalMap = textures.mat0_norm;
                            mat.roughnessMap = textures.mat0_rough;
                            mat.metalnessMap = textures.mat0_metal;
                        } else if (mat.name === 'material_2') {
                            mat.map = textures.mat2_color;
                            mat.normalMap = textures.mat2_norm;
                            mat.roughnessMap = textures.mat2_rough;
                            mat.metalnessMap = textures.mat2_metal;
                        }
                        mat.needsUpdate = true;
                    });
                }
            }
        });
    }, [fbx, textures]);

    const { actions, names } = useAnimations(fbx.animations, localRef);
    const [sub, get] = useKeyboardControls();

    const { pivotX, pivotY, pivotZ, scaleOffset, moveSpeed } = useControls("Character Tuner", {
        pivotX: { value: 0.00, min: -2, max: 2, step: 0.01 },
        pivotY: { value: 0.02, min: -2, max: 2, step: 0.01 },
        pivotZ: { value: 0.00, min: -2, max: 2, step: 0.01 },
        scaleOffset: { value: 0.05, min: 0.001, max: 0.1, step: 0.001 },
        moveSpeed: { value: 14.0, min: 1, max: 20, step: 0.1 }
    });

    const [animation, setAnimation] = useState('Idle');

    useEffect(() => {
        let actionName = null;
        const findAction = (query) => names.find(n => n.toLowerCase().includes(query.toLowerCase()));

        if (animation === 'Idle') {
            const idleMatch = findAction('idleFix') || findAction('idle');
            if (idleMatch) actionName = idleMatch;
            else if (names.length > 0) actionName = names[0];
        } else if (animation === 'Run') {
            const runMatch = findAction('running') || findAction('run') || findAction('mixamo');
            if (runMatch) actionName = runMatch;
            else if (names.length > 1) actionName = names[1];
            else if (names.length > 0) actionName = names[0];
        } else {
            actionName = animation;
        }

        const action = actions[actionName];
        if (action) {
            action.reset().fadeIn(0.5).play();
            return () => {
                action.fadeOut(0.5);
            };
        }
    }, [animation, actions, names]);

    useFrame((state, delta) => {
        const { forward, backward, left, right } = get();

        // Combine Keyboard + Joystick inputs
        const joyX = props.joystickInput?.x || 0;
        const joyY = props.joystickInput?.y || 0; // -1 is forward (up on screen), 1 is backward

        // Threshold for joystick to be considered "moving" (avoid drift)
        const deadzone = 0.1;
        const hasJoystickInput = Math.abs(joyX) > deadzone || Math.abs(joyY) > deadzone;

        const isMoving = forward || backward || left || right || hasJoystickInput;

        if (localRef.current) {
            // --- Ground Snapping (Raycast) ---
            if (props.terrainRef && props.terrainRef.current) {
                // Raycast DOWN from slightly above
                const rayOrigin = localRef.current.position.clone();
                rayOrigin.y += 50;

                const raycaster = new THREE.Raycaster();
                raycaster.set(rayOrigin, new THREE.Vector3(0, -1, 0));

                const intersects = raycaster.intersectObject(props.terrainRef.current, true);
                if (intersects.length > 0) {
                    const targetY = intersects[0].point.y;
                    localRef.current.position.y = THREE.MathUtils.lerp(localRef.current.position.y, targetY, 0.2);
                }
            }

            if (isMoving) {
                setAnimation('Run');
                const speed = moveSpeed * delta;

                const camera = state.camera;
                const forwardVec = new THREE.Vector3();
                camera.getWorldDirection(forwardVec);
                forwardVec.y = 0;
                forwardVec.normalize();

                const rightVec = new THREE.Vector3();
                rightVec.crossVectors(forwardVec, camera.up).normalize();

                const direction = new THREE.Vector3();

                if (hasJoystickInput) {
                    // Joystick Logic (Analog-ish)
                    // joyY is > 0 for DOWN (backward), < 0 for UP (forward if we invert)
                    // Let's assume joystick returns: y negative = Up, y positive = Down
                    // We need to map that to: negative -> add(forwardVec), positive -> sub(forwardVec)

                    // Actually, let's just straightforward map:
                    // Up (-y) -> forward
                    // Down (+y) -> backward
                    // Right (+x) -> right
                    // Left (-x) -> left

                    // Since forwardVec is "forward", we want -joyY amount of it. 
                    direction.addScaledVector(forwardVec, -joyY);
                    direction.addScaledVector(rightVec, joyX);
                } else {
                    // Keyboard Logic (Digital)
                    if (forward) direction.add(forwardVec);
                    if (backward) direction.sub(forwardVec);
                    if (left) direction.sub(rightVec);
                    if (right) direction.add(rightVec);
                }

                if (direction.length() > 0) {
                    direction.normalize();
                    const targetRotation = Math.atan2(direction.x, direction.z);
                    const q = new THREE.Quaternion();
                    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetRotation);
                    localRef.current.quaternion.slerp(q, 0.1);

                    // --- Collision Detection ---
                    const proposedPosition = localRef.current.position.clone().addScaledVector(direction, speed);

                    let canMove = true;

                    // 1. Eagle Module Collision
                    if (props.eagleCollider) {
                        const distanceToEagle = new THREE.Vector2(proposedPosition.x, proposedPosition.z)
                            .distanceTo(new THREE.Vector2(props.eagleCollider.position.x, props.eagleCollider.position.z));

                        if (distanceToEagle < props.eagleCollider.radius) {
                            canMove = false;
                        }
                    }

                    // 2. Map Boundaries (Invisible Wall)
                    if (props.mapRadius) {
                        const distanceFromCenter = new THREE.Vector2(proposedPosition.x, proposedPosition.z).length();
                        if (distanceFromCenter > props.mapRadius) {
                            canMove = false;
                        }
                    }

                    if (canMove) {
                        localRef.current.position.copy(proposedPosition);
                    }
                }
            } else {
                setAnimation('Idle');
            }
        }
    });

    return (
        <group ref={localRef} {...props} dispose={null}>
            <group position={[pivotX, pivotY, pivotZ]}>
                <primitive object={fbx} scale={[scaleOffset, scaleOffset, scaleOffset]} castShadow receiveShadow />
            </group>
        </group>
    );
});

useFBX.preload('/astronaut.fbx?v=9');

export default Character;
