import React, { forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';

export const EagleModule = forwardRef((props, ref) => {
    const { scene } = useGLTF('/eagleModule.glb');
    return <primitive object={scene} ref={ref} {...props} />;
});

useGLTF.preload('/eagleModule.glb');
