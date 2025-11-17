import { useMemo } from 'react';
import { usePlannerStore } from '@/store/usePlannerStore';

export const GridOverlay = () => {
  const {
    roomWidth,
    roomDepth,
    showGrid: visible,
    gridSize,
  } = usePlannerStore();

  const gridLines = useMemo(() => {
    if (!visible) return null;

    const lines: JSX.Element[] = [];
    const halfWidth = roomWidth / 2;
    const halfDepth = roomDepth / 2;

    // Vertical lines (along Z axis)
    for (let x = -halfWidth; x <= halfWidth; x += gridSize) {
      const isMainLine = Math.abs(x % 1) < 0.01; // Check if it's on a meter mark
      const color = isMainLine ? '#00acc1' : '#d0d0d0';
      const opacity = isMainLine ? 0.6 : 0.3;
      
      lines.push(
        <line key={`v-${x}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([x, 0.02, -halfDepth, x, 0.02, halfDepth])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={color} transparent opacity={opacity} />
        </line>
      );
    }

    // Horizontal lines (along X axis)
    for (let z = -halfDepth; z <= halfDepth; z += gridSize) {
      const isMainLine = Math.abs(z % 1) < 0.01;
      const color = isMainLine ? '#00acc1' : '#d0d0d0';
      const opacity = isMainLine ? 0.6 : 0.3;
      
      lines.push(
        <line key={`h-${z}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([-halfWidth, 0.02, z, halfWidth, 0.02, z])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={color} transparent opacity={opacity} />
        </line>
      );
    }

    return lines;
  }, [roomWidth, roomDepth, gridSize, visible]);

  if (!visible) return null;

  return <group>{gridLines}</group>;
};
