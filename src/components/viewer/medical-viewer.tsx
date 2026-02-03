"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import {
  ZoomIn,
  ZoomOut,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Contrast,
  Ruler,
  Circle,
  ArrowUpRight,
  Type,
  Grid3X3,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Info,
  Download,
  Undo,
  RefreshCw,
  Sun,
  Mouse,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Window/Level presets for different body parts
const WINDOW_PRESETS = {
  default: { window: 400, level: 40, name: "Default" },
  lung: { window: 1500, level: -600, name: "Lung" },
  bone: { window: 2000, level: 300, name: "Bone" },
  brain: { window: 80, level: 40, name: "Brain" },
  abdomen: { window: 350, level: 40, name: "Abdomen" },
  liver: { window: 150, level: 30, name: "Liver" },
  mediastinum: { window: 350, level: 50, name: "Mediastinum" },
};

type Tool = "pan" | "zoom" | "windowLevel" | "distance" | "angle" | "area" | "arrow" | "text" | "freehand";

interface Annotation {
  id: string;
  type: Tool;
  points: { x: number; y: number }[];
  text?: string;
  color: string;
}

interface MedicalViewerProps {
  images: string[];
  studyInfo?: {
    patientName?: string;
    studyDate?: string;
    modality?: string;
    seriesDescription?: string;
  };
  onClose?: () => void;
}

