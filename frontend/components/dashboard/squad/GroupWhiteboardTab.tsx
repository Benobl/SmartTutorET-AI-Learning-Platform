"use client"

import { useState, useEffect, useRef } from "react"
import { Eraser, Pencil, Trash2, Download, MousePointer2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GroupWhiteboardTabProps {
    squadId: string
    socket: any
}

export function GroupWhiteboardTab({ squadId, socket }: GroupWhiteboardTabProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [color, setColor] = useState("#0ea5e9") // sky-500
    const [brushSize, setBrushSize] = useState(5)
    const [mode, setMode] = useState<"pencil" | "eraser">("pencil")
    const [points, setPoints] = useState<{ x: number, y: number }[]>([])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Join room explicitly
        const join = () => {
            if (socket) socket.emit("join-squad", squadId)
        }

        if (socket) {
            if (socket.connected) join()
            socket.on("connect", join)
        }

        // Set canvas size to parent container size
        const resizeCanvas = () => {
            const parent = canvas.parentElement
            if (parent) {
                // Use offsetParent if parent ClientHeight is 0
                const width = parent.clientWidth || 800
                const height = parent.clientHeight || 500
                canvas.width = width
                canvas.height = height

                // Redraw settings after resize as size change clears the canvas
                ctx.lineCap = "round"
                ctx.lineJoin = "round"
            }
        }

        setTimeout(resizeCanvas, 100) // Small delay to ensure parent has size
        window.addEventListener("resize", resizeCanvas)

        // Socket listener for drawing
        if (socket) {
            socket.on("whiteboard-draw", (data: any) => {
                const { x, y, prevX, prevY, color, size } = data
                drawOnCanvas(ctx, x, y, prevX, prevY, color, size)
            })

            socket.on("whiteboard-clear", () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
            })
        }

        return () => {
            window.removeEventListener("resize", resizeCanvas)
            if (socket) {
                socket.off("whiteboard-draw")
                socket.off("whiteboard-clear")
            }
        }
    }, [socket])

    const drawOnCanvas = (ctx: CanvasRenderingContext2D, x: number, y: number, prevX: number, prevY: number, color: string, size: number, isSmooth = false) => {
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = size
        ctx.lineCap = "round"
        ctx.lineJoin = "round"

        if (isSmooth) {
            // Quadratic curve for smoother lines
            ctx.moveTo(prevX, prevY)
            const midX = (prevX + x) / 2
            const midY = (prevY + y) / 2
            ctx.quadraticCurveTo(prevX, prevY, midX, midY)
        } else {
            ctx.moveTo(prevX, prevY)
            ctx.lineTo(x, y)
        }

        ctx.stroke()
        ctx.closePath()
    }

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true)
        const { x, y } = getCoordinates(e)
        lastPos.current = { x, y }
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const lastPos = useRef({ x: 0, y: 0 })

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }

        const rect = canvas.getBoundingClientRect()
        const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
        const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        }
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return

        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return

        const { x, y } = getCoordinates(e)
        const drawColor = mode === "eraser" ? "#ffffff" : color

        // Standard draw for real-time feedback
        drawOnCanvas(ctx, x, y, lastPos.current.x, lastPos.current.y, drawColor, brushSize, true)

        // Emit to socket
        if (socket) {
            socket.emit("whiteboard-draw", {
                roomId: `squad_${squadId}`,
                x, y,
                prevX: lastPos.current.x,
                prevY: lastPos.current.y,
                color: drawColor,
                size: brushSize
            })
        }

        lastPos.current = { x, y }
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        if (socket) {
            socket.emit("whiteboard-clear", `squad_${squadId}`)
        }
    }

    return (
        <div className="flex flex-col h-[500px] bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 relative">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 p-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 ring-1 ring-black/5">
                <Button
                    size="icon"
                    variant={mode === "pencil" ? "default" : "ghost"}
                    onClick={() => setMode("pencil")}
                    className={cn("w-10 h-10 rounded-xl transition-all", mode === "pencil" ? "bg-sky-600 shadow-lg shadow-sky-600/20 text-white" : "text-slate-500")}
                >
                    <Pencil className="w-5 h-5" />
                </Button>
                <Button
                    size="icon"
                    variant={mode === "eraser" ? "default" : "ghost"}
                    onClick={() => setMode("eraser")}
                    className={cn("w-10 h-10 rounded-xl transition-all", mode === "eraser" ? "bg-slate-900 shadow-lg shadow-slate-900/20 text-white" : "text-slate-500")}
                >
                    <Eraser className="w-5 h-5" />
                </Button>
                <div className="h-px bg-slate-100 mx-1.5 my-1" />

                {/* Brush Sizes */}
                <div className="flex flex-col gap-1 items-center py-1">
                    {[3, 8, 15, 30].map(s => (
                        <button
                            key={s}
                            onClick={() => setBrushSize(s)}
                            className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                brushSize === s ? "bg-sky-50 text-sky-600 border border-sky-100" : "text-slate-400 hover:bg-slate-50"
                            )}
                        >
                            <div className="bg-current rounded-full" style={{ width: Math.max(2, s / 3), height: Math.max(2, s / 3) }} />
                        </button>
                    ))}
                </div>

                <div className="h-px bg-slate-100 mx-1.5 my-1" />
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={clearCanvas}
                    className="w-10 h-10 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </Button>
            </div>

            {/* Color Palette */}
            <div className="absolute top-4 right-4 z-10 flex gap-2 p-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100">
                {["#0ea5e9", "#f43f5e", "#10b981", "#f59e0b", "#6366f1", "#0f172a"].map(c => (
                    <button
                        key={c}
                        onClick={() => { setColor(c); setMode("pencil"); }}
                        className={cn(
                            "w-6 h-6 rounded-full transition-transform hover:scale-110",
                            color === c && mode === "pencil" && "ring-2 ring-offset-2 ring-slate-400"
                        )}
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-hidden cursor-crosshair touch-none bg-white">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full"
                />
            </div>

            {/* Footer / Info */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-4">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MousePointer2 className="w-3 h-3 text-sky-400" /> Real-time Lab Sync Active
                </span>
            </div>
        </div>
    )
}
