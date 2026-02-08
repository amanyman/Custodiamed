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
  Minimize,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Info,
  Undo,
  RefreshCw,
  Sun,
  Pencil,
  Crosshair,
  ScanLine,
  Trash2,
  MousePointer,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Window/Level presets - standard radiology values
const WINDOW_PRESETS = {
  default: { window: 400, level: 40, name: "Default", shortcut: "1" },
  lung: { window: 1500, level: -600, name: "Lung", shortcut: "2" },
  bone: { window: 2000, level: 300, name: "Bone", shortcut: "3" },
  brain: { window: 80, level: 40, name: "Brain", shortcut: "4" },
  abdomen: { window: 350, level: 40, name: "Abdomen", shortcut: "5" },
  liver: { window: 150, level: 30, name: "Liver", shortcut: "6" },
  mediastinum: { window: 350, level: 50, name: "Mediastinum", shortcut: "7" },
  softTissue: { window: 400, level: 50, name: "Soft Tissue", shortcut: "8" },
  spine: { window: 250, level: 50, name: "Spine", shortcut: "9" },
};

type Tool = "pointer" | "pan" | "zoom" | "windowLevel" | "crosshair" | "distance" | "angle" | "area" | "arrow" | "text" | "freehand" | "ellipse";

interface Point {
  x: number;
  y: number;
}

interface Annotation {
  id: string;
  type: Tool;
  points: Point[];
  text?: string;
  color: string;
  imageIndex: number;
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
  const [imageLoaded, setImageLoaded] = useState(false);

  // Transform state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
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
  const [showThumbnails, setShowThumbnails] = useState(images.length > 1);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [cursorPos, setCursorPos] = useState<Point | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef<Point>({ x: 0, y: 0 });
  const initialPan = useRef<Point>({ x: 0, y: 0 });
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

