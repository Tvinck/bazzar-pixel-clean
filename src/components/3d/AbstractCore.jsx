import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Environment, ContactShadows } from '@react-three/drei';

const AbstractCore = () => {
    const meshRef = useRef();
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        meshRef.current.rotation.x = time * 0.2;
        meshRef.current.rotation.y = time * 0.3;
        meshRef.current.position.y = Math.sin(time / 2) * 0.1;
    });

    return (
        <group>
            <Sphere args={[1, 64, 64]} ref={meshRef} scale={1.8}>
                <MeshDistortMaterial
                    color="#FBBF24"
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Sphere>
            <Environment preset="city" />
            <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        </group>
    );
};

export default AbstractCore;
