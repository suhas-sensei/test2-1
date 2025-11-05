import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import useAppStore from '../../zustand/store';

interface BitcoinCoinProps {
  coinId: string;
  position: [number, number, number];
  collected: boolean;
}

export const BitcoinCoin = ({ coinId, position, collected }: BitcoinCoinProps) => {
  const coinRef = useRef<THREE.Group>(null);
  const { position: playerPosition, collectCoin } = useAppStore();
  const collectedRef = useRef(collected);

  useFrame((state, delta) => {
    if (coinRef.current && !collectedRef.current && !collected) {
      // Rotate the coin
      coinRef.current.rotation.y += delta * 2;

      // Bob up and down slightly
      coinRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.3;

      // Check distance to player car for collection
      const distance = Math.sqrt(
        Math.pow(playerPosition.x - position[0], 2) +
        Math.pow(playerPosition.y - position[1], 2) +
        Math.pow(playerPosition.z - position[2], 2)
      );

      // Collect if player is within 3 units
      if (distance < 3 && !collectedRef.current) {
        collectedRef.current = true;
        collectCoin(coinId);
      }
    }
  });

  // Don't render if collected
  if (collected || collectedRef.current) return null;

  return (
    <group ref={coinRef} position={position}>
      {/* Coin cylinder */}
      <mesh castShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.3, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.9}
          roughness={0.1}
          emissive="#FFA500"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Rim/edge of coin */}
      <mesh position={[0, 0, 0]} castShadow>
        <torusGeometry args={[1.5, 0.15, 16, 32]} />
        <meshStandardMaterial
          color="#FFB000"
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Bitcoin B symbol on front */}
      <Text
        position={[0, 0, 0.2]}
        fontSize={1.2}
        color="#FFA500"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Arial-Bold.ttf"
        fontWeight={900}
        outlineWidth={0.08}
        outlineColor="#B8860B"
      >
        ₿
      </Text>

      {/* Bitcoin B symbol on back */}
      <Text
        position={[0, 0, -0.2]}
        rotation={[0, Math.PI, 0]}
        fontSize={1.2}
        color="#FFA500"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Arial-Bold.ttf"
        fontWeight={900}
        outlineWidth={0.08}
        outlineColor="#B8860B"
      >
        ₿
      </Text>

      {/* Glow effect */}
      <pointLight position={[0, 0, 0]} intensity={2} distance={10} color="#FFD700" />
    </group>
  );
};
