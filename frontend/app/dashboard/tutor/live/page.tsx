"use client"

import { useState } from "react"
import {
    Video, Mic, MicOff, VideoOff, Settings,
    MessageSquare, Users, LayoutGrid, X,
    MonitorPlay, Share2, PanelRight, Hand,
    MoreVertical, Plus, Clock, GraduationCap,
    Sparkles, ArrowUpRight, ChevronRight,
    Disc, PlayCircle, Users2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRef, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { mockTeacherData } from "@/lib/teacher-data"

const MOCK_LIVE_SESSSIONS = [
    { id: "ls1", title: "Grade 12 Physics: Quantum Entanglement", time: "Starts in 15 mins", students: 42, active: true },
    { id: "ls2", title: "Grade 11 Math: Trigonometric Identities", time: "Today, 14:00", students: 52, active: false },
]

const MIGHTY_STUDENTS = [
    { id: "ms1", name: "Biniyam S.", status: "connected", handRaised: true },
    { id: "ms2", name: "Helena T.", status: "muted", handRaised: false },
    { id: "ms3", name: "Dagmawi G.", status: "connected", handRaised: false },
]

export default function TeacherLive() {
    const { toast } = useToast()
    const [isLive, setIsLive] = useState(false)
    const [activeTab, setActiveTab] = useState<"chat" | "students" | "settings">("chat")
    const [sessions, setSessions] = useState(MOCK_LIVE_SESSSIONS)

    // Media Refs & States
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [isSharingScreen, setIsSharingScreen] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [chatInput, setChatInput] = useState("")
    const [messages, setMessages] = useState([
        { id: "m1", user: "Biniyam S.", text: "Professor, can you re-explain the measurement problem in quantum physics?" },
        { id: "m2", user: "Helena T.", text: "+1 to Biniyam's question!" }
    ])

    // Scheduling States
    const [isSchedulingOpen, setIsSchedulingOpen] = useState(false)
    const [isRecordingsOpen, setIsRecordingsOpen] = useState(false)
    const [isResourcesOpen, setIsResourcesOpen] = useState(false)
    const [selectedRecording, setSelectedRecording] = useState<any>(null)
    const [resources, setResources] = useState([
        { id: "r1", name: "Curriculum_Standards_v2.pdf", size: "2.4 MB", type: "PDF" }
    ])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [newSession, setNewSession] = useState({
        title: "",
        course: "",
        time: "",
        grade: ""
    })

    // Media Logic
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
            setIsLive(true)
        } catch (err) {
            console.error("Error accessing media devices.", err)
            toast({
                variant: "destructive",
                title: "Camera Access Failed",
                description: "Please ensure you have given permission to access your camera and microphone.",
            })
        }
    }

    const stopMedia = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        setIsLive(false)
        setIsSharingScreen(false)
    }

    const toggleMute = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = isMuted
                setIsMuted(!isMuted)
            }
        }
    }

    const toggleVideo = async () => {
        if (!streamRef.current) return

        const videoTrack = streamRef.current.getVideoTracks()[0]
        if (!videoTrack) return

        if (!isVideoOff) {
            // Turning OFF: Stop the track completely to turn off the hardware light
            videoTrack.stop()
            streamRef.current.removeTrack(videoTrack)
            setIsVideoOff(true)
        } else {
            // Turning ON: Re-acquire the video track
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({ video: true })
                const newVideoTrack = newStream.getVideoTracks()[0]
                streamRef.current.addTrack(newVideoTrack)
                if (videoRef.current) {
                    videoRef.current.srcObject = streamRef.current
                }
                setIsVideoOff(false)
            } catch (err) {
                console.error("Failed to re-acquire camera", err)
                toast({
                    variant: "destructive",
                    title: "Camera Failed",
                    description: "Could not restart the camera hardware.",
                })
            }
        }
    }

    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
            const videoTrack = screenStream.getVideoTracks()[0]

            if (streamRef.current && videoRef.current) {
                const currentVideoTrack = streamRef.current.getVideoTracks()[0]
                if (currentVideoTrack) {
                    streamRef.current.removeTrack(currentVideoTrack)
                    currentVideoTrack.stop()
                }
                streamRef.current.addTrack(videoTrack)
                videoRef.current.srcObject = streamRef.current
                setIsSharingScreen(true)

                videoTrack.onended = () => stopScreenShare()
            }
        } catch (err) {
            console.error("Error sharing screen", err)
        }
    }

    const stopScreenShare = async () => {
        try {
            const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true })
            const cameraVideoTrack = cameraStream.getVideoTracks()[0]

            if (streamRef.current && videoRef.current) {
                const screenTrack = streamRef.current.getVideoTracks()[0]
                if (screenTrack) {
                    streamRef.current.removeTrack(screenTrack)
                    screenTrack.stop()
                }
                streamRef.current.addTrack(cameraVideoTrack)
                videoRef.current.srcObject = streamRef.current
                setIsSharingScreen(false)
            }
        } catch (err) {
            console.error("Error reverting to camera", err)
        }
    }

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    const toggleRecording = () => {
        setIsRecording(!isRecording)
        toast({
            title: !isRecording ? "Recording Started" : "Recording Saved",
            description: !isRecording ? "The session is now being recorded." : "The recording has been uploaded to your library.",
            duration: 3000,
        })
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const newRes = {
                id: `r${Date.now()}`,
                name: file.name,
                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                type: file.name.split('.').pop()?.toUpperCase() || "FILE"
            }
            setResources([...resources, newRes])
            toast({
                title: "File Uploaded",
                description: `${file.name} is now ready for your session.`,
            })
        }
    }

    const removeResource = (id: string) => {
        setResources(resources.filter(r => r.id !== id))
    }

    const handleSendMessage = () => {
        if (!chatInput.trim()) return
        setMessages([...messages, { id: `m${Date.now()}`, user: "You", text: chatInput }])
        setChatInput("")
    }

    const handleSchedule = () => {
        const session = {
            id: `ls${Date.now()}`,
            title: newSession.title,
            time: "Scheduled",
            students: 0,
            active: false
        }
        setSessions([session, ...sessions])
        toast({
            title: "Broadcast Scheduled",
            description: `Successfully scheduled "${newSession.title}" for ${newSession.time}.`,
        })
        setIsSchedulingOpen(false)
        setNewSession({ title: "", course: "", time: "", grade: "" })
    }

    if (isLive) {
        return (
            <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col overflow-hidden animate-in fade-in duration-500">
                {/* Teaching Header */}
                <header className="h-20 bg-black/40 backdrop-blur-md px-8 flex items-center justify-between shrink-0 border-b border-white/10 relative z-20">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Session: Grade 12 Physics</span>
                        </div>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">42 Participating</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={stopMedia} className="h-10 px-6 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all">
                            End Session <X className="w-4 h-4" />
                        </Button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Video / Whiteboard Area */}
                    <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
                        <div className="flex-1 rounded-[48px] bg-slate-800 border border-white/10 relative overflow-hidden group">
                            {/* Real Video Stream */}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className={cn(
                                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
                                    isVideoOff ? "opacity-0" : "opacity-100"
                                )}
                            />

                            {/* Fallback / Video Off State */}
                            {isVideoOff && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center space-y-4">
                                    <div className="w-32 h-32 rounded-full bg-slate-900 flex items-center justify-center border-4 border-slate-700 shadow-2xl">
                                        <VideoOff className="w-12 h-12 text-slate-500" />
                                    </div>
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Camera is Off</p>
                                </div>
                            )}

                            {/* Overlays */}
                            <div className="absolute top-8 left-8 p-4 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center font-black text-white text-xs">AK</div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Abebe Kebede (Teacher)</p>
                                    <p className="text-[9px] font-medium text-slate-400 tracking-widest uppercase">Presenter View</p>
                                </div>
                            </div>

                            {/* Whiteboard Overlay Toggle (UI Mock) */}
                            <div className="absolute bottom-8 right-8 flex gap-3">
                                <button className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                                    <LayoutGrid className="w-5 h-5" />
                                </button>
                                <button className="w-12 h-12 rounded-2xl bg-sky-600 text-white shadow-xl shadow-sky-500/20 flex items-center justify-center hover:scale-110 transition-all">
                                    <PanelRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Controls Bar */}
                        <div className="h-24 px-10 rounded-[40px] bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center gap-6 relative z-10 shrink-0">
                            <button
                                onClick={toggleMute}
                                className={cn(
                                    "w-14 h-14 rounded-2xl transition-all flex items-center justify-center group relative",
                                    isMuted ? "bg-rose-500 text-white" : "bg-white/10 hover:bg-white/20 text-white"
                                )}
                            >
                                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 group-hover:scale-110" />}
                                <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/60 text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Audio</span>
                            </button>
                            <button
                                onClick={toggleVideo}
                                className={cn(
                                    "w-14 h-14 rounded-2xl transition-all flex items-center justify-center group relative",
                                    isVideoOff ? "bg-rose-500 text-white" : "bg-white/10 hover:bg-white/20 text-white"
                                )}
                            >
                                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6 group-hover:scale-110" />}
                                <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/60 text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Video</span>
                            </button>
                            <div className="h-10 w-px bg-white/10" />
                            <button className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center group relative">
                                <Share2 className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => isSharingScreen ? stopScreenShare() : startScreenShare()}
                                className={cn(
                                    "w-14 h-14 rounded-2xl transition-all flex items-center justify-center group relative",
                                    isSharingScreen ? "bg-sky-500 text-white ring-4 ring-sky-500/20 shadow-xl shadow-sky-500/30" : "bg-white/10 hover:bg-white/20 text-white"
                                )}
                            >
                                <MonitorPlay className="w-6 h-6" />
                            </button>
                            <div className="h-10 w-px bg-white/10" />
                            <button
                                onClick={toggleRecording}
                                className={cn(
                                    "w-14 h-14 rounded-2xl transition-all border flex items-center justify-center group relative",
                                    isRecording ? "bg-rose-500 border-rose-500 text-white animate-pulse shadow-xl shadow-rose-500/30" : "bg-rose-500/20 hover:bg-rose-500/30 border-rose-500 text-rose-500"
                                )}
                            >
                                <Disc className="w-6 h-6" />
                                <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-rose-500 text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Rec</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Chat / Students */}
                    <div className="w-96 bg-black/20 backdrop-blur-md border-l border-white/10 flex flex-col overflow-hidden relative z-20">
                        <div className="h-20 shrink-0 flex items-center justify-around px-4 border-b border-white/10">
                            {[
                                { id: 'chat', icon: MessageSquare, label: 'Chat' },
                                { id: 'students', icon: Users, label: 'Class' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeTab === tab.id ? "bg-white/10 text-white border border-white/20 shadow-lg shadow-white/5" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4 mb-1.5 mx-auto" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {activeTab === 'chat' ? (
                                <>
                                    <div className="space-y-4">
                                        {messages.map(m => (
                                            <div key={m.id} className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                                                <p className={cn("text-[9px] font-black uppercase tracking-widest", m.user.includes("You") ? "text-rose-400" : "text-sky-400")}>{m.user}</p>
                                                <p className="text-xs text-slate-300 font-medium leading-relaxed">{m.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-auto pt-6">
                                        <div className="h-14 bg-white/5 border border-white/10 rounded-2xl px-5 flex items-center gap-3">
                                            <input
                                                placeholder="Type a message..."
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                className="bg-transparent border-0 outline-none w-full text-xs text-white"
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                className="p-2 rounded-lg bg-sky-500 text-white shadow-lg"
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <Button variant="ghost" className="w-full mt-2 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white">
                                            Message All Participants
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    {MIGHTY_STUDENTS.map(student => (
                                        <div key={student.id} className="p-4 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-[10px] text-white">
                                                    {student.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-white">{student.name}</p>
                                                    <p className="text-[8px] font-medium text-slate-500 uppercase tracking-widest">{student.status}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {student.handRaised && <Hand className="w-4 h-4 text-rose-500 animate-bounce" />}
                                                <button className="p-1.5 rounded-lg hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                                                    <MoreVertical className="w-4 h-4 text-slate-500" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Standard Dashboard List View */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100 shadow-sm">Global Broadcast</span>
                            <Video className="w-4 h-4 text-rose-400 fill-rose-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Live <span className='text-rose-500'>Teaching</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Broadcast high-quality educational content, host interactive seminars, and engage with your students in real-time nationwide.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setIsSchedulingOpen(true)}
                            className="h-14 px-8 rounded-2xl bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl shadow-sky-500/20 hover:scale-105 transition-transform"
                        >
                            <Plus className="w-4 h-4 text-white" /> Schedule Class
                        </Button>
                        <Button
                            onClick={() => setIsRecordingsOpen(true)}
                            variant="outline"
                            className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-rose-600 hover:bg-rose-50/50 transition-all"
                        >
                            <Disc className="w-4 h-4 text-slate-400 group-hover:text-rose-500" /> Past Recordings
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-6 min-w-[220px]">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
                            <Disc className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Live Now</p>
                            <h2 className="text-2xl font-black text-slate-900">0 Classes</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                {sessions.map(session => (
                    <div key={session.id} className="group p-10 rounded-[48px] bg-white border border-slate-100 hover:border-rose-100 hover:shadow-2xl hover:shadow-rose-500/5 transition-all duration-700 relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 p-8">
                            <span className={cn(
                                "px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border",
                                session.active ? "bg-rose-50 text-rose-500 border-rose-100 animate-pulse" : "bg-slate-50 text-slate-400 border-slate-100"
                            )}>
                                {session.active ? "Ready to Launch" : "Upcoming"}
                            </span>
                        </div>

                        <div className="space-y-6 relative z-10 text-center flex flex-col items-center flex-1">
                            <div className="w-20 h-20 rounded-[32px] bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-110 transition-transform shadow-sm">
                                <Video className="w-10 h-10" />
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center min-h-[100px]">
                                <h3 className="text-xl font-black text-slate-900 leading-[1.3] uppercase italic mb-3 group-hover:text-rose-600 transition-colors line-clamp-2">{session.title}</h3>
                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                        <Clock className="w-3.5 h-3.5" /> {session.time}
                                    </p>
                                    <span className="w-1 h-1 rounded-full bg-slate-200 hidden sm:block" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                        <Users2 className="w-3.5 h-3.5" /> {session.students} Enrolled
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    if (session.active) startCamera()
                                    else setIsResourcesOpen(true)
                                }}
                                className={cn(
                                    "w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl mt-auto",
                                    session.active
                                        ? "bg-rose-500 text-white shadow-rose-500/20 hover:scale-105"
                                        : "bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-100"
                                )}
                            >
                                {session.active ? "Start Live Session" : "Prepare Resources"}
                            </Button>
                        </div>
                    </div>
                ))}
                <button
                    onClick={() => setIsSchedulingOpen(true)}
                    className="h-full min-h-[350px] border-2 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center gap-4 group hover:bg-white hover:border-rose-100 hover:shadow-xl transition-all"
                >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-rose-50 group-hover:text-rose-500 transition-all">
                        <Plus className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-rose-600 transition-all">Schedule Broadcast</p>
                </button>
            </div>

            {/* Schedule Class Modal */}
            <Dialog open={isSchedulingOpen} onOpenChange={setIsSchedulingOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[48px] border-slate-100 p-10">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">Schedule <span className="text-rose-500">Live</span> Class</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Set up a new live broadcast for your students. We'll handle the notifications and entry links.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-8 space-y-6">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Session Title</label>
                            <Input
                                placeholder="e.g. Advanced Quantum Field Theory"
                                value={newSession.title}
                                onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                                className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:ring-rose-500/20"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grade Level</label>
                                <Select onValueChange={(v) => setNewSession({ ...newSession, grade: v })}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:ring-rose-500/20">
                                        <SelectValue placeholder="Grade" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100">
                                        <SelectItem value="9" className="rounded-xl font-bold">Grade 9</SelectItem>
                                        <SelectItem value="10" className="rounded-xl font-bold">Grade 10</SelectItem>
                                        <SelectItem value="11" className="rounded-xl font-bold">Grade 11</SelectItem>
                                        <SelectItem value="12" className="rounded-xl font-bold">Grade 12</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</label>
                                <Input
                                    type="datetime-local"
                                    value={newSession.time}
                                    onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:ring-rose-500/20"
                                />
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Subject/Course</label>
                            <Select onValueChange={(v) => setNewSession({ ...newSession, course: v })}>
                                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:ring-rose-500/20">
                                    <SelectValue placeholder="Select course" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100">
                                    {mockTeacherData.courses.map(course => (
                                        <SelectItem key={course.id} value={course.id} className="rounded-xl font-bold">{course.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleSchedule}
                            disabled={!newSession.title || !newSession.time}
                            className="w-full h-16 rounded-[24px] bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-rose-500/20 transition-all hover:scale-[1.02]"
                        >
                            Broadcast Enrollment <ArrowUpRight className="w-5 h-5 ml-2" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Past Recordings Dialog */}
            <Dialog open={isRecordingsOpen} onOpenChange={(open) => {
                setIsRecordingsOpen(open)
                if (!open) setSelectedRecording(null)
            }}>
                <DialogContent className="sm:max-w-[800px] rounded-[48px] border-slate-100 p-0 overflow-hidden">
                    <div className="p-10 bg-slate-50 border-b border-slate-100">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">Session <span className="text-sky-600">Archive</span></DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium">Manage and review your previously recorded live teaching sessions.</DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="flex bg-white h-[450px]">
                        {/* Recording List */}
                        <div className={cn(
                            "p-8 space-y-4 overflow-y-auto border-r border-slate-100 transition-all",
                            selectedRecording ? "w-1/3" : "w-full"
                        )}>
                            {[1, 2, 3, 4].map(i => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedRecording({ id: i })}
                                    className={cn(
                                        "group flex flex-col gap-3 p-4 rounded-[24px] border transition-all cursor-pointer",
                                        selectedRecording?.id === i ? "bg-sky-50 border-sky-200" : "bg-slate-50 border-slate-50 hover:border-sky-100 hover:bg-white"
                                    )}
                                >
                                    <div className="w-full aspect-video rounded-xl bg-slate-200 flex items-center justify-center relative overflow-hidden shrink-0">
                                        <div className="absolute inset-0 bg-sky-600/10" />
                                        <PlayCircle className="w-6 h-6 text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[8px] font-black text-white">45:20</span>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-xs text-slate-900 uppercase italic truncate">Lecture on Quantum Physics {i}</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">April {10 - i}, 2024</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Player Area */}
                        {selectedRecording && (
                            <div className="flex-1 p-8 bg-slate-900 flex flex-col items-center justify-center text-center space-y-4 relative animate-in slide-in-from-right duration-500">
                                <button
                                    onClick={() => setSelectedRecording(null)}
                                    className="absolute top-4 right-4 text-white/40 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="w-full aspect-video rounded-[32px] bg-black ring-1 ring-white/10 flex flex-col items-center justify-center gap-4 group">
                                    <div className="w-20 h-20 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform cursor-pointer shadow-2xl">
                                        <PlayCircle className="w-8 h-8 fill-current ml-1" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Watch Playback</p>
                                </div>
                                <div className="space-y-1">
                                    <h5 className="text-white font-black uppercase italic tracking-wider">Quantum Physics Lecture {selectedRecording.id}</h5>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">1,240 Total views • 85% Engagement</p>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Prepare Resources Dialog */}
            <Dialog open={isResourcesOpen} onOpenChange={setIsResourcesOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-[48px] border-slate-100 p-10">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">Prepare <span className="text-sky-600">Resources</span></DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">Upload textbooks, slides, or problem sets for this session.</DialogDescription>
                    </DialogHeader>
                    <div className="py-8 space-y-8">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-100 rounded-[32px] p-10 flex flex-col items-center justify-center gap-4 group hover:bg-sky-50/30 hover:border-sky-200 transition-all cursor-pointer"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-sky-100 group-hover:text-sky-600 transition-all">
                                <Plus className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-sky-600 transition-all">Click to Select File</p>
                                <p className="text-[8px] font-bold text-slate-300 uppercase mt-1">PDF, PPTX, or MP4 (Max 100MB)</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-black">Attached Materials ({resources.length})</label>
                            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                                {resources.map(res => (
                                    <div key={res.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:bg-white hover:shadow-lg transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-sky-500 shadow-sm">
                                            <Disc className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-900 truncate">{res.name}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{res.size} • {res.type} Document</p>
                                        </div>
                                        <Button
                                            onClick={() => removeResource(res.id)}
                                            variant="ghost"
                                            className="h-8 w-8 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsResourcesOpen(false)} className="w-full h-16 rounded-[24px] bg-sky-600 hover:bg-sky-700 text-white font-black uppercase tracking-widest shadow-2xl shadow-sky-500/20 transition-all">
                            Save Preparation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
