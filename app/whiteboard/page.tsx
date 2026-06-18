"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import {
  Pen, Eraser, Square, Circle, Minus, ArrowRight,
  Type, Image as ImageIcon, Trash2, Download, Undo2, Redo2,
  ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronDown, Pipette,
  Triangle, Move
} from "lucide-react";

type Tool = "pen" | "eraser" | "rect" | "circle" | "line" | "arrow" | "text" | "move";

const PRESET_COLORS = [
  "#1e3a8a", "#dc2626", "#16a34a", "#d97706", "#7c3aed",
  "#0891b2", "#be185d", "#000000", "#6b7280", "#ffffff",
];

const BRUSH_SIZES = [2, 4, 8, 14, 22];

function getPos(e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  if ("touches" in e) {
    const t = e.touches[0];
    return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
  }
  return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#1e3a8a");
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [future, setFuture] = useState<ImageData[]>([]);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(100);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [textPos, setTextPos] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState("");
  const [fontSize, setFontSize] = useState(20);

  const getCtx = () => {
    const c = canvasRef.current;
    return c ? c.getContext("2d") : null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 1600;
    canvas.height = 900;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  }, []);

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(h => [...h.slice(-30), data]);
    setFuture([]);
  }, []);

  const undo = () => {
    if (history.length < 2) return;
    const ctx = getCtx(); if (!ctx) return;
    const prev = history[history.length - 2];
    setFuture(f => [history[history.length - 1], ...f]);
    setHistory(h => h.slice(0, -1));
    ctx.putImageData(prev, 0, 0);
  };

  const redo = () => {
    if (future.length === 0) return;
    const ctx = getCtx(); if (!ctx) return;
    ctx.putImageData(future[0], 0, 0);
    setHistory(h => [...h, future[0]]);
    setFuture(f => f.slice(1));
  };

  const clearBoard = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  };

  const download = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `whiteboard-${Date.now()}.png`;
    a.click();
  };

  const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const maxW = canvas.width * 0.6, maxH = canvas.height * 0.6;
        let w = img.width, h = img.height;
        if (w > maxW) { h = h * maxW / w; w = maxW; }
        if (h > maxH) { w = w * maxH / h; h = maxH; }
        ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
        saveHistory();
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const len = 16 + brushSize * 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - len * Math.cos(angle - 0.4), y2 - len * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - len * Math.cos(angle + 0.4), y2 - len * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  };

  const startDraw = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);

    if (tool === "text") {
      setTextPos(pos);
      setTextValue("");
      setTimeout(() => textInputRef.current?.focus(), 50);
      return;
    }

    setIsDrawing(true);
    setStartPos(pos);
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    ctx.globalAlpha = opacity / 100;
    ctx.strokeStyle = tool === "eraser" ? bgColor : color;
    ctx.fillStyle = tool === "eraser" ? bgColor : color;
    ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "pen" || tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  }, [tool, color, brushSize, bgColor, opacity]);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);

    ctx.globalAlpha = opacity / 100;
    ctx.strokeStyle = tool === "eraser" ? bgColor : color;
    ctx.fillStyle = tool === "eraser" ? bgColor : color;
    ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      return;
    }

    if (!snapshot) return;
    ctx.putImageData(snapshot, 0, 0);

    switch (tool) {
      case "rect":
        ctx.beginPath();
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
        break;
      case "circle":
        ctx.beginPath();
        ctx.ellipse(
          (startPos.x + pos.x) / 2, (startPos.y + pos.y) / 2,
          Math.abs(pos.x - startPos.x) / 2, Math.abs(pos.y - startPos.y) / 2,
          0, 0, Math.PI * 2
        );
        ctx.stroke();
        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        break;
      case "arrow":
        drawArrow(ctx, startPos.x, startPos.y, pos.x, pos.y);
        break;
    }
  }, [isDrawing, tool, color, brushSize, bgColor, opacity, startPos, snapshot]);

  const endDraw = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveHistory();
  }, [isDrawing, saveHistory]);

  const commitText = () => {
    if (!textPos || !textValue.trim()) { setTextPos(null); return; }
    const ctx = getCtx(); if (!ctx) return;
    ctx.globalAlpha = opacity / 100;
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px Cairo, Arial`;
    ctx.textAlign = "right";
    ctx.fillText(textValue, textPos.x, textPos.y);
    setTextPos(null);
    setTextValue("");
    saveHistory();
  };

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const opts: AddEventListenerOptions = { passive: false };
    canvas.addEventListener("mousedown", startDraw, opts);
    canvas.addEventListener("mousemove", draw, opts);
    canvas.addEventListener("mouseup", endDraw);
    canvas.addEventListener("mouseleave", endDraw);
    canvas.addEventListener("touchstart", startDraw, opts);
    canvas.addEventListener("touchmove", draw, opts);
    canvas.addEventListener("touchend", endDraw);
    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", endDraw);
      canvas.removeEventListener("mouseleave", endDraw);
      canvas.removeEventListener("touchstart", startDraw);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", endDraw);
    };
  }, [startDraw, draw, endDraw]);

  const TOOLS = [
    { id: "pen", icon: Pen, label: "قلم" },
    { id: "eraser", icon: Eraser, label: "ممحاة" },
    { id: "line", icon: Minus, label: "خط" },
    { id: "arrow", icon: ArrowRight, label: "سهم" },
    { id: "rect", icon: Square, label: "مستطيل" },
    { id: "circle", icon: Circle, label: "دائرة" },
    { id: "text", icon: Type, label: "نص" },
  ] as const;

  const cursorStyle = tool === "eraser" ? "crosshair" : tool === "text" ? "text" : "crosshair";

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-white" : "space-y-3 animate-fade-in"}`}>
      {!isFullscreen && (
        <div className="card p-4 bg-gradient-to-l from-blue-900 to-indigo-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">🖊️ السبورة الذكية</h1>
              <p className="text-blue-200 text-xs mt-0.5">ارسم • اشرح • أضف صور • شارك</p>
            </div>
            <button onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-sm">
              <Maximize2 className="w-4 h-4" /> ملء الشاشة
            </button>
          </div>
        </div>
      )}

      <div className={`flex ${isFullscreen ? "h-screen" : "flex-col"} gap-0`}>
        {/* شريط الأدوات */}
        <div className={`bg-gray-900 text-white flex ${isFullscreen ? "flex-col w-16 py-3 items-center" : "flex-row p-2 flex-wrap gap-1"} gap-1`}>

          {/* الأدوات */}
          {TOOLS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTool(t.id as Tool)} title={t.label}
                className={`flex flex-col items-center justify-center ${isFullscreen ? "w-11 h-11" : "w-10 h-10"} rounded-xl transition-all ${tool === t.id ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-gray-300"}`}>
                <Icon className="w-4 h-4" />
                {!isFullscreen && <span className="text-[9px] mt-0.5">{t.label}</span>}
              </button>
            );
          })}

          {!isFullscreen && <div className="w-px bg-gray-700 self-stretch mx-1" />}
          {isFullscreen && <div className="h-px bg-gray-700 w-full my-1" />}

          {/* الألوان */}
          <div className={`flex ${isFullscreen ? "flex-col" : "flex-row"} gap-1 ${isFullscreen ? "px-1" : ""}`}>
            {PRESET_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`rounded-lg transition-all flex-shrink-0 ${isFullscreen ? "w-9 h-6" : "w-7 h-7"} ${color === c ? "ring-2 ring-white ring-offset-1 ring-offset-gray-900 scale-110" : "opacity-80 hover:opacity-100"}`}
                style={{ backgroundColor: c, border: c === "#ffffff" ? "1px solid #6b7280" : "none" }} />
            ))}
            <div className="relative">
              <button onClick={() => setShowColorPicker(!showColorPicker)} title="لون مخصص"
                className={`${isFullscreen ? "w-9 h-6" : "w-7 h-7"} rounded-lg flex items-center justify-center bg-gradient-to-br from-red-500 via-green-400 to-blue-500 hover:opacity-90`}>
                <Pipette className="w-3 h-3 text-white" />
              </button>
              {showColorPicker && (
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  className="absolute top-8 left-0 w-10 h-10 rounded cursor-pointer border-0 p-0"
                  style={{ zIndex: 100 }} />
              )}
            </div>
          </div>

          {!isFullscreen && <div className="w-px bg-gray-700 self-stretch mx-1" />}
          {isFullscreen && <div className="h-px bg-gray-700 w-full my-1" />}

          {/* حجم الفرشاة */}
          {BRUSH_SIZES.map(s => (
            <button key={s} onClick={() => setBrushSize(s)}
              className={`flex items-center justify-center ${isFullscreen ? "w-11 h-8" : "w-9 h-9"} rounded-lg transition-all ${brushSize === s ? "bg-blue-600" : "hover:bg-gray-700"}`}>
              <div className="rounded-full bg-white" style={{ width: s + 2, height: s + 2, maxWidth: 18, maxHeight: 18 }} />
            </button>
          ))}

          {!isFullscreen && <div className="w-px bg-gray-700 self-stretch mx-1" />}
          {isFullscreen && <div className="h-px bg-gray-700 w-full my-1" />}

          {/* الشفافية */}
          {isFullscreen && (
            <div className="px-1 w-full">
              <input type="range" min={10} max={100} value={opacity} onChange={e => setOpacity(+e.target.value)}
                className="w-full h-1.5 accent-blue-500" title={`شفافية: ${opacity}%`} />
              <p className="text-[9px] text-gray-400 text-center mt-0.5">{opacity}%</p>
            </div>
          )}

          {!isFullscreen && <div className="w-px bg-gray-700 self-stretch mx-1" />}
          {isFullscreen && <div className="h-px bg-gray-700 w-full my-1" />}

          {/* أزرار الأفعال */}
          {[
            { icon: Undo2, fn: undo, label: "تراجع", disabled: history.length < 2 },
            { icon: Redo2, fn: redo, label: "إعادة", disabled: future.length === 0 },
            { icon: Trash2, fn: () => { if (confirm("مسح السبورة كاملاً؟")) clearBoard(); }, label: "مسح" },
            { icon: Download, fn: download, label: "تحميل" },
          ].map(btn => {
            const Icon = btn.icon;
            return (
              <button key={btn.label} onClick={btn.fn} title={btn.label} disabled={btn.disabled}
                className={`flex flex-col items-center justify-center ${isFullscreen ? "w-11 h-11" : "w-10 h-10"} rounded-xl transition-all ${btn.disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-700 text-gray-300 hover:text-white"}`}>
                <Icon className="w-4 h-4" />
                {!isFullscreen && <span className="text-[9px] mt-0.5">{btn.label}</span>}
              </button>
            );
          })}

          {/* رفع صورة */}
          <label title="رفع صورة"
            className={`flex flex-col items-center justify-center ${isFullscreen ? "w-11 h-11" : "w-10 h-10"} rounded-xl hover:bg-gray-700 text-gray-300 hover:text-white cursor-pointer transition-all`}>
            <ImageIcon className="w-4 h-4" />
            {!isFullscreen && <span className="text-[9px] mt-0.5">صورة</span>}
            <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
          </label>

          {isFullscreen && (
            <button onClick={() => setIsFullscreen(false)} title="خروج" className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-gray-700 text-gray-300 mt-auto">
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* لوحة الرسم */}
        <div className="flex-1 relative overflow-hidden bg-gray-200" style={{ cursor: cursorStyle }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain bg-white shadow-inner"
            style={{ touchAction: "none" }}
          />
          {/* إدخال النص */}
          {textPos && (
            <div className="absolute" style={{ left: textPos.x / 2 - 4, top: textPos.y / 2 - 14 }}>
              <input ref={textInputRef} value={textValue} onChange={e => setTextValue(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") commitText(); if (e.key === "Escape") setTextPos(null); }}
                onBlur={commitText}
                className="bg-white/80 border-2 border-blue-500 rounded px-2 py-1 text-sm outline-none"
                placeholder="اكتب ثم Enter" dir="rtl"
              />
            </div>
          )}
        </div>
      </div>

      {/* شريط الحالة */}
      {!isFullscreen && (
        <div className="card p-3 flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span>الأداة: <strong className="text-gray-600">{TOOLS.find(t => t.id === tool)?.label}</strong></span>
            <span className="flex items-center gap-1">اللون: <span className="w-4 h-4 rounded border border-gray-300 inline-block" style={{ background: color }} /></span>
            <span>الحجم: <strong className="text-gray-600">{brushSize}px</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>الشفافية:</span>
            <input type="range" min={10} max={100} value={opacity} onChange={e => setOpacity(+e.target.value)}
              className="w-20 h-1.5 accent-blue-600" />
            <span>{opacity}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
