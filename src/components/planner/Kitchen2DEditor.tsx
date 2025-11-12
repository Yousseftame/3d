// src/components/planner/Kitchen2DEditor.jsx
import { usePlannerStore } from "@/store/usePlannerStore";
import React, { useEffect, useRef, useState, useMemo } from "react";



const pxPerMeterDefault = 70; 

function worldToScreen([x, z], center, pxPerMeter) {
  // world in meters -> svg px (origin at center)
  return [center[0] + x * pxPerMeter, center[1] - z * pxPerMeter];
}

function screenToWorld([sx, sy], center, pxPerMeter) {
  // svg px -> world meters (x,z)
  const x = (sx - center[0]) / pxPerMeter;
  const z = (center[1] - sy) / pxPerMeter;
  return [x, z];
}

function polygonArea(points) {
  // shoelace, points = [[x,z], ...] in meters (closed)
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

export default function Kitchen2DEditor({ width = 600, height = 400 }) {
//   const { kitchenSize, setWalls, addWall, updateWall, removeWall } = usePlannerStore();
//   const walls = kitchenSize.walls || [];
// -------------------------------------------
const { walls, setWalls, addWall, updateWall, removeWall } = usePlannerStore();
// -------------------------------------------
  const [pxPerMeter, setPxPerMeter] = useState(pxPerMeterDefault);
  const [drawing, setDrawing] = useState(null); // {start: [sx, sy]}
  const [hover, setHover] = useState(null); // {type:'point'|'wall', idx}
  const [draggingPoint, setDraggingPoint] = useState(null); // {wallIndex, point:'start'|'end'}
  const [selectedWall, setSelectedWall] = useState(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // center of SVG (origin in world coords)
  const center = useMemo(() => [width / 2, height / 2], [width, height]);

  // when store walls change from elsewhere, we keep local sync (we read directly from store)
  // Draw handlers:
  const onMouseDown = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    if (e.button !== 0) return;
    // if clicked on existing point, begin dragging (handled separately)
    if (hover && hover.type === "point") {
      const { idx, which } = hover;
      setDraggingPoint({ wallIndex: idx, which });
      return;
    }
    // start drawing
    setDrawing({ start: [sx, sy] });
  };

  const onMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    // update hover: check proximity to points or walls
    let found = null;
    // points proximity
    for (let i = 0; i < walls.length; i++) {
      const w = walls[i];
      const [sx1, sy1] = worldToScreen(w.start, center, pxPerMeter);
      const [sx2, sy2] = worldToScreen(w.end, center, pxPerMeter);
      const dist1 = Math.hypot(sx - sx1, sy - sy1);
      const dist2 = Math.hypot(sx - sx2, sy - sy2);
      if (dist1 < 8) {
        found = { type: "point", idx: i, which: "start" };
        break;
      }
      if (dist2 < 8) {
        found = { type: "point", idx: i, which: "end" };
        break;
      }
      // check distance to segment for hover on wall (optional)
      // compute projection
      const vx = sx2 - sx1, vy = sy2 - sy1;
      const wx = sx - sx1, wy = sy - sy1;
      const proj = (vx * wx + vy * wy) / (vx * vx + vy * vy || 1);
      if (proj >= 0 && proj <= 1) {
        const px = sx1 + proj * vx, py = sy1 + proj * vy;
        const d = Math.hypot(sx - px, sy - py);
        if (d < 6) {
          found = { type: "wall", idx: i };
          // don't break; earlier point check has precedence
        }
      }
    }
    setHover(found);

    if (draggingPoint) {
      // move the point interactively (convert to world)
      const world = screenToWorld([sx, sy], center, pxPerMeter);
      const widx = draggingPoint.wallIndex;
      const newWalls = [...walls];
      const which = draggingPoint.which;
      const updated = { ...newWalls[widx] };
      if (which === "start") updated.start = world;
      else updated.end = world;
      // update immediately in store
      updateWall(widx, updated);
      return;
    }

    if (drawing) {
      // live update preview via state
      setDrawing({ ...drawing, current: [sx, sy] });
    }
  };

  const onMouseUp = (e) => {
    if (draggingPoint) {
      setDraggingPoint(null);
      return;
    }
    if (!drawing) return;
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const startWorld = screenToWorld(drawing.start, center, pxPerMeter);
    const endWorld = screenToWorld([sx, sy], center, pxPerMeter);

    // ignore tiny segments
    const dx = endWorld[0] - startWorld[0];
    const dz = endWorld[1] - startWorld[1];
    if (Math.hypot(dx, dz) < 0.05) {
      setDrawing(null);
      return;
    }

    addWall({ start: startWorld, end: endWorld });
    setDrawing(null);
  };

  const onWheel = (e) => {
    // zoom grid = change pxPerMeter
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = -e.deltaY;
      setPxPerMeter((p) => Math.max(10, Math.min(150, p + delta * 0.02)));
    }
  };

  // double click on wall -> split wall (insert vertex)
  const onDoubleClick = (e) => {
    if (hover && hover.type === "wall") {
      const i = hover.idx;
      const w = walls[i];
      // split: create two walls: start->mid, mid->end
      const mid = [(w.start[0] + w.end[0]) / 2, (w.start[1] + w.end[1]) / 2];
      // replace wall i with two walls
      const newWalls = [...walls];
      newWalls.splice(i, 1, { start: w.start, end: mid }, { start: mid, end: w.end });
      setWalls(newWalls);
    }
  };

  // delete selected wall (press Delete key)
  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key === "Delete" && selectedWall != null) {
        removeWall(selectedWall);
        setSelectedWall(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedWall, removeWall]);

  // compute polygon from walls (attempt to order points if closed)
  const polygonPoints = useMemo(() => {
    // Attempt to build polygon if walls form a loop.
    if (walls.length === 0) return [];
    // naive method: collect points sequence by chaining
    const pts = [];
    // start from first wall.start
    let used = new Array(walls.length).fill(false);
    let current = walls[0].start.slice();
    pts.push(current);
    for (let k = 0; k < walls.length; k++) {
      let foundIdx = -1;
      for (let i = 0; i < walls.length; i++) {
        if (used[i]) continue;
        const w = walls[i];
        if (Math.hypot(w.start[0] - current[0], w.start[1] - current[1]) < 1e-6) {
          foundIdx = i;
          current = w.end.slice();
          used[i] = true;
          pts.push(current);
          break;
        } else if (Math.hypot(w.end[0] - current[0], w.end[1] - current[1]) < 1e-6) {
          foundIdx = i;
          current = w.start.slice();
          used[i] = true;
          pts.push(current);
          break;
        }
      }
      if (foundIdx === -1) break;
    }
    // if closed make it unique
    return pts;
  }, [walls]);

  const area = polygonArea(polygonPoints);

  return (
    <div className="w-full h-full p-2 bg-white border rounded">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-sm font-medium">2D Editor</div>
        <div className="text-xs text-gray-600">px/m: {Math.round(pxPerMeter)}</div>
        <div className="text-xs text-gray-600">Walls: {walls.length}</div>
        <div className="text-xs text-gray-600">Area: {area.toFixed(2)} m²</div>
      </div>


        {/* Drwing */}
      <div className=""
        style={{ width: width, height: height }}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onDoubleClick={onDoubleClick}
        onWheel={onWheel}
      >
        <svg ref={svgRef} width={width} height={height} style={{ background: "#fafafa" }}>
          {/* grid */}
          <defs>
            <pattern id="grid" width={pxPerMeter} height={pxPerMeter} patternUnits="userSpaceOnUse">
              <path d={`M ${pxPerMeter} 0 L 0 0 0 ${pxPerMeter}`} fill="none" stroke="#eee" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* existing walls */}
        {walls.map((w, i) => {
        const [sx1, sy1] = worldToScreen(w.start, center, pxPerMeter);
        const [sx2, sy2] = worldToScreen(w.end, center, pxPerMeter);
        const selected = selectedWall === i;

        // حساب الطول (بالمتر ← سنتيمتر)
        const dx = w.end[0] - w.start[0];
        const dz = w.end[1] - w.start[1];
        const lengthMeters = Math.sqrt(dx * dx + dz * dz);
        const lengthCm = (lengthMeters * 100).toFixed(0);

        // تحديد منتصف الجدار
        const midX = (sx1 + sx2) / 2;
        const midY = (sy1 + sy2) / 2;

        // تحديد زاوية الخط لعرض النص بشكل مناسب
        const angle = (Math.atan2(sy2 - sy1, sx2 - sx1) * 180) / Math.PI;

        return (
            <g key={i}>
            <line
                x1={sx1}
                y1={sy1}
                x2={sx2}
                y2={sy2}
                stroke={selected ? "#1572A1" : "#222"}
                strokeWidth={selected ? 4 : 2}
                strokeLinecap="round"
                onClick={(ev) => {
                ev.stopPropagation();
                setSelectedWall(i);
                }}
            />

            {/* النقاط */}
            <circle cx={sx1} cy={sy1} r={6} fill="#fff" stroke="#333" strokeWidth={1.5} />
            <circle cx={sx2} cy={sy2} r={6} fill="#fff" stroke="#333" strokeWidth={1.5} />

            {/* الطول في منتصف الجدار */}
            <text
                x={midX}
                y={midY - 10} // فوق الخط قليلاً
                fontSize="12"
                fill="#1572A1"
                textAnchor="middle"
                transform={`rotate(${angle}, ${midX}, ${midY})`}
            >
                {lengthCm} cm
            </text>
            </g>
        );
        })}


          {/* drawing preview */}
          {drawing && drawing.current && (
            <line
              x1={drawing.start[0]}
              y1={drawing.start[1]}
              x2={drawing.current[0]}
              y2={drawing.current[1]}
              stroke="#888"
              strokeWidth={2}
            />
          )}

          {/* polygon outline (if closed) */}
          {polygonPoints.length > 2 && (
            <polyline
              points={polygonPoints.map((p) => worldToScreen(p, center, pxPerMeter).join(",")).join(" ")}
              fill="rgba(21,114,161,0.06)"
              stroke="#1572A1"
              strokeWidth={1}
            />
          )}
        </svg>
      </div>


        {/* Buttons  */}
      <div className="mt-6 flex items-center justify-between">
        <button
          className="px-2 py-1 bg-gray-100 rounded text-[13px]"
          onClick={() => {
            // center fit / reset zoom
            setPxPerMeter(pxPerMeterDefault);
          }}
        >
          Reset zoom
        </button>

        <button
          className="px-2 py-1 bg-red-100 text-red-700 rounded text-[13px]"
          onClick={() => {
            // clear walls
            setWalls([]);
            setSelectedWall(null);
          }}
        >
          مسح كل الجدران
        </button>
      </div>


    </div>
  );
}



