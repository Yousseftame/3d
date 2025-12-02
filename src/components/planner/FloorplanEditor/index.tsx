import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { usePlannerStore } from '@/store/usePlannerStore';
import { EditorToolbar } from './EditorToolbar';
import { Grid2D } from './Grid2D';
import { Wall2DRenderer } from './Wall2DRenderer';
import { RoomRenderer } from './RoomRenderer';
import { Furniture2DRenderer } from './Furniture2DRenderer';
import { DrawingPreview } from './DrawingPreview';
import { StatusBar } from './StatusBar';
import { Point2D, Wall2D, ViewportState, EditorTool } from './types';
import {
  screenToWorld,
  snapToGrid,
  generateId,
  findClosedPolygon,
  polygonArea,
} from './utils';
import { toast } from 'sonner';

const DEFAULT_WALL_THICKNESS = 0.15; // 15cm walls
const DEFAULT_GRID_SIZE = 1; // 1 meter

export const FloorplanEditor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Store state
  const {
    walls: storeWalls,
    setWalls,
    addWall,
    updateWall,
    removeWall,
    furniture,
    selectedId,
    selectItem,
    deselectItem,
    roomWidth,
    roomDepth,
    snapToGrid: snapEnabled,
    gridSize,
  } = usePlannerStore();

  // Initialize default walls if none exist
  useEffect(() => {
    if (storeWalls.length === 0) {
      const halfW = roomWidth / 2;
      const halfD = roomDepth / 2;
      
      // Create 4 walls forming the default room boundary
      const defaultWalls = [
        {
          id: generateId(),
          start: [-halfW, halfD],
          end: [halfW, halfD],
          thickness: DEFAULT_WALL_THICKNESS,
        },
        {
          id: generateId(),
          start: [halfW, halfD],
          end: [halfW, -halfD],
          thickness: DEFAULT_WALL_THICKNESS,
        },
        {
          id: generateId(),
          start: [halfW, -halfD],
          end: [-halfW, -halfD],
          thickness: DEFAULT_WALL_THICKNESS,
        },
        {
          id: generateId(),
          start: [-halfW, -halfD],
          end: [-halfW, halfD],
          thickness: DEFAULT_WALL_THICKNESS,
        },
      ];
      
      setWalls(defaultWalls);
    }
  }, [storeWalls.length, roomWidth, roomDepth, setWalls]);

  // Convert store walls to Wall2D format
  const walls: Wall2D[] = useMemo(() => {
    return storeWalls.map((w: any, i: number) => ({
      id: w.id || `wall-${i}`,
      start: { x: w.start[0], y: w.start[1] },
      end: { x: w.end[0], y: w.end[1] },
      thickness: w.thickness || DEFAULT_WALL_THICKNESS,
    }));
  }, [storeWalls]);

  // Local state
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [viewport, setViewport] = useState<ViewportState>({
    offsetX: 0,
    offsetY: 0,
    zoom: 80, // pixels per meter
  });
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [showGrid, setShowGrid] = useState(true);
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
  const [hoveredWallId, setHoveredWallId] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<Point2D | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Point2D | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<Point2D | null>(null);

  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging wall point state
  const [draggingPoint, setDraggingPoint] = useState<{
    wallId: string;
    point: 'start' | 'end';
  } | null>(null);

  // History for undo/redo
  const [history, setHistory] = useState<any[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasCenter = useMemo(
    () => ({ x: dimensions.width / 2, y: dimensions.height / 2 }),
    [dimensions]
  );

  // Detect closed room polygon
  const roomPolygon = useMemo(() => findClosedPolygon(walls), [walls]);
  const roomArea = useMemo(() => {
    if (roomPolygon) return polygonArea(roomPolygon);
    return roomWidth * roomDepth;
  }, [roomPolygon, roomWidth, roomDepth]);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Get world position from mouse event
  const getWorldPosition = useCallback(
    (e: React.MouseEvent): Point2D => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      let worldPoint = screenToWorld(screenPoint, viewport, canvasCenter);
      
      if (snapEnabled) {
        worldPoint = snapToGrid(worldPoint, gridSize);
      }
      
      return worldPoint;
    },
    [viewport, canvasCenter, snapEnabled, gridSize]
  );

  // Save to history
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...storeWalls]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, storeWalls]);

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        // Middle click or Alt+Left click for panning
        setIsPanning(true);
        setPanStart({ x: e.clientX - viewport.offsetX, y: e.clientY - viewport.offsetY });
        return;
      }

      if (e.button !== 0) return;

      const worldPos = getWorldPosition(e);

      switch (activeTool) {
        case 'draw':
          setIsDrawing(true);
          setDrawStart(worldPos);
          setDrawCurrent(worldPos);
          break;
        case 'select':
          // Deselect if clicking on empty space
          if (!hoveredWallId) {
            setSelectedWallId(null);
            deselectItem();
          }
          break;
        case 'delete':
          if (hoveredWallId) {
            const wallIndex = walls.findIndex((w) => w.id === hoveredWallId);
            if (wallIndex >= 0) {
              saveToHistory();
              removeWall(wallIndex);
              toast.success('Wall deleted');
            }
          }
          break;
      }
    },
    [activeTool, getWorldPosition, hoveredWallId, walls, removeWall, viewport, deselectItem, saveToHistory]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const worldPos = getWorldPosition(e);
      setCursorPosition(worldPos);

      if (isPanning) {
        setViewport((v) => ({
          ...v,
          offsetX: e.clientX - panStart.x,
          offsetY: e.clientY - panStart.y,
        }));
        return;
      }

      if (draggingPoint) {
        const wallIndex = walls.findIndex((w) => w.id === draggingPoint.wallId);
        if (wallIndex >= 0) {
          const wall = walls[wallIndex];
          const updatedWall = {
            start: draggingPoint.point === 'start' ? [worldPos.x, worldPos.y] : [wall.start.x, wall.start.y],
            end: draggingPoint.point === 'end' ? [worldPos.x, worldPos.y] : [wall.end.x, wall.end.y],
            thickness: wall.thickness,
            id: wall.id,
          };
          updateWall(wallIndex, updatedWall);
        }
        return;
      }

      if (isDrawing) {
        setDrawCurrent(worldPos);
        return;
      }

      // Update hover state for walls
      // This is simplified - in production you'd check distance to each wall segment
    },
    [getWorldPosition, isPanning, panStart, draggingPoint, isDrawing, walls, updateWall]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setIsPanning(false);
        return;
      }

      if (draggingPoint) {
        setDraggingPoint(null);
        return;
      }

      if (isDrawing && drawStart && drawCurrent) {
        const dx = drawCurrent.x - drawStart.x;
        const dy = drawCurrent.y - drawStart.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length > 0.1) {
          // Minimum 10cm wall
          saveToHistory();
          addWall({
            id: generateId(),
            start: [drawStart.x, drawStart.y],
            end: [drawCurrent.x, drawCurrent.y],
            thickness: DEFAULT_WALL_THICKNESS,
          });
          toast.success('Wall added');
        }

        setIsDrawing(false);
        setDrawStart(null);
        setDrawCurrent(null);
      }
    },
    [isPanning, draggingPoint, isDrawing, drawStart, drawCurrent, addWall, saveToHistory]
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewport((v) => ({
      ...v,
      zoom: Math.max(20, Math.min(200, v.zoom * delta)),
    }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedWallId) {
        const wallIndex = walls.findIndex((w) => w.id === selectedWallId);
        if (wallIndex >= 0) {
          saveToHistory();
          removeWall(wallIndex);
          setSelectedWallId(null);
          toast.success('Wall deleted');
        }
      }
      if (e.key === 'Escape') {
        setIsDrawing(false);
        setDrawStart(null);
        setDrawCurrent(null);
        setSelectedWallId(null);
        deselectItem();
      }
      if (e.key === 'v') setActiveTool('select');
      if (e.key === 'w') setActiveTool('draw');
      if (e.key === 'd') setActiveTool('delete');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWallId, walls, removeWall, deselectItem, saveToHistory]);

  // Toolbar actions
  const handleZoomIn = () => setViewport((v) => ({ ...v, zoom: Math.min(200, v.zoom * 1.2) }));
  const handleZoomOut = () => setViewport((v) => ({ ...v, zoom: Math.max(20, v.zoom / 1.2) }));
  const handleZoomFit = () => setViewport({ offsetX: 0, offsetY: 0, zoom: 80 });
  const handleToggleGrid = () => setShowGrid((v) => !v);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((i) => i - 1);
      setWalls(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((i) => i + 1);
      setWalls(history[historyIndex + 1]);
    }
  };

  const handleWallClick = (wallId: string) => {
    if (activeTool === 'select') {
      setSelectedWallId(wallId);
    }
  };

  const handlePointDragStart = (wallId: string, point: 'start' | 'end') => {
    saveToHistory();
    setDraggingPoint({ wallId, point });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-background overflow-hidden select-none"
    >
      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
        style={{ cursor: isPanning ? 'grabbing' : activeTool === 'draw' ? 'crosshair' : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Definitions for markers */}
        <defs>
          <marker
            id="arrowLeft"
            markerWidth="8"
            markerHeight="8"
            refX="4"
            refY="4"
            orient="auto"
          >
            <path d="M8,0 L0,4 L8,8" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
          </marker>
          <marker
            id="arrowRight"
            markerWidth="8"
            markerHeight="8"
            refX="4"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
          </marker>
          <marker
            id="arrowUp"
            markerWidth="8"
            markerHeight="8"
            refX="4"
            refY="4"
            orient="auto"
          >
            <path d="M0,8 L4,0 L8,8" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
          </marker>
          <marker
            id="arrowDown"
            markerWidth="8"
            markerHeight="8"
            refX="4"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L4,8 L8,0" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
          </marker>
        </defs>

        {/* Background */}
        <rect width="100%" height="100%" fill="hsl(var(--background))" />

        {/* Grid */}
        <Grid2D
          width={dimensions.width}
          height={dimensions.height}
          viewport={viewport}
          gridSize={DEFAULT_GRID_SIZE}
          showGrid={showGrid}
        />

        {/* Room boundary and area */}
        <RoomRenderer
          roomPoints={roomPolygon}
          viewport={viewport}
          canvasCenter={canvasCenter}
          roomWidth={roomWidth}
          roomDepth={roomDepth}
        />

        {/* Walls */}
        <Wall2DRenderer
          walls={walls}
          viewport={viewport}
          canvasCenter={canvasCenter}
          selectedWallId={selectedWallId}
          hoveredWallId={hoveredWallId}
          onWallClick={handleWallClick}
          onPointDragStart={handlePointDragStart}
        />

        {/* Furniture */}
        <Furniture2DRenderer
          furniture={furniture}
          viewport={viewport}
          canvasCenter={canvasCenter}
          selectedId={selectedId}
          onSelect={selectItem}
        />

        {/* Drawing preview */}
        <DrawingPreview
          startPoint={drawStart}
          currentPoint={drawCurrent}
          viewport={viewport}
          canvasCenter={canvasCenter}
        />
      </svg>

      {/* Toolbar */}
      <EditorToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomFit={handleZoomFit}
        onToggleGrid={handleToggleGrid}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        showGrid={showGrid}
      />

      {/* Status Bar */}
      <StatusBar
        viewport={viewport}
        wallCount={walls.length}
        furnitureCount={furniture.length}
        roomArea={roomArea}
        activeTool={activeTool}
        cursorPosition={cursorPosition}
        snapEnabled={snapEnabled}
      />

      {/* Help tooltip */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur border border-border rounded-lg p-3 text-xs max-w-[200px]">
        <div className="font-semibold mb-2">Shortcuts</div>
        <div className="space-y-1 text-muted-foreground">
          <div><kbd className="bg-muted px-1 rounded">V</kbd> Select</div>
          <div><kbd className="bg-muted px-1 rounded">W</kbd> Draw Wall</div>
          <div><kbd className="bg-muted px-1 rounded">D</kbd> Delete</div>
          <div><kbd className="bg-muted px-1 rounded">Del</kbd> Delete selected</div>
          <div><kbd className="bg-muted px-1 rounded">Alt</kbd> + Drag: Pan</div>
          <div><kbd className="bg-muted px-1 rounded">Scroll</kbd> Zoom</div>
        </div>
      </div>
    </div>
  );
};

export default FloorplanEditor;
