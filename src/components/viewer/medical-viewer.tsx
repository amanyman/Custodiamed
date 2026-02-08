"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  Brain,
  Search,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AiAnalysisPanel } from "./ai-analysis-panel";

// ─── Window/Level Presets ────────────────────────────────────────────────────
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

const MAGNIFIER_SIZE = 180;
const MAGNIFIER_ZOOM = 3;

// ─── Types ───────────────────────────────────────────────────────────────────
type Tool =
  | "pan"
  | "zoom"
  | "windowLevel"
  | "crosshair"
  | "magnifier"
  | "distance"
  | "angle"
  | "area"
  | "arrow"
  | "text"
  | "freehand"
  | "ellipse";

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

// ─── Component ───────────────────────────────────────────────────────────────
export function MedicalViewer({
  images,
  studyInfo,
  onClose,
}: MedicalViewerProps) {
  // ── Image state ──
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(500);
  const [imageLoaded, setImageLoaded] = useState(false);

  // ── Transform state ──
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [invert, setInvert] = useState(false);

  // ── Window/Level state ──
  const [windowWidth, setWindowWidth] = useState(400);
  const [windowCenter, setWindowCenter] = useState(40);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // ── Tool state ──
  const [activeTool, setActiveTool] = useState<Tool>("pan");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] =
    useState<Annotation | null>(null);

  // ── Text annotation state ──
  const [textInputPos, setTextInputPos] = useState<Point | null>(null);
  const [textInputValue, setTextInputValue] = useState("");

  // ── Layout state ──
  const [gridLayout, setGridLayout] = useState<"1x1" | "1x2" | "2x2">("1x1");
  const [showInfo, setShowInfo] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(images.length > 1);
  const [cursorPos, setCursorPos] = useState<Point | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // ── Refs ──
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef<Point>({ x: 0, y: 0 });
  const initialPan = useRef<Point>({ x: 0, y: 0 });
  const initialWindowLevel = useRef({ window: 400, level: 40 });

  // ── Effects ────────────────────────────────────────────────────────────────

  // Auto-play
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

  // Focus text input when it appears
  useEffect(() => {
    if (textInputPos && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [textInputPos]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

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
          setZoom((prev) => Math.min(10, prev * 1.1));
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
        case "m":
          setActiveTool("magnifier");
          break;
        case "t":
          setShowThumbnails((prev) => !prev);
          break;
        case "Delete":
        case "Backspace":
          undoAnnotation();
          break;
        case "Escape":
          if (textInputPos) {
            setTextInputPos(null);
            setTextInputValue("");
          } else if (isFullscreen) {
            document.exitFullscreen();
          }
          setActiveTool("pan");
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9": {
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
  }, [images.length, isFullscreen, textInputPos]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const getImageCoords = useCallback(
    (e: React.MouseEvent): Point => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      // Handle text tool click
      if (activeTool === "text") {
        const coords = getImageCoords(e);
        setTextInputPos(coords);
        setTextInputValue("");
        return;
      }

      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      initialPan.current = { ...pan };
      initialWindowLevel.current = { window: windowWidth, level: windowCenter };

      const measurementTools: Tool[] = [
        "distance",
        "angle",
        "area",
        "arrow",
        "freehand",
        "ellipse",
      ];
      if (measurementTools.includes(activeTool)) {
        const coords = getImageCoords(e);
        setCurrentAnnotation({
          id: Date.now().toString(),
          type: activeTool,
          points: [coords],
          color: "#22d3ee",
          imageIndex: currentIndex,
        });
      }
    },
    [
      activeTool,
      pan,
      zoom,
      windowWidth,
      windowCenter,
      currentIndex,
      getImageCoords,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Track cursor for crosshair, magnifier, and info
      if (
        activeTool === "crosshair" ||
        activeTool === "magnifier" ||
        showInfo
      ) {
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
        case "pan":
          setPan({
            x: initialPan.current.x + dx,
            y: initialPan.current.y + dy,
          });
          break;
        case "zoom": {
          const zoomDelta = dy * -0.005;
          setZoom((prev) =>
            Math.max(0.1, Math.min(10, prev + zoomDelta * prev))
          );
          break;
        }
        case "windowLevel":
          setWindowWidth(
            Math.max(1, initialWindowLevel.current.window + dx * 4)
          );
          setWindowCenter(initialWindowLevel.current.level - dy * 2);
          setBrightness(
            Math.max(0, Math.min(400, 100 + (40 - windowCenter) * 0.5))
          );
          setContrast(
            Math.max(0, Math.min(400, 100 + (windowWidth - 400) * 0.05))
          );
          break;
        case "crosshair":
        case "magnifier":
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
    [
      activeTool,
      currentAnnotation,
      pan,
      zoom,
      getImageCoords,
      showInfo,
      windowCenter,
      windowWidth,
    ]
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
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom((prev) => Math.max(0.1, Math.min(10, prev * delta)));
      } else {
        if (e.deltaY > 0) {
          setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
        } else {
          setCurrentIndex((prev) => Math.max(0, prev - 1));
        }
      }
    },
    [images.length]
  );

  const handleTextSubmit = useCallback(() => {
    if (textInputPos && textInputValue.trim()) {
      setAnnotations((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "text" as Tool,
          points: [textInputPos],
          text: textInputValue.trim(),
          color: "#22d3ee",
          imageIndex: currentIndex,
        },
      ]);
    }
    setTextInputPos(null);
    setTextInputValue("");
  }, [textInputPos, textInputValue, currentIndex]);

  // ── Actions ────────────────────────────────────────────────────────────────

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

  // ── Calculations ───────────────────────────────────────────────────────────

  const calculateDistance = (p1: Point, p2: Point) => {
    const px = Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
    );
    return (px * 0.25).toFixed(1);
  };

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

  // ── Computed values ────────────────────────────────────────────────────────

  const imageTransform = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
    filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? "invert(1)" : ""}`,
    transition: isDragging.current ? "none" : "transform 0.15s ease-out",
  };

  const getCursor = () => {
    switch (activeTool) {
      case "pan":
        return "grab";
      case "zoom":
        return "zoom-in";
      case "windowLevel":
        return "col-resize";
      case "crosshair":
        return "crosshair";
      case "magnifier":
        return "none";
      case "distance":
      case "angle":
      case "area":
      case "ellipse":
      case "arrow":
      case "freehand":
        return "crosshair";
      case "text":
        return "text";
      default:
        return "default";
    }
  };

  const currentImageAnnotations = annotations.filter(
    (a) => a.imageIndex === currentIndex
  );

  // ── Sub-components ─────────────────────────────────────────────────────────

  const ToolBtn = ({
    tool,
    icon: Icon,
    label,
    shortcut,
  }: {
    tool: Tool;
    icon: React.ElementType;
    label: string;
    shortcut?: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => setActiveTool(tool)}
          className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-150",
            activeTool === tool
              ? "bg-blue-500/20 text-blue-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.3)]"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.08]"
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="bg-zinc-900/95 backdrop-blur border-zinc-700/50 px-2.5 py-1.5"
      >
        <p className="text-[11px] font-medium">
          {label}
          {shortcut && (
            <kbd className="ml-2 text-[10px] text-zinc-500 bg-zinc-800 px-1 py-0.5 rounded font-mono">
              {shortcut}
            </kbd>
          )}
        </p>
      </TooltipContent>
    </Tooltip>
  );

  const ActionBtn = ({
    icon: Icon,
    label,
    onClick,
    active,
    shortcut,
    className: extraClass,
  }: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    active?: boolean;
    shortcut?: string;
    className?: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-150",
            active
              ? "bg-blue-500/20 text-blue-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.3)]"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.08]",
            extraClass
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="bg-zinc-900/95 backdrop-blur border-zinc-700/50 px-2.5 py-1.5"
      >
        <p className="text-[11px] font-medium">
          {label}
          {shortcut && (
            <kbd className="ml-2 text-[10px] text-zinc-500 bg-zinc-800 px-1 py-0.5 rounded font-mono">
              {shortcut}
            </kbd>
          )}
        </p>
      </TooltipContent>
    </Tooltip>
  );

  const Divider = () => (
    <div className="w-px h-5 bg-white/[0.06] mx-1" />
  );

  // ── Render annotations ─────────────────────────────────────────────────────

  const renderAnnotation = (
    annotation: Annotation,
    isPreview: boolean = false
  ) => {
    const strokeDash = isPreview ? `${4 / zoom}` : undefined;
    const sw = 1.5 / zoom;
    const fontSize = 11 / zoom;

    return (
      <g key={annotation.id}>
        {/* Distance */}
        {annotation.type === "distance" && annotation.points.length >= 2 && (
          <>
            <line
              x1={annotation.points[0].x}
              y1={annotation.points[0].y}
              x2={annotation.points[1].x}
              y2={annotation.points[1].y}
              stroke={annotation.color}
              strokeWidth={sw}
              strokeDasharray={strokeDash}
            />
            {/* End caps */}
            <line
              x1={annotation.points[0].x - 5 / zoom}
              y1={annotation.points[0].y}
              x2={annotation.points[0].x + 5 / zoom}
              y2={annotation.points[0].y}
              stroke={annotation.color}
              strokeWidth={sw}
              transform={`rotate(${(Math.atan2(annotation.points[1].y - annotation.points[0].y, annotation.points[1].x - annotation.points[0].x) * 180) / Math.PI + 90}, ${annotation.points[0].x}, ${annotation.points[0].y})`}
            />
            <line
              x1={annotation.points[1].x - 5 / zoom}
              y1={annotation.points[1].y}
              x2={annotation.points[1].x + 5 / zoom}
              y2={annotation.points[1].y}
              stroke={annotation.color}
              strokeWidth={sw}
              transform={`rotate(${(Math.atan2(annotation.points[1].y - annotation.points[0].y, annotation.points[1].x - annotation.points[0].x) * 180) / Math.PI + 90}, ${annotation.points[1].x}, ${annotation.points[1].y})`}
            />
            {/* Measurement label */}
            <rect
              x={
                (annotation.points[0].x + annotation.points[1].x) / 2 -
                30 / zoom
              }
              y={
                (annotation.points[0].y + annotation.points[1].y) / 2 -
                18 / zoom
              }
              width={60 / zoom}
              height={18 / zoom}
              rx={4 / zoom}
              fill="rgba(0,0,0,0.75)"
              stroke={annotation.color}
              strokeWidth={0.5 / zoom}
            />
            <text
              x={(annotation.points[0].x + annotation.points[1].x) / 2}
              y={
                (annotation.points[0].y + annotation.points[1].y) / 2 -
                6 / zoom
              }
              fill={annotation.color}
              fontSize={fontSize}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              fontWeight="500"
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
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={annotation.color}
                />
              </marker>
            </defs>
            <line
              x1={annotation.points[0].x}
              y1={annotation.points[0].y}
              x2={annotation.points[1].x}
              y2={annotation.points[1].y}
              stroke={annotation.color}
              strokeWidth={sw}
              strokeDasharray={strokeDash}
              markerEnd={`url(#arrow-${annotation.id})`}
            />
          </>
        )}

        {/* Ellipse */}
        {annotation.type === "ellipse" && annotation.points.length >= 2 && (
          <ellipse
            cx={(annotation.points[0].x + annotation.points[1].x) / 2}
            cy={(annotation.points[0].y + annotation.points[1].y) / 2}
            rx={
              Math.abs(annotation.points[1].x - annotation.points[0].x) / 2
            }
            ry={
              Math.abs(annotation.points[1].y - annotation.points[0].y) / 2
            }
            stroke={annotation.color}
            strokeWidth={sw}
            fill="none"
            strokeDasharray={strokeDash}
          />
        )}

        {/* Freehand */}
        {annotation.type === "freehand" && annotation.points.length >= 2 && (
          <polyline
            points={annotation.points.map((p) => `${p.x},${p.y}`).join(" ")}
            stroke={annotation.color}
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Text annotation */}
        {annotation.type === "text" && annotation.text && (
          <>
            <rect
              x={annotation.points[0].x}
              y={annotation.points[0].y - 16 / zoom}
              width={
                (annotation.text.length * 7) / zoom + 12 / zoom
              }
              height={20 / zoom}
              rx={4 / zoom}
              fill="rgba(0,0,0,0.75)"
              stroke={annotation.color}
              strokeWidth={0.5 / zoom}
            />
            <text
              x={annotation.points[0].x + 6 / zoom}
              y={annotation.points[0].y - 3 / zoom}
              fill={annotation.color}
              fontSize={fontSize}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontWeight="500"
            >
              {annotation.text}
            </text>
          </>
        )}
      </g>
    );
  };

  // ─── MAIN RENDER ───────────────────────────────────────────────────────────

  return (
    <TooltipProvider delayDuration={200}>
      <div
        ref={containerRef}
        className={cn(
          "flex flex-col bg-[#08080c] select-none",
          isFullscreen
            ? "fixed inset-0 z-50"
            : "h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/50"
        )}
      >
        {/* ═══ TOP TOOLBAR ═══ */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-gradient-to-b from-white/[0.04] to-white/[0.02] backdrop-blur-xl border-b border-white/[0.06] shrink-0">
          {/* Left: Navigation tools */}
          <div className="flex items-center gap-0.5">
            <ToolBtn tool="pan" icon={Move} label="Pan" shortcut="P" />
            <ToolBtn tool="zoom" icon={ZoomIn} label="Zoom" shortcut="Z" />
            <ToolBtn
              tool="windowLevel"
              icon={Contrast}
              label="Window/Level"
              shortcut="W"
            />
            <ToolBtn
              tool="crosshair"
              icon={Crosshair}
              label="Crosshair"
              shortcut="C"
            />
            <ToolBtn
              tool="magnifier"
              icon={Search}
              label="Magnifier"
              shortcut="M"
            />

            <Divider />

            <ActionBtn
              icon={ZoomIn}
              label="Zoom In"
              onClick={() => setZoom((z) => Math.min(10, z * 1.25))}
            />
            <ActionBtn
              icon={ZoomOut}
              label="Zoom Out"
              onClick={() => setZoom((z) => Math.max(0.1, z / 1.25))}
            />

            <span className="text-[10px] text-zinc-500 w-12 text-center font-mono tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Center: Measurement & Annotation tools */}
          <div className="flex items-center gap-0.5">
            <ToolBtn
              tool="distance"
              icon={Ruler}
              label="Distance"
              shortcut="D"
            />
            <ToolBtn tool="angle" icon={Circle} label="Angle" shortcut="A" />
            <ToolBtn tool="ellipse" icon={ScanLine} label="Ellipse ROI" />
            <ToolBtn tool="arrow" icon={ArrowUpRight} label="Arrow" />
            <ToolBtn tool="text" icon={Type} label="Text" />
            <ToolBtn tool="freehand" icon={Pencil} label="Freehand" />

            <Divider />

            <ActionBtn
              icon={Undo}
              label="Undo"
              onClick={undoAnnotation}
              shortcut="Del"
            />
            <ActionBtn
              icon={Trash2}
              label="Clear All"
              onClick={clearAnnotations}
            />

            {currentImageAnnotations.length > 0 && (
              <span className="text-[10px] text-zinc-500 ml-1 font-mono tabular-nums">
                {currentImageAnnotations.length}
              </span>
            )}
          </div>

          {/* Right: View controls */}
          <div className="flex items-center gap-0.5">
            <ActionBtn
              icon={RotateCw}
              label="Rotate 90deg"
              onClick={() => setRotation((r) => r + 90)}
            />
            <ActionBtn
              icon={FlipHorizontal}
              label="Flip H"
              onClick={() => setFlipH(!flipH)}
              active={flipH}
            />
            <ActionBtn
              icon={FlipVertical}
              label="Flip V"
              onClick={() => setFlipV(!flipV)}
              active={flipV}
            />
            <ActionBtn
              icon={Sun}
              label="Invert"
              onClick={() => setInvert(!invert)}
              active={invert}
              shortcut="I"
            />

            <Divider />

            {/* W/L Presets Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all text-[11px] font-medium">
                  <Contrast className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">W/L</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900/95 backdrop-blur-xl border-zinc-700/50 shadow-2xl">
                <DropdownMenuLabel className="text-zinc-500 text-[11px]">
                  Window/Level Presets
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-700/50" />
                {Object.entries(WINDOW_PRESETS).map(([key, preset]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() =>
                      applyPreset(key as keyof typeof WINDOW_PRESETS)
                    }
                    className="text-zinc-200 hover:bg-white/10 text-xs justify-between cursor-pointer"
                  >
                    {preset.name}
                    <kbd className="text-zinc-600 text-[10px] font-mono bg-zinc-800 px-1 py-0.5 rounded">
                      {preset.shortcut}
                    </kbd>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Layout Grid */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all">
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900/95 backdrop-blur-xl border-zinc-700/50 shadow-2xl">
                <DropdownMenuLabel className="text-zinc-500 text-[11px]">
                  Layout
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-700/50" />
                {(["1x1", "1x2", "2x2"] as const).map((layout) => (
                  <DropdownMenuItem
                    key={layout}
                    onClick={() => setGridLayout(layout)}
                    className={cn(
                      "text-xs cursor-pointer",
                      gridLayout === layout
                        ? "text-blue-400 bg-blue-500/10"
                        : "text-zinc-200 hover:bg-white/10"
                    )}
                  >
                    {layout.replace("x", " x ")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <ActionBtn
              icon={Info}
              label="Toggle Info"
              onClick={() => setShowInfo(!showInfo)}
              active={showInfo}
            />
            <ActionBtn
              icon={RefreshCw}
              label="Reset"
              onClick={resetView}
              shortcut="R"
            />
            <ActionBtn
              icon={isFullscreen ? Minimize : Maximize}
              label="Fullscreen"
              onClick={toggleFullscreen}
              shortcut="F"
            />

            <Divider />

            {/* AI Analysis Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowAiPanel(!showAiPanel)}
                  className={cn(
                    "h-8 px-2.5 rounded-lg flex items-center gap-1.5 transition-all duration-150 text-[11px] font-medium",
                    showAiPanel
                      ? "bg-gradient-to-r from-violet-500/20 to-blue-500/20 text-violet-400 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.3)]"
                      : "text-zinc-400 hover:text-violet-400 hover:bg-violet-500/10"
                  )}
                >
                  <Brain className="h-4 w-4" />
                  <span className="hidden lg:inline">AI</span>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-zinc-900/95 backdrop-blur border-zinc-700/50"
              >
                <p className="text-[11px] font-medium">AI Analysis</p>
              </TooltipContent>
            </Tooltip>

            {/* Keyboard Shortcuts */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-all">
                  <Keyboard className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-zinc-900/95 backdrop-blur-xl border-zinc-700/50 shadow-2xl w-64"
                align="end"
              >
                <DropdownMenuLabel className="text-zinc-500 text-[11px]">
                  Keyboard Shortcuts
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-700/50" />
                <div className="px-1 py-1 space-y-0.5">
                  {[
                    ["P", "Pan tool"],
                    ["Z", "Zoom tool"],
                    ["W", "Window/Level"],
                    ["C", "Crosshair"],
                    ["M", "Magnifier"],
                    ["D", "Distance"],
                    ["A", "Angle"],
                    ["I", "Invert colors"],
                    ["R", "Reset view"],
                    ["F", "Fullscreen"],
                    ["Space", "Play/Pause cine"],
                    ["Arrows", "Navigate / Zoom"],
                    ["Scroll", "Navigate slices"],
                    ["Ctrl+Scroll", "Zoom"],
                    ["1-9", "W/L presets"],
                    ["Del", "Undo annotation"],
                    ["Esc", "Reset tool"],
                  ].map(([key, desc]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between px-2 py-1 rounded-md"
                    >
                      <span className="text-[11px] text-zinc-400">{desc}</span>
                      <kbd className="bg-zinc-800/80 text-zinc-300 px-1.5 py-0.5 rounded text-[10px] font-mono min-w-[24px] text-center">
                        {key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="flex flex-1 min-h-0">
          {/* ── Thumbnail Strip ── */}
          {showThumbnails && images.length > 1 && (
            <div className="w-[88px] bg-[#0a0a0f] border-r border-white/[0.04] overflow-y-auto shrink-0 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              <div className="p-1.5 space-y-1.5">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "w-full aspect-square rounded-lg overflow-hidden relative group transition-all duration-200",
                      currentIndex === idx
                        ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-[#0a0a0f] shadow-lg shadow-blue-500/20"
                        : "opacity-50 hover:opacity-90 hover:ring-1 hover:ring-white/20"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Slice ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div
                      className={cn(
                        "absolute inset-x-0 bottom-0 py-0.5 text-center text-[9px] font-mono",
                        currentIndex === idx
                          ? "bg-blue-500/80 text-white"
                          : "bg-black/60 text-zinc-400"
                      )}
                    >
                      {idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Viewport Area ── */}
          <div className="flex-1 relative overflow-hidden">
            <div
              className={cn(
                "h-full w-full grid gap-px bg-zinc-900/50",
                gridLayout === "1x1" && "grid-cols-1",
                gridLayout === "1x2" && "grid-cols-2",
                gridLayout === "2x2" && "grid-cols-2 grid-rows-2"
              )}
            >
              {/* Primary Viewport */}
              <div
                ref={viewportRef}
                className="relative bg-black overflow-hidden"
                style={{
                  cursor:
                    isDragging.current && activeTool === "pan"
                      ? "grabbing"
                      : getCursor(),
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  handleMouseUp();
                  setCursorPos(null);
                }}
                onWheel={handleWheel}
              >
                {/* Image */}
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
                      className="absolute top-0 bottom-0 w-px pointer-events-none"
                      style={{
                        left: cursorPos.x,
                        background:
                          "linear-gradient(to bottom, transparent 0%, rgba(34,211,238,0.6) 30%, rgba(34,211,238,0.6) 70%, transparent 100%)",
                      }}
                    />
                    <div
                      className="absolute left-0 right-0 h-px pointer-events-none"
                      style={{
                        top: cursorPos.y,
                        background:
                          "linear-gradient(to right, transparent 0%, rgba(34,211,238,0.6) 30%, rgba(34,211,238,0.6) 70%, transparent 100%)",
                      }}
                    />
                    {/* Crosshair center dot */}
                    <div
                      className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 pointer-events-none"
                      style={{
                        left: cursorPos.x - 3,
                        top: cursorPos.y - 3,
                      }}
                    />
                  </>
                )}

                {/* Magnifier Lens Overlay */}
                {activeTool === "magnifier" && cursorPos && (
                  <div
                    className="absolute pointer-events-none rounded-full overflow-hidden shadow-2xl"
                    style={{
                      width: MAGNIFIER_SIZE,
                      height: MAGNIFIER_SIZE,
                      left: cursorPos.x - MAGNIFIER_SIZE / 2,
                      top: cursorPos.y - MAGNIFIER_SIZE / 2,
                      border: "2px solid rgba(255,255,255,0.15)",
                      boxShadow:
                        "0 0 0 1px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.02)",
                    }}
                  >
                    {/* Magnified image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={images[currentIndex]}
                      alt=""
                      className="absolute select-none"
                      style={{
                        width:
                          (viewportRef.current?.offsetWidth || 800) *
                          MAGNIFIER_ZOOM,
                        height:
                          (viewportRef.current?.offsetHeight || 600) *
                          MAGNIFIER_ZOOM,
                        left: -(
                          cursorPos.x * MAGNIFIER_ZOOM -
                          MAGNIFIER_SIZE / 2
                        ),
                        top: -(
                          cursorPos.y * MAGNIFIER_ZOOM -
                          MAGNIFIER_SIZE / 2
                        ),
                        filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? "invert(1)" : ""}`,
                        objectFit: "contain",
                        objectPosition: "center",
                      }}
                      draggable={false}
                    />
                    {/* Magnifier crosshair */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-px h-full bg-white/20" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="h-px w-full bg-white/20" />
                    </div>
                    {/* Magnification label */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/70 text-white/60 text-[9px] font-mono px-1.5 py-0.5 rounded">
                      {MAGNIFIER_ZOOM}x
                    </div>
                  </div>
                )}

                {/* Text Input Overlay */}
                {textInputPos && (
                  <div
                    className="absolute z-20"
                    style={{
                      left: textInputPos.x * zoom + pan.x,
                      top: textInputPos.y * zoom + pan.y - 32,
                    }}
                  >
                    <input
                      ref={textInputRef}
                      type="text"
                      value={textInputValue}
                      onChange={(e) => setTextInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleTextSubmit();
                        }
                        if (e.key === "Escape") {
                          setTextInputPos(null);
                          setTextInputValue("");
                        }
                      }}
                      onBlur={handleTextSubmit}
                      placeholder="Type annotation..."
                      className="bg-black/80 border border-cyan-500/50 text-cyan-300 text-xs px-2 py-1 rounded-md outline-none focus:border-cyan-400 font-sans min-w-[120px] placeholder:text-zinc-600"
                    />
                  </div>
                )}

                {/* Annotations SVG Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <g
                    transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
                  >
                    {currentImageAnnotations.map((annotation) =>
                      renderAnnotation(annotation)
                    )}
                    {currentAnnotation &&
                      renderAnnotation(currentAnnotation, true)}
                  </g>
                </svg>

                {/* ── HUD Overlays ── */}

                {/* Top-Left: Patient & Study Info */}
                {showInfo && studyInfo && (
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 space-y-0.5">
                      {studyInfo.patientName && (
                        <div className="text-[11px] text-emerald-400/90 font-mono font-medium">
                          {studyInfo.patientName}
                        </div>
                      )}
                      {studyInfo.studyDate && (
                        <div className="text-[11px] text-emerald-400/70 font-mono">
                          {studyInfo.studyDate}
                        </div>
                      )}
                      {studyInfo.modality && (
                        <div className="text-[11px] text-emerald-400/70 font-mono">
                          {studyInfo.modality}
                        </div>
                      )}
                      {studyInfo.seriesDescription && (
                        <div className="text-[11px] text-emerald-400/60 font-mono">
                          {studyInfo.seriesDescription}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Top-Right: Technical Info */}
                {showInfo && (
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 space-y-0.5 text-right">
                      <div className="text-[11px] text-emerald-400/80 font-mono">
                        W:{windowWidth} L:{windowCenter}
                      </div>
                      <div className="text-[11px] text-emerald-400/70 font-mono">
                        Zoom: {Math.round(zoom * 100)}%
                      </div>
                      {rotation !== 0 && (
                        <div className="text-[11px] text-emerald-400/60 font-mono">
                          Rot: {rotation}deg
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom-Left: Active Tool Indicator */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
                  <div className="bg-blue-500/80 backdrop-blur-sm rounded-md px-2.5 py-1 text-[10px] text-white font-semibold uppercase tracking-widest">
                    {activeTool === "windowLevel"
                      ? "W/L"
                      : activeTool.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                  {(flipH || flipV || invert) && (
                    <div className="bg-amber-500/70 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] text-white font-mono">
                      {flipH && "H "}
                      {flipV && "V "}
                      {invert && "INV"}
                    </div>
                  )}
                </div>

                {/* Bottom-Right: Image Counter */}
                {showInfo && images.length > 0 && (
                  <div className="absolute bottom-3 right-3 pointer-events-none">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 text-[11px] text-emerald-400/80 font-mono">
                      {currentIndex + 1} / {images.length}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {images.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-4">
                        <ScanLine className="h-10 w-10 text-zinc-700" />
                      </div>
                      <p className="text-sm font-medium text-zinc-600">
                        No images to display
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional viewports for grid layouts */}
              {gridLayout !== "1x1" && (
                <div className="bg-zinc-950 flex items-center justify-center text-zinc-800 text-xs border border-zinc-800/30">
                  <div className="text-center">
                    <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-[11px]">Viewport 2</p>
                  </div>
                </div>
              )}
              {gridLayout === "2x2" && (
                <>
                  <div className="bg-zinc-950 flex items-center justify-center text-zinc-800 text-xs border border-zinc-800/30">
                    <div className="text-center">
                      <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-[11px]">Viewport 3</p>
                    </div>
                  </div>
                  <div className="bg-zinc-950 flex items-center justify-center text-zinc-800 text-xs border border-zinc-800/30">
                    <div className="text-center">
                      <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-[11px]">Viewport 4</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── AI Analysis Panel ── */}
          {showAiPanel && images.length > 0 && (
            <AiAnalysisPanel
              imageUrl={images[currentIndex]}
              onClose={() => setShowAiPanel(false)}
            />
          )}
        </div>

        {/* ═══ BOTTOM TOOLBAR - Cine Player ═══ */}
        <div className="flex items-center justify-center gap-3 px-3 py-1.5 bg-gradient-to-t from-white/[0.03] to-white/[0.015] backdrop-blur-xl border-t border-white/[0.06] shrink-0">
          {/* Thumbnail toggle */}
          {images.length > 1 && (
            <>
              <ActionBtn
                icon={ScanLine}
                label="Toggle Thumbnails"
                onClick={() => setShowThumbnails(!showThumbnails)}
                active={showThumbnails}
                shortcut="T"
              />
              <Divider />
            </>
          )}

          {/* Playback controls */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setCurrentIndex(0)}
              disabled={currentIndex === 0}
              className="h-7 w-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-500 transition-colors"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="h-7 w-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-500 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                "h-7 w-7 rounded-md flex items-center justify-center transition-all",
                isPlaying
                  ? "bg-blue-500/20 text-blue-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.3)]"
                  : "text-zinc-500 hover:text-white"
              )}
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() =>
                setCurrentIndex((i) => Math.min(images.length - 1, i + 1))
              }
              disabled={currentIndex === images.length - 1}
              className="h-7 w-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-500 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setCurrentIndex(images.length - 1)}
              disabled={currentIndex === images.length - 1}
              className="h-7 w-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-500 transition-colors"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
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
            <span className="text-[10px] text-zinc-600 font-mono">FPS</span>
            <select
              value={playSpeed}
              onChange={(e) => setPlaySpeed(Number(e.target.value))}
              className="bg-zinc-900/80 text-zinc-400 text-[10px] rounded-md px-1.5 py-1 border border-white/[0.06] font-mono appearance-none cursor-pointer hover:border-white/10 transition-colors"
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
