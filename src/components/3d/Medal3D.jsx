import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, Torus, Octahedron, Environment } from '@react-three/drei';

const Medal3D = ({ color = "#F59E0B", shape = "sphere" }) => {
    const ref = useRef();
    useFrame((state) => {
        ref.current.rotation.y += 0.01;
        ref.current.rotation.x = Math.sin(state.clock.getElapsedTime()) * 0.1;
    });

    return (
        <group>
            <Float idx={1} speed={2} rotationIntensity={1} floatIntensity={1}>
                {shape === "sphere" && <Sphere args={[0.8, 32, 32]} ref={ref}><meshStandardMaterial color={color} metalness={0.8} roughness={0.2} /></Sphere>}
                {shape === "torus" && <Torus args={[0.6, 0.25, 16, 32]} ref={ref}><meshStandardMaterial color={color} metalness={0.8} roughness={0.2} /></Torus>}
                {shape === "oct" && <Octahedron args={[0.8]} ref={ref}><meshStandardMaterial color={color} metalness={0.8} roughness={0.2} /></Octahedron>}
            </Float>
            <Environment preset="sunset" />
            <ambientLight intensity={0.5} />
            <spotLight position={[5, 10, 5]} intensity={1.5} />
        </group>
    );
};

export default Medal3D;
