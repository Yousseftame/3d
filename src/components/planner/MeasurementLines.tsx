import { usePlannerStore } from '@/store/usePlannerStore';
import { FurnitureItem } from '@/types/furniture';
import { Line, Text } from '@react-three/drei';
import { memo, useMemo } from 'react';

interface MeasurementLinesProps {
  selectedItem: FurnitureItem | null;
}

export const MeasurementLines = memo(({selectedItem}:MeasurementLinesProps) => {
  const { furniture , roomWidth , roomDepth} = usePlannerStore()
  const measurements = useMemo(() => {
    if (!selectedItem) return null;

    const [x, y, z] = selectedItem.position;
    const { width, depth } = selectedItem.dimensions;
    
    // Calculate distances to walls accounting for rotation
    const rotation = selectedItem.rotation;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    // Calculate actual bounds based on rotation
    const cos = Math.abs(Math.cos(rotation));
    const sin = Math.abs(Math.sin(rotation));
    const effectiveWidth = width * cos + depth * sin;
    const effectiveDepth = depth * cos + width * sin;

    // Get selected item bounds
    const selectedMinX = x - effectiveWidth / 2;
    const selectedMaxX = x + effectiveWidth / 2;
    const selectedMinZ = z - effectiveDepth / 2;
    const selectedMaxZ = z + effectiveDepth / 2;

    // Distances to each wall
    const distToLeft = x - (-roomWidth / 2) - effectiveWidth / 2;
    const distToRight = (roomWidth / 2) - x - effectiveWidth / 2;
    const distToBack = z - (-roomDepth / 2) - effectiveDepth / 2;
    const distToFront = (roomDepth / 2) - z - effectiveDepth / 2;

    const lineHeight = y + 0.5;
    const textHeight = lineHeight + 0.3;

    // Find nearest furniture in each direction
    const nearbyFurniture = furniture
      .filter(item => item.id !== selectedItem.id)
      .map(item => {
        const itemCos = Math.abs(Math.cos(item.rotation));
        const itemSin = Math.abs(Math.sin(item.rotation));
        const itemEffectiveWidth = item.dimensions.width * itemCos + item.dimensions.depth * itemSin;
        const itemEffectiveDepth = item.dimensions.depth * itemCos + item.dimensions.width * itemSin;
        
        const itemMinX = item.position[0] - itemEffectiveWidth / 2;
        const itemMaxX = item.position[0] + itemEffectiveWidth / 2;
        const itemMinZ = item.position[2] - itemEffectiveDepth / 2;
        const itemMaxZ = item.position[2] + itemEffectiveDepth / 2;

        // Calculate gap distances
        const gapLeft = selectedMinX - itemMaxX;
        const gapRight = itemMinX - selectedMaxX;
        const gapBack = selectedMinZ - itemMaxZ;
        const gapFront = itemMinZ - selectedMaxZ;

        return {
          item,
          bounds: { minX: itemMinX, maxX: itemMaxX, minZ: itemMinZ, maxZ: itemMaxZ },
          gaps: { left: gapLeft, right: gapRight, back: gapBack, front: gapFront }
        };
      });

    // Find closest furniture in each direction
    const closestLeft = nearbyFurniture
      .filter(f => f.gaps.left > 0.01 && Math.abs(f.item.position[2] - z) < effectiveDepth)
      .sort((a, b) => a.gaps.left - b.gaps.left)[0];

    const closestRight = nearbyFurniture
      .filter(f => f.gaps.right > 0.01 && Math.abs(f.item.position[2] - z) < effectiveDepth)
      .sort((a, b) => a.gaps.right - b.gaps.right)[0];

    const closestBack = nearbyFurniture
      .filter(f => f.gaps.back > 0.01 && Math.abs(f.item.position[0] - x) < effectiveWidth)
      .sort((a, b) => a.gaps.back - b.gaps.back)[0];

    const closestFront = nearbyFurniture
      .filter(f => f.gaps.front > 0.01 && Math.abs(f.item.position[0] - x) < effectiveWidth)
      .sort((a, b) => a.gaps.front - b.gaps.front)[0];

    return {
      x, y, z, effectiveWidth, effectiveDepth, lineHeight, textHeight,
      distToLeft, distToRight, distToBack, distToFront,
      selectedMinX, selectedMaxX, selectedMinZ, selectedMaxZ,
      closestLeft, closestRight, closestBack, closestFront
    };
  }, [selectedItem, furniture, roomWidth, roomDepth]);

  if (!measurements) return null;

  const {
    x, y, z, effectiveWidth, effectiveDepth, lineHeight, textHeight,
    distToLeft, distToRight, distToBack, distToFront,
    selectedMinX, selectedMaxX, selectedMinZ, selectedMaxZ,
    closestLeft, closestRight, closestBack, closestFront
  } = measurements;

  return (
    <group>
      {/* Left wall or furniture measurement */}
      {!closestLeft && distToLeft > 0.1 && (
        <>
          <Line
            points={[
              [-roomWidth / 2, lineHeight, z],
              [x - effectiveWidth / 2, lineHeight, z]
            ]}
            color="#3b82f6"
            lineWidth={2}
            dashed
            dashScale={50}
            dashSize={0.1}
            gapSize={0.05}
          />
          <Text
            position={[(-roomWidth / 2 + x - effectiveWidth / 2) / 2, textHeight, z]}
            fontSize={0.15}
            color="#3b82f6"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {(distToLeft * 1000).toFixed(0)} mm
          </Text>
        </>
      )}

      {/* Left furniture measurement */}
      {closestLeft && closestLeft.gaps.left > 0.01 && (
        <>
          <Line
            points={[
              [closestLeft.bounds.maxX, lineHeight, z],
              [selectedMinX, lineHeight, z]
            ]}
            color="#f59e0b"
            lineWidth={2}
            dashed
            dashScale={50}
            dashSize={0.1}
            gapSize={0.05}
          />
          <Text
            position={[(closestLeft.bounds.maxX + selectedMinX) / 2, textHeight, z]}
            fontSize={0.15}
            color="#f59e0b"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {(closestLeft.gaps.left * 1000).toFixed(0)} mm
          </Text>
        </>
      )}

      {/* Right wall measurement */}
      {!closestRight && distToRight > 0.1 && (
        <>
          <Line
            points={[
              [x + effectiveWidth / 2, lineHeight, z],
              [roomWidth / 2, lineHeight, z]
            ]}
            color="#3b82f6"
            lineWidth={2}
            dashed
            dashScale={50}
            dashSize={0.1}
            gapSize={0.05}
          />
          <Text
            position={[(x + effectiveWidth / 2 + roomWidth / 2) / 2, textHeight, z]}
            fontSize={0.15}
            color="#3b82f6"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {(distToRight * 1000).toFixed(0)} mm
          </Text>
        </>
      )}

      {/* Right furniture measurement */}
      {closestRight && closestRight.gaps.right > 0.01 && (
        <>
          <Line
            points={[
              [selectedMaxX, lineHeight, z],
              [closestRight.bounds.minX, lineHeight, z]
            ]}
            color="#f59e0b"
            lineWidth={2}
            dashed
            dashScale={50}
            dashSize={0.1}
            gapSize={0.05}
          />
          <Text
            position={[(selectedMaxX + closestRight.bounds.minX) / 2, textHeight, z]}
            fontSize={0.15}
            color="#f59e0b"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {(closestRight.gaps.right * 1000).toFixed(0)} mm
          </Text>
        </>
      )}

      {/* Back wall measurement */}
      {!closestBack && distToBack > 0.1 && (
        <>
          <Line
            points={[
              [x, lineHeight, -roomDepth / 2],
              [x, lineHeight, z - effectiveDepth / 2]
            ]}
            color="#10b981"
            lineWidth={2}
            dashed
            dashScale={50}
            dashSize={0.1}
            gapSize={0.05}
          />
          <Text
            position={[x, textHeight, (-roomDepth / 2 + z - effectiveDepth / 2) / 2]}
            fontSize={0.15}
            color="#10b981"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
            rotation={[0, 0, 0]}
          >
            {(distToBack * 1000).toFixed(0)} mm
          </Text>
        </>
      )}

      {/* Back furniture measurement */}
      {closestBack && closestBack.gaps.back > 0.01 && (
        <>
          <Line
            points={[
              [x, lineHeight, closestBack.bounds.maxZ],
              [x, lineHeight, selectedMinZ]
            ]}
            color="#8b5cf6"
            lineWidth={2}
            dashed
            dashScale={50}
            dashSize={0.1}
            gapSize={0.05}
          />
          <Text
            position={[x, textHeight, (closestBack.bounds.maxZ + selectedMinZ) / 2]}
            fontSize={0.15}
            color="#8b5cf6"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {(closestBack.gaps.back * 1000).toFixed(0)} mm
          </Text>
        </>
      )}

      {/* Front wall measurement */}
      {!closestFront && distToFront > 0.1 && (
        <>
          <Line
            points={[
              [x, lineHeight, z + effectiveDepth / 2],
              [x, lineHeight, roomDepth / 2]
            ]}
            color="#10b981"
            lineWidth={2}
            dashed
            dashScale={50}
            dashSize={0.1}
            gapSize={0.05}
          />
          <Text
            position={[x, textHeight, (z + effectiveDepth / 2 + roomDepth / 2) / 2]}
            fontSize={0.15}
            color="#10b981"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
            rotation={[0, 0, 0]}
          >
            {(distToFront * 1000).toFixed(0)} mm
          </Text>
        </>
      )}

      {/* Front furniture measurement */}
      {closestFront && closestFront.gaps.front > 0.01 && (
        <>
          <Line
            points={[
              [x, lineHeight, selectedMaxZ],
              [x, lineHeight, closestFront.bounds.minZ]
            ]}
            color="#8b5cf6"
            lineWidth={2}
            dashed
            dashScale={50}
            dashSize={0.1}
            gapSize={0.05}
          />
          <Text
            position={[x, textHeight, (selectedMaxZ + closestFront.bounds.minZ) / 2]}
            fontSize={0.15}
            color="#8b5cf6"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {(closestFront.gaps.front * 1000).toFixed(0)} mm
          </Text>
        </>
      )}
    </group>
  );
});