export function MedicalViewer({ images, studyInfo, onClose }: MedicalViewerProps) {
  // Image state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(500);

  // Transform state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [invert, setInvert] = useState(false);

  // Window/Level state
  const [windowWidth, setWindowWidth] = useState(400);
  const [windowCenter, setWindowCenter] = useState(40);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // Tool state
  const [activeTool, setActiveTool] = useState<Tool>("pan");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);

  // Layout state
  const [gridLayout, setGridLayout] = useState<"1x1" | "1x2" | "2x2">("1x1");
  const [showInfo, setShowInfo] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPan = useRef({ x: 0, y: 0 });
  const initialWindowLevel = useRef({ window: 400, level: 40 });

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, playSpeed);
      return () => clearInterval(interval);
    }
  }, [isPlaying, images.length, playSpeed]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          setCurrentIndex((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowRight":
          setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
          break;
        case "ArrowUp":
          setZoom((prev) => Math.min(5, prev + 0.1));
          break;
        case "ArrowDown":
          setZoom((prev) => Math.max(0.1, prev - 0.1));
          break;
        case " ":
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case "r":
          resetView();
          break;
        case "i":
          setInvert((prev) => !prev);
          break;
        case "f":
          toggleFullscreen();
          break;
        case "Escape":
          if (isFullscreen) {
            document.exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, isFullscreen]);

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      initialPan.current = { ...pan };
      initialWindowLevel.current = { window: windowWidth, level: windowCenter };

      if (activeTool === "distance" || activeTool === "angle" || activeTool === "area" || activeTool === "arrow" || activeTool === "freehand") {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        setCurrentAnnotation({
          id: Date.now().toString(),
          type: activeTool,
          points: [{ x, y }],
          color: "#00ff00",
        });
      }
    },
    [activeTool, pan, zoom, windowWidth, windowCenter]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current) return;

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      switch (activeTool) {
        case "pan":
          setPan({
            x: initialPan.current.x + dx,
            y: initialPan.current.y + dy,
          });
          break;
        case "zoom":
          const zoomDelta = dy * -0.01;
          setZoom((prev) => Math.max(0.1, Math.min(5, prev + zoomDelta)));
          break;
        case "windowLevel":
          setWindowWidth(Math.max(1, initialWindowLevel.current.window + dx * 4));
          setWindowCenter(initialWindowLevel.current.level - dy * 2);
          break;
        case "distance":
        case "arrow":
          if (currentAnnotation) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const x = (e.clientX - rect.left - pan.x) / zoom;
            const y = (e.clientY - rect.top - pan.y) / zoom;
            setCurrentAnnotation({
              ...currentAnnotation,
              points: [currentAnnotation.points[0], { x, y }],
            });
          }
          break;
        case "freehand":
          if (currentAnnotation) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const x = (e.clientX - rect.left - pan.x) / zoom;
            const y = (e.clientY - rect.top - pan.y) / zoom;
            setCurrentAnnotation({
              ...currentAnnotation,
              points: [...currentAnnotation.points, { x, y }],
            });
          }
          break;
        case "angle":
        case "area":
          if (currentAnnotation && currentAnnotation.points.length > 0) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const x = (e.clientX - rect.left - pan.x) / zoom;
            const y = (e.clientY - rect.top - pan.y) / zoom;
            const newPoints = [...currentAnnotation.points];
            if (newPoints.length === 1) {
              newPoints.push({ x, y });
            } else {
              newPoints[newPoints.length - 1] = { x, y };
            }
            setCurrentAnnotation({
              ...currentAnnotation,
              points: newPoints,
            });
          }
          break;
      }
    },
    [activeTool, currentAnnotation, pan, zoom]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    if (currentAnnotation && currentAnnotation.points.length >= 2) {
      setAnnotations((prev) => [...prev, currentAnnotation]);
    }
    setCurrentAnnotation(null);
  }, [currentAnnotation]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) {
        // Zoom with Ctrl+scroll
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((prev) => Math.max(0.1, Math.min(5, prev + delta)));
      } else {
        // Navigate through images
        if (e.deltaY > 0) {
          setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
        } else {
          setCurrentIndex((prev) => Math.max(0, prev - 1));
        }
      }
    },
    [images.length]
  );

  // Actions
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setInvert(false);
    setBrightness(100);
    setContrast(100);
    setWindowWidth(400);
    setWindowCenter(40);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const applyPreset = (preset: keyof typeof WINDOW_PRESETS) => {
    const p = WINDOW_PRESETS[preset];
    setWindowWidth(p.window);
    setWindowCenter(p.level);
  };

  const undoAnnotation = () => {
    setAnnotations((prev) => prev.slice(0, -1));
  };

  const clearAnnotations = () => {
    setAnnotations([]);
  };

  // Calculate distance between two points (in mm, assuming 1px = 0.25mm for demo)
  const calculateDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const px = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    return (px * 0.25).toFixed(1); // Convert to mm
  };

  // Calculate angle between three points
  const calculateAngle = (points: { x: number; y: number }[]) => {
    if (points.length < 3) return 0;
    const [p1, p2, p3] = points;
    const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    let angle = ((angle2 - angle1) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    if (angle > 180) angle = 360 - angle;
    return angle.toFixed(1);
  };

  // Image transform style
  const imageTransform = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
    filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? "invert(1)" : ""}`,
    transition: isDragging.current ? "none" : "transform 0.1s ease-out",
  };

  const ToolButton = ({ tool, icon: Icon, label }: { tool: Tool; icon: any; label: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={activeTool === tool ? "default" : "ghost"}
          size="icon"
          onClick={() => setActiveTool(tool)}
          className="h-9 w-9"
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={cn(
          "flex flex-col bg-black",
          isFullscreen ? "fixed inset-0 z-50" : "h-[calc(100vh-8rem)] rounded-lg overflow-hidden"
        )}
      >
        {/* Top Toolbar */}
        <div className="flex items-center justify-between gap-2 p-2 bg-zinc-900 border-b border-zinc-800">
          {/* Left: Navigation tools */}
          <div className="flex items-center gap-1">
            <ToolButton tool="pan" icon={Move} label="Pan (drag to move)" />
            <ToolButton tool="zoom" icon={ZoomIn} label="Zoom (drag up/down)" />
            <ToolButton tool="windowLevel" icon={Contrast} label="Window/Level (drag)" />

            <div className="w-px h-6 bg-zinc-700 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.min(5, z + 0.25))} className="h-9 w-9">
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Zoom In</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.max(0.1, z - 0.25))} className="h-9 w-9">
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Zoom Out</TooltipContent>
            </Tooltip>

            <span className="text-xs text-zinc-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Center: Measurement & Annotation tools */}
          <div className="flex items-center gap-1">
            <ToolButton tool="distance" icon={Ruler} label="Distance Measurement" />
            <ToolButton tool="angle" icon={Circle} label="Angle Measurement" />
            <ToolButton tool="arrow" icon={ArrowUpRight} label="Arrow Annotation" />
            <ToolButton tool="text" icon={Type} label="Text Annotation" />
            <ToolButton tool="freehand" icon={Pencil} label="Freehand Draw" />

            <div className="w-px h-6 bg-zinc-700 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={undoAnnotation} className="h-9 w-9">
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Undo Annotation</TooltipContent>
            </Tooltip>
          </div>

          {/* Right: View controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setRotation((r) => r + 90)} className="h-9 w-9">
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Rotate 90°</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={flipH ? "default" : "ghost"} size="icon" onClick={() => setFlipH(!flipH)} className="h-9 w-9">
                  <FlipHorizontal className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Flip Horizontal</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={flipV ? "default" : "ghost"} size="icon" onClick={() => setFlipV(!flipV)} className="h-9 w-9">
                  <FlipVertical className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Flip Vertical</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={invert ? "default" : "ghost"} size="icon" onClick={() => setInvert(!invert)} className="h-9 w-9">
                  <Sun className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Invert Colors</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-zinc-700 mx-1" />

            {/* Window/Level Presets */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 gap-1">
                  <Contrast className="h-4 w-4" />
                  <span className="text-xs">Presets</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Window/Level Presets</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(WINDOW_PRESETS).map(([key, preset]) => (
                  <DropdownMenuItem key={key} onClick={() => applyPreset(key as keyof typeof WINDOW_PRESETS)}>
                    {preset.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Layout Grid */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Layout</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setGridLayout("1x1")}>1x1</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGridLayout("1x2")}>1x2</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGridLayout("2x2")}>2x2</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={showInfo ? "default" : "ghost"} size="icon" onClick={() => setShowInfo(!showInfo)} className="h-9 w-9">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Toggle Info Overlay</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={resetView} className="h-9 w-9">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Reset View</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-9 w-9">
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Fullscreen (F)</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Main Viewer Area */}
        <div className="flex-1 relative overflow-hidden">
          <div
            className={cn(
              "h-full w-full grid gap-1 p-1",
              gridLayout === "1x1" && "grid-cols-1",
              gridLayout === "1x2" && "grid-cols-2",
              gridLayout === "2x2" && "grid-cols-2 grid-rows-2"
            )}
          >
            {/* Primary Viewport */}
            <div
              className="relative bg-black overflow-hidden cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              {/* The Image */}
              {images.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[currentIndex]}
                    alt={`Medical image ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain select-none"
                    style={imageTransform}
                    draggable={false}
                  />
                </div>
              )}

              {/* Annotations SVG Overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* Render saved annotations */}
                  {annotations.map((annotation) => (
                    <g key={annotation.id}>
                      {annotation.type === "distance" && annotation.points.length >= 2 && (
                        <>
                          <line
                            x1={annotation.points[0].x}
                            y1={annotation.points[0].y}
                            x2={annotation.points[1].x}
                            y2={annotation.points[1].y}
                            stroke={annotation.color}
                            strokeWidth={2 / zoom}
                          />
                          <text
                            x={(annotation.points[0].x + annotation.points[1].x) / 2}
                            y={(annotation.points[0].y + annotation.points[1].y) / 2 - 10 / zoom}
                            fill={annotation.color}
                            fontSize={14 / zoom}
                            textAnchor="middle"
                          >
                            {calculateDistance(annotation.points[0], annotation.points[1])} mm
                          </text>
                        </>
                      )}
                      {annotation.type === "arrow" && annotation.points.length >= 2 && (
                        <>
                          <defs>
                            <marker
                              id={`arrow-${annotation.id}`}
                              markerWidth="10"
                              markerHeight="7"
                              refX="9"
                              refY="3.5"
                              orient="auto"
                            >
                              <polygon points="0 0, 10 3.5, 0 7" fill={annotation.color} />
                            </marker>
                          </defs>
                          <line
                            x1={annotation.points[0].x}
                            y1={annotation.points[0].y}
                            x2={annotation.points[1].x}
                            y2={annotation.points[1].y}
                            stroke={annotation.color}
                            strokeWidth={2 / zoom}
                            markerEnd={`url(#arrow-${annotation.id})`}
                          />
                        </>
                      )}
                      {annotation.type === "freehand" && annotation.points.length >= 2 && (
                        <polyline
                          points={annotation.points.map((p) => `${p.x},${p.y}`).join(" ")}
                          stroke={annotation.color}
                          strokeWidth={2 / zoom}
                          fill="none"
                        />
                      )}
                    </g>
                  ))}

                  {/* Current annotation being drawn */}
                  {currentAnnotation && (
                    <g>
                      {currentAnnotation.type === "distance" && currentAnnotation.points.length >= 2 && (
                        <>
                          <line
                            x1={currentAnnotation.points[0].x}
                            y1={currentAnnotation.points[0].y}
                            x2={currentAnnotation.points[1].x}
                            y2={currentAnnotation.points[1].y}
                            stroke={currentAnnotation.color}
                            strokeWidth={2 / zoom}
                            strokeDasharray={`${4 / zoom}`}
                          />
                          <text
                            x={(currentAnnotation.points[0].x + currentAnnotation.points[1].x) / 2}
                            y={(currentAnnotation.points[0].y + currentAnnotation.points[1].y) / 2 - 10 / zoom}
                            fill={currentAnnotation.color}
                            fontSize={14 / zoom}
                            textAnchor="middle"
                          >
                            {calculateDistance(currentAnnotation.points[0], currentAnnotation.points[1])} mm
                          </text>
                        </>
                      )}
                      {currentAnnotation.type === "arrow" && currentAnnotation.points.length >= 2 && (
                        <line
                          x1={currentAnnotation.points[0].x}
                          y1={currentAnnotation.points[0].y}
                          x2={currentAnnotation.points[1].x}
                          y2={currentAnnotation.points[1].y}
                          stroke={currentAnnotation.color}
                          strokeWidth={2 / zoom}
                          strokeDasharray={`${4 / zoom}`}
                        />
                      )}
                      {currentAnnotation.type === "freehand" && currentAnnotation.points.length >= 2 && (
                        <polyline
                          points={currentAnnotation.points.map((p) => `${p.x},${p.y}`).join(" ")}
                          stroke={currentAnnotation.color}
                          strokeWidth={2 / zoom}
                          fill="none"
                        />
                      )}
                    </g>
                  )}
                </g>
              </svg>

              {/* Info Overlay - Top Left */}
              {showInfo && studyInfo && (
                <div className="absolute top-3 left-3 bg-black/70 rounded px-3 py-2 text-xs text-white font-mono space-y-1">
                  {studyInfo.patientName && <div>Patient: {studyInfo.patientName}</div>}
                  {studyInfo.studyDate && <div>Date: {studyInfo.studyDate}</div>}
                  {studyInfo.modality && <div>Modality: {studyInfo.modality}</div>}
                  {studyInfo.seriesDescription && <div>Series: {studyInfo.seriesDescription}</div>}
                </div>
              )}

              {/* Info Overlay - Top Right */}
              {showInfo && (
                <div className="absolute top-3 right-3 bg-black/70 rounded px-3 py-2 text-xs text-white font-mono space-y-1">
                  <div>W: {windowWidth} L: {windowCenter}</div>
                  <div>Zoom: {Math.round(zoom * 100)}%</div>
                </div>
              )}

              {/* Info Overlay - Bottom Right */}
              {showInfo && (
                <div className="absolute bottom-3 right-3 bg-black/70 rounded px-3 py-2 text-xs text-white font-mono">
                  <div>
                    Image {currentIndex + 1} / {images.length}
                  </div>
                </div>
              )}

              {/* Active Tool Indicator */}
              <div className="absolute bottom-3 left-3 bg-primary/80 rounded px-2 py-1 text-xs text-white capitalize">
                {activeTool === "windowLevel" ? "Window/Level" : activeTool}
              </div>
            </div>

            {/* Additional viewports for grid layouts */}
            {gridLayout !== "1x1" && (
              <div className="bg-zinc-900 flex items-center justify-center text-zinc-600 text-sm">
                Drop series here
              </div>
            )}
            {gridLayout === "2x2" && (
              <>
                <div className="bg-zinc-900 flex items-center justify-center text-zinc-600 text-sm">
                  Drop series here
                </div>
                <div className="bg-zinc-900 flex items-center justify-center text-zinc-600 text-sm">
                  Drop series here
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Toolbar - Image Navigation / Cine Player */}
        <div className="flex items-center justify-center gap-4 p-3 bg-zinc-900 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentIndex(0)}
                  disabled={currentIndex === 0}
                  className="h-8 w-8"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>First Image</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Previous (←)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isPlaying ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-8 w-8"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Play/Pause (Space)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentIndex((i) => Math.min(images.length - 1, i + 1))}
                  disabled={currentIndex === images.length - 1}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Next (→)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentIndex(images.length - 1)}
                  disabled={currentIndex === images.length - 1}
                  className="h-8 w-8"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Last Image</TooltipContent>
            </Tooltip>
          </div>

          {/* Image Slider */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Slider
              value={[currentIndex]}
              min={0}
              max={Math.max(0, images.length - 1)}
              step={1}
              onValueChange={([value]) => setCurrentIndex(value)}
              className="flex-1"
            />
            <span className="text-xs text-zinc-400 w-16 text-center">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          {/* Playback Speed */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Speed:</span>
            <select
              value={playSpeed}
              onChange={(e) => setPlaySpeed(Number(e.target.value))}
              className="bg-zinc-800 text-white text-xs rounded px-2 py-1 border border-zinc-700"
            >
              <option value={1000}>1x</option>
              <option value={500}>2x</option>
              <option value={250}>4x</option>
              <option value={100}>10x</option>
            </select>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
