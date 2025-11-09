import { usePlannerStore } from '@/store/usePlannerStore';
import { memo } from 'react';
import * as THREE from 'three';


interface RoomProps {
  width: number;
  depth: number;
  height: number;
}

export const Room = memo(({ width, depth, height }: RoomProps) => {

  const walls = usePlannerStore((state) => state.walls);


  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Grid */}
      {/* <gridHelper args={[width, width, '#e0e0e0', '#e8e8e8']} position={[0, 0.01, 0]} /> */}

      {/* Back wall */}
      {/* <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh> */}

        {/* ----------------------------------------------- */}
        {walls.length > 0 ? (
            walls.map((w, i) => {
              const [x1, z1] = w.start;
              const [x2, z2] = w.end;
              const wallLength = Math.hypot(x2 - x1, z2 - z1);
              const angle = Math.atan2(z2 - z1, x2 - x1);
              const midX = (x1 + x2) / 2;
              const midZ = (z1 + z2) / 2;

              return (
                <mesh
                  key={i}
                  position={[midX, height / 2, midZ]}
                  rotation={[0, -angle, 0]}
                  receiveShadow
                  castShadow
                >
                  <boxGeometry args={[wallLength, height, 0.05]} />
                  <meshStandardMaterial color="#fafafa"  />
                </mesh>
              );
            })
          ) : (
            <>
              {/* Floor + 4 walls القديمة */}
            </>
          )}

        {/* ----------------------------------------------- */}


      {/* Left wall */}
      {/* <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color="#fafafa" side={THREE.DoubleSide} />
      </mesh> */}

      {/* Right wall */}
      {/* <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color="#fafafa" side={THREE.DoubleSide} />
      </mesh> */}

      {/* Front wall - transparent so camera can see inside */}
      {/* <mesh position={[0, height / 2, depth / 2]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial 
          color="#ffffff" 
          side={THREE.DoubleSide}
          transparent
          opacity={0}
        />
      </mesh> */}

      
    </group>
  );
});

Room.displayName = 'Room';
