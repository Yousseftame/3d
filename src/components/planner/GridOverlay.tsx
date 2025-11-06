import { useMemo } from 'react';
import * as THREE from 'three';

interface GridOverlayProps {
  width: number;
  depth: number;
  gridSize: number;
  visible: boolean;
}

export const GridOverlay = ({ width, depth, gridSize, visible }: GridOverlayProps) => {
  const gridLines = useMemo(() => {
    if (!visible) return null;

    const lines: JSX.Element[] = [];
    const halfWidth = width / 2;
    const halfDepth = depth / 2;

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
  }, [width, depth, gridSize, visible]);

  if (!visible) return null;

  return <group>{gridLines}</group>;
};
