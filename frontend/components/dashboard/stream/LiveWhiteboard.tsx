"use client"

import { useState, useEffect, useRef } from "react"
import { Eraser, Pencil, Trash2, MousePointer2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LiveWhiteboardProps {
    roomId: string
    socket: any
    isHost?: boolean
}

export function LiveWhiteboard({ roomId, socket, isHost = false }: LiveWhiteboardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [color, setColor] = useState("#0ea5e9") // sky-500
    const [brushSize, setBrushSize] = useState(5)
    const [mode, setMode] = useState<"pencil" | "eraser">("pencil")

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Join room explicitly
        const join = () => {
            if (socket) socket.emit("join-room", roomId)
        }

        if (socket) {
            if (socket.connected) join()
            socket.on("connect", join)
        }

        // Set canvas size
        const resizeCanvas = () => {
            const parent = canvas.parentElement
            if (parent) {
                canvas.width = parent.clientWidth
                canvas.height = parent.clientHeight
                ctx.lineCap = "round"
                ctx.lineJoin = "round"
            }
        }

        resizeCanvas()
        window.addEventListener("resize", resizeCanvas)

        // Socket listeners
        if (socket) {
            socket.on("whiteboard-draw", (data: any) => {
                if (data.roomId === roomId) {
                    drawOnCanvas(ctx, data.x, data.y, data.prevX, data.prevY, data.color, data.size)
                }
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
    }, [socket, roomId])

    const drawOnCanvas = (ctx: CanvasRenderingContext2D, x: number, y: number, prevX: number, prevY: number, color: string, size: number) => {
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = size
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.closePath()
    }

    const lastPos = useRef({ x: 0, y: 0 })

    const getCoordinates = (e: any) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        return { x: clientX - rect.left, y: clientY - rect.top }
    }

    const startDrawing = (e: any) => {
        if (!isHost && mode !== "pencil") return // Allow students to draw only if permitted? For now let's allow all
        setIsDrawing(true)
        const { x, y } = getCoordinates(e)
        lastPos.current = { x, y }
    }

    const draw = (e: any) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return

        const { x, y } = getCoordinates(e)
        const drawColor = mode === "eraser" ? "#ffffff" : color

        drawOnCanvas(ctx, x, y, lastPos.current.x, lastPos.current.y, drawColor, brushSize)

        if (socket) {
            socket.emit("whiteboard-draw", {
                roomId,
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
        if (socket) socket.emit("whiteboard-clear", roomId)
    }

    return (
        <div className="w-full h-full bg-white relative flex flex-col">
            {/* Whiteboard Controls */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 p-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                <Button
                    size="icon"
                    variant={mode === "pencil" ? "default" : "ghost"}
                    onClick={() => setMode("pencil")}
                    className={cn("w-9 h-9 rounded-xl", mode === "pencil" ? "bg-sky-500 text-white" : "text-slate-400")}
                >
                    <Pencil className="w-4 h-4" />
                </Button>
                <Button
                    size="icon"
                    variant={mode === "eraser" ? "default" : "ghost"}
                    onClick={() => setMode("eraser")}
                    className={cn("w-9 h-9 rounded-xl", mode === "eraser" ? "bg-white text-slate-900" : "text-slate-400")}
                >
                    <Eraser className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                {["#0ea5e9", "#f43f5e", "#10b981", "#f59e0b", "#ffffff"].map(c => (
                    <button
                        key={c}
                        onClick={() => { setColor(c); setMode("pencil"); }}
                        className={cn(
                            "w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-110",
                            color === c && mode === "pencil" && "ring-2 ring-sky-500 ring-offset-2 ring-offset-slate-900"
                        )}
                        style={{ backgroundColor: c }}
                    />
                ))}
                <div className="w-px h-6 bg-white/10 mx-1" />
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={clearCanvas}
                    className="w-9 h-9 rounded-xl text-rose-500 hover:bg-rose-500/10"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={() => setIsDrawing(false)}
                onMouseOut={() => setIsDrawing(false)}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={() => setIsDrawing(false)}
                className="flex-1 cursor-crosshair touch-none"
            />

            <div className="absolute bottom-4 right-4 text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-100">
                <MousePointer2 className="w-3 h-3 text-sky-500" /> Interactive Board Active
            </div>
        </div>
    )
}