  // Preload adjacent images
  useEffect(() => {
    const preload = (index: number) => {
      if (index >= 0 && index < images.length) {
        const img = new Image();
        img.src = images[index];
      }
    };
    preload(currentIndex + 1);
    preload(currentIndex - 1);
    preload(currentIndex + 2);
  }, [currentIndex, images]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setCurrentIndex((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setZoom((prev) => Math.min(8, prev * 1.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setZoom((prev) => Math.max(0.1, prev / 1.1));
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
        case "p":
          setActiveTool("pan");
          break;
        case "z":
          setActiveTool("zoom");
          break;
        case "w":
          setActiveTool("windowLevel");
          break;
        case "d":
          setActiveTool("distance");
          break;
        case "a":
          setActiveTool("angle");
          break;
        case "c":
          setActiveTool("crosshair");
          break;
        case "h":
          setShowShortcuts((prev) => !prev);
          break;
        case "t":
          setShowThumbnails((prev) => !prev);
          break;
        case "Delete":
        case "Backspace":
          undoAnnotation();
          break;
        case "Escape":
          if (isFullscreen) {
            document.exitFullscreen();
          }
          setActiveTool("pan");
          break;
        // Number keys for W/L presets
        case "1": case "2": case "3": case "4": case "5":
        case "6": case "7": case "8": case "9": {
          const presetKeys = Object.keys(WINDOW_PRESETS);
          const idx = parseInt(e.key) - 1;
          if (idx < presetKeys.length) {
            applyPreset(presetKeys[idx] as keyof typeof WINDOW_PRESETS);
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, isFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Mouse handlers
  const getImageCoords = useCallback((e: React.MouseEvent): Point => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      initialPan.current = { ...pan };
      initialWindowLevel.current = { window: windowWidth, level: windowCenter };

      const measurementTools: Tool[] = ["distance", "angle", "area", "arrow", "freehand", "ellipse"];
      if (measurementTools.includes(activeTool)) {
        const coords = getImageCoords(e);
        setCurrentAnnotation({
          id: Date.now().toString(),
          type: activeTool,
          points: [coords],
          color: "#00ff00",
          imageIndex: currentIndex,
        });
      }
    },
    [activeTool, pan, zoom, windowWidth, windowCenter, currentIndex, getImageCoords]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Track cursor position for crosshair tool
      if (activeTool === "crosshair" || showInfo) {
        const rect = viewportRef.current?.getBoundingClientRect();
        if (rect) {
          setCursorPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }
      }

      if (!isDragging.current) return;

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      switch (activeTool) {
        case "pointer":
        case "pan":
          setPan({
            x: initialPan.current.x + dx,
            y: initialPan.current.y + dy,
          });
          break;
        case "zoom": {
          const zoomDelta = dy * -0.005;
          setZoom((prev) => Math.max(0.1, Math.min(8, prev + zoomDelta * prev)));
          break;
        }
        case "windowLevel":
          setWindowWidth(Math.max(1, initialWindowLevel.current.window + dx * 4));
          setWindowCenter(initialWindowLevel.current.level - dy * 2);
          // Map window/level to CSS brightness/contrast
          setBrightness(Math.max(0, Math.min(400, 100 + (40 - windowCenter) * 0.5)));
          setContrast(Math.max(0, Math.min(400, 100 + (windowWidth - 400) * 0.05)));
          break;
        case "crosshair":
          // Crosshair doesn't drag
          break;
        case "distance":
        case "arrow": {
          if (currentAnnotation) {
            const coords = getImageCoords(e);
            setCurrentAnnotation({
              ...currentAnnotation,
              points: [currentAnnotation.points[0], coords],
            });
          }
          break;
        }
        case "freehand": {
          if (currentAnnotation) {
            const coords = getImageCoords(e);
            setCurrentAnnotation({
              ...currentAnnotation,
              points: [...currentAnnotation.points, coords],
            });
          }
          break;
        }
        case "ellipse": {
          if (currentAnnotation) {
            const coords = getImageCoords(e);
            setCurrentAnnotation({
              ...currentAnnotation,
              points: [currentAnnotation.points[0], coords],
            });
          }
          break;
        }
        case "angle":
        case "area": {
          if (currentAnnotation && currentAnnotation.points.length > 0) {
            const coords = getImageCoords(e);
            const newPoints = [...currentAnnotation.points];
            if (newPoints.length === 1) {
              newPoints.push(coords);
            } else {
              newPoints[newPoints.length - 1] = coords;
            }
            setCurrentAnnotation({
              ...currentAnnotation,
              points: newPoints,
            });
          }
          break;
        }
      }
    },
    [activeTool, currentAnnotation, pan, zoom, getImageCoords, showInfo, windowCenter, windowWidth]
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
      if (e.ctrlKey || e.metaKey) {
        // Zoom with Ctrl/Cmd + scroll
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom((prev) => Math.max(0.1, Math.min(8, prev * delta)));
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
    } else {
      await document.exitFullscreen();
    }
  };

  const applyPreset = (preset: keyof typeof WINDOW_PRESETS) => {
    const p = WINDOW_PRESETS[preset];
    setWindowWidth(p.window);
    setWindowCenter(p.level);
    setBrightness(Math.max(0, Math.min(400, 100 + (40 - p.level) * 0.5)));
    setContrast(Math.max(0, Math.min(400, 100 + (p.window - 400) * 0.05)));
  };

  const undoAnnotation = () => {
    setAnnotations((prev) => prev.slice(0, -1));
  };

  const clearAnnotations = () => {
    setAnnotations([]);
  };

  // Calculate distance between two points (in mm, assuming 1px = 0.25mm for demo)
  const calculateDistance = (p1: Point, p2: Point) => {
    const px = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    return (px * 0.25).toFixed(1);
  };

  // Calculate angle between three points
  const calculateAngle = (points: Point[]) => {
    if (points.length < 3) return "0";
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
    transition: isDragging.current ? "none" : "transform 0.15s ease-out",
  };

  // Cursor based on active tool
  const getCursor = () => {
    switch (activeTool) {
      case "pan": return "grab";
      case "zoom": return "zoom-in";
      case "windowLevel": return "col-resize";
      case "crosshair": return "crosshair";
      case "distance": case "angle": case "area": case "ellipse": return "crosshair";
      case "arrow": return "crosshair";
      case "freehand": return "crosshair";
      case "text": return "text";
      default: return "default";
    }
  };

  // Current annotations for this image
  const currentImageAnnotations = annotations.filter((a) => a.imageIndex === currentIndex);

  // Tool label mapping
  const toolLabels: Record<Tool, string> = {
    pointer: "Pointer",
    pan: "Pan",
    zoom: "Zoom",
    windowLevel: "W/L",
    crosshair: "Crosshair",
    distance: "Distance",
    angle: "Angle",
    area: "Area",
    arrow: "Arrow",
    text: "Text",
    freehand: "Draw",
    ellipse: "Ellipse",
  };

  const ToolButton = ({ tool, icon: Icon, label, shortcut }: { tool: Tool; icon: React.ElementType; label: string; shortcut?: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={activeTool === tool ? "default" : "ghost"}
          size="icon"
          onClick={() => setActiveTool(tool)}
          className={cn(
            "h-8 w-8 text-zinc-300 hover:text-white",
            activeTool === tool && "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="bg-zinc-800 border-zinc-700">
        <p className="text-xs">{label}{shortcut ? ` (${shortcut})` : ""}</p>
      </TooltipContent>
    </Tooltip>
  );

  const ActionButton = ({ icon: Icon, label, onClick, active, shortcut }: { icon: React.ElementType; label: string; onClick: () => void; active?: boolean; shortcut?: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? "default" : "ghost"}
          size="icon"
          onClick={onClick}
          className={cn(
            "h-8 w-8 text-zinc-300 hover:text-white",
            active && "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="bg-zinc-800 border-zinc-700">
        <p className="text-xs">{label}{shortcut ? ` (${shortcut})` : ""}</p>
      </TooltipContent>
    </Tooltip>
  );

  // Render annotation
  const renderAnnotation = (annotation: Annotation, isPreview: boolean = false) => {
    const strokeDash = isPreview ? `${4 / zoom}` : undefined;
    const sw = 1.5 / zoom;
    const fontSize = 12 / zoom;

    return (
      <g key={annotation.id}>
        {/* Distance */}
        {annotation.type === "distance" && annotation.points.length >= 2 && (
          <>
            <line
              x1={annotation.points[0].x} y1={annotation.points[0].y}
              x2={annotation.points[1].x} y2={annotation.points[1].y}
              stroke={annotation.color} strokeWidth={sw} strokeDasharray={strokeDash}
            />
            {/* End caps */}
            <line
              x1={annotation.points[0].x - 5 / zoom} y1={annotation.points[0].y}
              x2={annotation.points[0].x + 5 / zoom} y2={annotation.points[0].y}
              stroke={annotation.color} strokeWidth={sw}
              transform={`rotate(${Math.atan2(annotation.points[1].y - annotation.points[0].y, annotation.points[1].x - annotation.points[0].x) * 180 / Math.PI + 90}, ${annotation.points[0].x}, ${annotation.points[0].y})`}
            />
            <line
              x1={annotation.points[1].x - 5 / zoom} y1={annotation.points[1].y}
              x2={annotation.points[1].x + 5 / zoom} y2={annotation.points[1].y}
              stroke={annotation.color} strokeWidth={sw}
              transform={`rotate(${Math.atan2(annotation.points[1].y - annotation.points[0].y, annotation.points[1].x - annotation.points[0].x) * 180 / Math.PI + 90}, ${annotation.points[1].x}, ${annotation.points[1].y})`}
            />
            {/* Label */}
            <rect
              x={(annotation.points[0].x + annotation.points[1].x) / 2 - 25 / zoom}
              y={(annotation.points[0].y + annotation.points[1].y) / 2 - 18 / zoom}
              width={50 / zoom} height={16 / zoom} rx={3 / zoom}
              fill="rgba(0,0,0,0.7)"
            />
            <text
              x={(annotation.points[0].x + annotation.points[1].x) / 2}
              y={(annotation.points[0].y + annotation.points[1].y) / 2 - 7 / zoom}
              fill={annotation.color} fontSize={fontSize} textAnchor="middle"
              fontFamily="monospace"
            >
              {calculateDistance(annotation.points[0], annotation.points[1])} mm
            </text>
          </>
        )}

        {/* Arrow */}
        {annotation.type === "arrow" && annotation.points.length >= 2 && (
          <>
            <defs>
              <marker
                id={`arrow-${annotation.id}`}
                markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill={annotation.color} />
              </marker>
            </defs>
            <line
              x1={annotation.points[0].x} y1={annotation.points[0].y}
              x2={annotation.points[1].x} y2={annotation.points[1].y}
              stroke={annotation.color} strokeWidth={sw} strokeDasharray={strokeDash}
              markerEnd={`url(#arrow-${annotation.id})`}
            />
          </>
        )}

        {/* Ellipse */}
        {annotation.type === "ellipse" && annotation.points.length >= 2 && (
          <>
            <ellipse
              cx={(annotation.points[0].x + annotation.points[1].x) / 2}
              cy={(annotation.points[0].y + annotation.points[1].y) / 2}
              rx={Math.abs(annotation.points[1].x - annotation.points[0].x) / 2}
              ry={Math.abs(annotation.points[1].y - annotation.points[0].y) / 2}
              stroke={annotation.color} strokeWidth={sw} fill="none"
              strokeDasharray={strokeDash}
            />
          </>
        )}

        {/* Freehand */}
        {annotation.type === "freehand" && annotation.points.length >= 2 && (
          <polyline
            points={annotation.points.map((p) => `${p.x},${p.y}`).join(" ")}
            stroke={annotation.color} strokeWidth={sw} fill="none"
            strokeLinecap="round" strokeLinejoin="round"
          />
        )}
      </g>
    );
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={containerRef}
        className={cn(
          "flex flex-col bg-[#0a0a0a] select-none",
          isFullscreen ? "fixed inset-0 z-50" : "h-[calc(100vh-8rem)] rounded-lg overflow-hidden border border-zinc-800"
        )}
      >
        {/* Top Toolbar */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-[#111] border-b border-zinc-800/80 shrink-0">
          {/* Left: Navigation & Manipulation tools */}
          <div className="flex items-center gap-0.5">
            <ToolButton tool="pan" icon={Move} label="Pan" shortcut="P" />
            <ToolButton tool="zoom" icon={ZoomIn} label="Zoom" shortcut="Z" />
            <ToolButton tool="windowLevel" icon={Contrast} label="Window/Level" shortcut="W" />
            <ToolButton tool="crosshair" icon={Crosshair} label="Crosshair" shortcut="C" />

            <div className="w-px h-5 bg-zinc-800 mx-1.5" />

            <ActionButton icon={ZoomIn} label="Zoom In" onClick={() => setZoom((z) => Math.min(8, z * 1.25))} shortcut="↑" />
            <ActionButton icon={ZoomOut} label="Zoom Out" onClick={() => setZoom((z) => Math.max(0.1, z / 1.25))} shortcut="↓" />

            <span className="text-[10px] text-zinc-500 w-12 text-center font-mono tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Center: Measurement & Annotation tools */}
          <div className="flex items-center gap-0.5">
            <ToolButton tool="distance" icon={Ruler} label="Distance" shortcut="D" />
            <ToolButton tool="angle" icon={Circle} label="Angle" shortcut="A" />
            <ToolButton tool="ellipse" icon={ScanLine} label="Ellipse ROI" />
            <ToolButton tool="arrow" icon={ArrowUpRight} label="Arrow" />
            <ToolButton tool="freehand" icon={Pencil} label="Freehand" />

            <div className="w-px h-5 bg-zinc-800 mx-1.5" />

            <ActionButton icon={Undo} label="Undo" onClick={undoAnnotation} shortcut="Del" />
            <ActionButton icon={Trash2} label="Clear All" onClick={clearAnnotations} />

            {currentImageAnnotations.length > 0 && (
              <span className="text-[10px] text-zinc-500 ml-1 font-mono">
                {currentImageAnnotations.length} ann.
              </span>
            )}
          </div>

          {/* Right: View controls */}
          <div className="flex items-center gap-0.5">
            <ActionButton icon={RotateCw} label="Rotate 90°" onClick={() => setRotation((r) => r + 90)} />
            <ActionButton icon={FlipHorizontal} label="Flip H" onClick={() => setFlipH(!flipH)} active={flipH} />
            <ActionButton icon={FlipVertical} label="Flip V" onClick={() => setFlipV(!flipV)} active={flipV} />
            <ActionButton icon={Sun} label="Invert" onClick={() => setInvert(!invert)} active={invert} shortcut="I" />

            <div className="w-px h-5 bg-zinc-800 mx-1.5" />

            {/* Window/Level Presets */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-zinc-300 hover:text-white text-xs px-2">
                  <Contrast className="h-3.5 w-3.5" />
                  W/L
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border-zinc-700">
                <DropdownMenuLabel className="text-zinc-400 text-xs">Window/Level Presets</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-700" />
                {Object.entries(WINDOW_PRESETS).map(([key, preset]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => applyPreset(key as keyof typeof WINDOW_PRESETS)}
                    className="text-zinc-200 hover:bg-zinc-800 text-xs justify-between"
                  >
                    {preset.name}
                    <span className="text-zinc-500 ml-4">{preset.shortcut}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Layout Grid */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-white">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border-zinc-700">
                <DropdownMenuLabel className="text-zinc-400 text-xs">Layout</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-700" />
                <DropdownMenuItem onClick={() => setGridLayout("1x1")} className="text-zinc-200 hover:bg-zinc-800 text-xs">1 x 1</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGridLayout("1x2")} className="text-zinc-200 hover:bg-zinc-800 text-xs">1 x 2</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGridLayout("2x2")} className="text-zinc-200 hover:bg-zinc-800 text-xs">2 x 2</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ActionButton icon={Info} label="Toggle Info" onClick={() => setShowInfo(!showInfo)} active={showInfo} />
            <ActionButton icon={RefreshCw} label="Reset" onClick={resetView} shortcut="R" />
            <ActionButton icon={isFullscreen ? Minimize : Maximize} label="Fullscreen" onClick={toggleFullscreen} shortcut="F" />

            {/* Keyboard shortcut help */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-white">
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border-zinc-700 w-56">
                <DropdownMenuLabel className="text-zinc-400 text-xs">Keyboard Shortcuts</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-700" />
                {[
                  ["P", "Pan tool"],
                  ["Z", "Zoom tool"],
                  ["W", "Window/Level"],
                  ["C", "Crosshair"],
                  ["D", "Distance"],
                  ["A", "Angle"],
                  ["I", "Invert colors"],
                  ["R", "Reset view"],
                  ["F", "Fullscreen"],
                  ["Space", "Play/Pause"],
                  ["← →", "Prev/Next image"],
                  ["↑ ↓", "Zoom in/out"],
                  ["Scroll", "Navigate slices"],
                  ["Ctrl+Scroll", "Zoom"],
                  ["1-9", "W/L presets"],
                  ["Del", "Undo annotation"],
                ].map(([key, desc]) => (
                  <div key={key} className="flex items-center justify-between px-2 py-1 text-xs">
                    <span className="text-zinc-400">{desc}</span>
                    <kbd className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded text-[10px] font-mono">{key}</kbd>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0">
          {/* Thumbnail Strip (left side) */}
          {showThumbnails && images.length > 1 && (
            <div className="w-20 bg-[#0d0d0d] border-r border-zinc-800/80 overflow-y-auto shrink-0">
              <div className="p-1 space-y-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "w-full aspect-square rounded overflow-hidden border-2 transition-all",
                      currentIndex === idx
                        ? "border-blue-500 shadow-lg shadow-blue-500/20"
                        : "border-transparent hover:border-zinc-600 opacity-60 hover:opacity-100"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-zinc-400 text-center py-0.5 font-mono">
                      {idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Viewer Area */}
          <div className="flex-1 relative overflow-hidden">
            <div
              className={cn(
                "h-full w-full grid gap-px",
                gridLayout === "1x1" && "grid-cols-1",
                gridLayout === "1x2" && "grid-cols-2",
                gridLayout === "2x2" && "grid-cols-2 grid-rows-2"
              )}
            >
              {/* Primary Viewport */}
              <div
                ref={viewportRef}
                className="relative bg-black overflow-hidden"
                style={{ cursor: isDragging.current && activeTool === "pan" ? "grabbing" : getCursor() }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={(e) => {
                  handleMouseUp();
                  setCursorPos(null);
                }}
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
                      onLoad={() => setImageLoaded(true)}
                    />
                  </div>
                )}

                {/* Crosshair Overlay */}
                {activeTool === "crosshair" && cursorPos && (
                  <>
                    <div
                      className="absolute top-0 bottom-0 w-px bg-yellow-500/60 pointer-events-none"
                      style={{ left: cursorPos.x }}
                    />
                    <div
                      className="absolute left-0 right-0 h-px bg-yellow-500/60 pointer-events-none"
                      style={{ top: cursorPos.y }}
                    />
                  </>
                )}

                {/* Annotations SVG Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    {currentImageAnnotations.map((annotation) => renderAnnotation(annotation))}
                    {currentAnnotation && renderAnnotation(currentAnnotation, true)}
                  </g>
                </svg>

                {/* Info Overlay - Top Left (Patient/Study info) */}
                {showInfo && studyInfo && (
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-sm px-2.5 py-1.5 text-[11px] text-green-400 font-mono space-y-0.5 pointer-events-none">
                    {studyInfo.patientName && <div>{studyInfo.patientName}</div>}
                    {studyInfo.studyDate && <div>{studyInfo.studyDate}</div>}
                    {studyInfo.modality && <div>{studyInfo.modality}</div>}
                    {studyInfo.seriesDescription && <div>{studyInfo.seriesDescription}</div>}
                  </div>
                )}

                {/* Info Overlay - Top Right (Technical info) */}
                {showInfo && (
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-sm px-2.5 py-1.5 text-[11px] text-green-400 font-mono space-y-0.5 text-right pointer-events-none">
                    <div>W: {windowWidth} L: {windowCenter}</div>
                    <div>Zoom: {Math.round(zoom * 100)}%</div>
                    {rotation !== 0 && <div>Rot: {rotation}°</div>}
                  </div>
                )}

                {/* Info Overlay - Bottom Left (Tool indicator) */}
                <div className="absolute bottom-2 left-2 flex items-center gap-2 pointer-events-none">
                  <div className="bg-blue-600/80 backdrop-blur-sm rounded-sm px-2 py-0.5 text-[10px] text-white font-medium uppercase tracking-wider">
                    {toolLabels[activeTool]}
                  </div>
                  {(flipH || flipV || invert) && (
                    <div className="bg-amber-600/80 backdrop-blur-sm rounded-sm px-2 py-0.5 text-[10px] text-white font-mono">
                      {flipH && "H "}
                      {flipV && "V "}
                      {invert && "INV"}
                    </div>
                  )}
                </div>

                {/* Info Overlay - Bottom Right (Image counter) */}
                {showInfo && (
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-sm px-2.5 py-1 text-[11px] text-green-400 font-mono pointer-events-none">
                    Im: {currentIndex + 1} / {images.length}
                  </div>
                )}

                {/* No images placeholder */}
                {images.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                    <div className="text-center">
                      <ScanLine className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No images to display</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional viewports for grid layouts */}
              {gridLayout !== "1x1" && (
                <div className="bg-zinc-950 flex items-center justify-center text-zinc-700 text-xs border border-zinc-800/50">
                  <div className="text-center">
                    <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>Viewport 2</p>
                  </div>
                </div>
              )}
              {gridLayout === "2x2" && (
                <>
                  <div className="bg-zinc-950 flex items-center justify-center text-zinc-700 text-xs border border-zinc-800/50">
                    <div className="text-center">
                      <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>Viewport 3</p>
                    </div>
                  </div>
                  <div className="bg-zinc-950 flex items-center justify-center text-zinc-700 text-xs border border-zinc-800/50">
                    <div className="text-center">
                      <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>Viewport 4</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Toolbar - Cine Player */}
        <div className="flex items-center justify-center gap-3 px-3 py-1.5 bg-[#111] border-t border-zinc-800/80 shrink-0">
          {/* Thumbnail toggle */}
          {images.length > 1 && (
            <ActionButton
              icon={ScanLine}
              label="Toggle Thumbnails"
              onClick={() => setShowThumbnails(!showThumbnails)}
              active={showThumbnails}
              shortcut="T"
            />
          )}

          <div className="w-px h-5 bg-zinc-800 mx-1" />

          {/* Playback controls */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost" size="icon"
              onClick={() => setCurrentIndex(0)}
              disabled={currentIndex === 0}
              className="h-7 w-7 text-zinc-400 hover:text-white disabled:opacity-30"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" size="icon"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="h-7 w-7 text-zinc-400 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={isPlaying ? "default" : "ghost"}
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                "h-7 w-7",
                isPlaying ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-zinc-400 hover:text-white"
              )}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost" size="icon"
              onClick={() => setCurrentIndex((i) => Math.min(images.length - 1, i + 1))}
              disabled={currentIndex === images.length - 1}
              className="h-7 w-7 text-zinc-400 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" size="icon"
              onClick={() => setCurrentIndex(images.length - 1)}
              disabled={currentIndex === images.length - 1}
              className="h-7 w-7 text-zinc-400 hover:text-white disabled:opacity-30"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Image Slider */}
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <Slider
              value={[currentIndex]}
              min={0}
              max={Math.max(0, images.length - 1)}
              step={1}
              onValueChange={([value]) => setCurrentIndex(value)}
              className="flex-1"
            />
            <span className="text-[10px] text-zinc-500 w-16 text-center font-mono tabular-nums">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          {/* Playback Speed */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-500 font-mono">FPS:</span>
            <select
              value={playSpeed}
              onChange={(e) => setPlaySpeed(Number(e.target.value))}
              className="bg-zinc-900 text-zinc-300 text-[10px] rounded px-1.5 py-0.5 border border-zinc-700 font-mono"
            >
              <option value={1000}>1</option>
              <option value={500}>2</option>
              <option value={250}>4</option>
              <option value={100}>10</option>
              <option value={50}>20</option>
              <option value={33}>30</option>
            </select>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
