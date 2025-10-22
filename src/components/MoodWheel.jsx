import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './MoodWheel.css';

const WheelSegment = ({ position, rotation, color, label, percentage, index }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = rotation;
    }
  });

  return (
    <group position={position} rotation={[0, 0, rotation]}>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[2, 2, 0.1, 32, 1, true, 0, Math.PI * 2 * percentage]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, Math.PI * percentage]}
      >
        {label}
      </Text>
      <Text
        position={[0, 0, 0.15]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, Math.PI * percentage]}
      >
        {percentage.toFixed(1)}%
      </Text>
    </group>
  );
};

const MoodWheel = ({ moodData }) => {
  const total = moodData.reduce((sum, item) => sum + item.count, 0);
  
  if (total === 0) {
    return (
      <div className="mood-wheel-container">
        <div className="no-data">No ratings yet</div>
      </div>
    );
  }

  const segments = moodData.map((item, index) => ({
    ...item,
    percentage: (item.count / total) * 100,
    rotation: index * (Math.PI * 2 / moodData.length)
  }));

  return (
    <div className="mood-wheel-container">
      <h3>Mood Distribution</h3>
      <div className="wheel-wrapper">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls enableZoom={false} enablePan={false} />
          
          {segments.map((segment, index) => (
            <WheelSegment
              key={segment.id}
              position={[0, 0, 0]}
              rotation={segment.rotation}
              color={segment.color}
              label={segment.emoji}
              percentage={segment.percentage / 100}
              index={index}
            />
          ))}
        </Canvas>
      </div>
      
      <div className="mood-legend">
        {segments.map((segment) => (
          <div key={segment.id} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: segment.color }}
            />
            <span className="legend-label">{segment.emoji} {segment.label}</span>
            <span className="legend-percentage">{segment.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodWheel;
