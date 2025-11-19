import * as THREE from "three";
import { usePlannerStore } from "@/store/usePlannerStore";

const height = 3;

export const Room = () => {
  const { roomWidth, roomDepth } = usePlannerStore();
  const walls = usePlannerStore((state) => state.walls);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial color="#f5f5f5" side={THREE.DoubleSide} />
      </mesh>

      {/* Grid */}
      {/* <gridHelper args={[width, width, '#e0e0e0', '#e8e8e8']} position={[0, 0.01, 0]} /> */}

      {/* Boundary Walls - All semi-transparent for visibility */}
      {/* Back wall */}
      <mesh position={[0, height / 2, -roomDepth / 2]} receiveShadow castShadow>
        <boxGeometry args={[roomWidth, height, 0.2]} />
        <meshStandardMaterial color="#fafafa" transparent opacity={0.5} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-roomWidth / 2, height / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, height, roomDepth]} />
        <meshStandardMaterial color="#fafafa" transparent opacity={0.5} />
      </mesh>

      {/* Right wall */}
      <mesh position={[roomWidth / 2, height / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, height, roomDepth]} />
        <meshStandardMaterial color="#fafafa" transparent opacity={0.5} />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, height / 2, roomDepth / 2]} receiveShadow castShadow>
        <boxGeometry args={[roomWidth, height, 0.2]} />
        <meshStandardMaterial color="#fafafa" transparent opacity={0.5} />
      </mesh>

      {/* Custom walls from user drawing */}
      {walls.map((w, i) => {
        const [x1, z1] = w.start;
        const [x2, z2] = w.end;
        const wallLength = Math.hypot(x2 - x1, z2 - z1);
        const angle = Math.atan2(z2 - z1, x2 - x1);
        const midX = (x1 + x2) / 2;
        const midZ = (z1 + z2) / 2;

        return (
          <mesh key={i} position={[midX, height / 2, midZ]} rotation={[0, -angle, 0]} receiveShadow castShadow>
            <boxGeometry args={[wallLength, height, 0.15]} />
            <meshStandardMaterial color="#e0e0e0" />
          </mesh>
        );
      })}
    </group>
  );
};

Room.displayName = "Room";
