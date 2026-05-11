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
import { tutorProfile as mockTeacherData } from "@/lib/mock-data"
import { liveApi, courseApi } from "@/lib/api"
import { useStream } from "@/components/providers/StreamProvider"
import { Call, CallingState } from "@stream-io/video-react-sdk"
import { LiveClassroom } from "@/components/dashboard/stream/LiveClassroom"
import { getCurrentUser } from "@/lib/auth-utils"
import { getCallId } from "@/lib/utils"

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
    const [sessions, setSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
    const [activeCall, setActiveCall] = useState<Call | null>(null)
    const [isEnding, setIsEnding] = useState(false)
    
    const { videoClient } = useStream()
    const currentUser = getCurrentUser()

    const fetchSessions = async () => {
        try {
            setLoading(true)
            const res = await liveApi.getActive()
            setSessions(res.data || [])
        } catch (error) {
            console.error("Failed to fetch live sessions", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSessions()
    }, [])

    // Media Refs & States
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [isSharingScreen, setIsSharingScreen] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const recordedChunks = useRef<Blob[]>([])
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
    const [recordings, setRecordings] = useState<any[]>([])
    const [loadingRecordings, setLoadingRecordings] = useState(false)

    const fetchRecordings = async () => {
        try {
            setLoadingRecordings(true)
            const res = await liveApi.getRecordings()
            setRecordings(res.data || [])
        } catch (error) {
            console.error("Failed to fetch recordings", error)
        } finally {
            setLoadingRecordings(false)
        }
    }

    useEffect(() => {
        if (isRecordingsOpen) fetchRecordings()
    }, [isRecordingsOpen])

    const [newSession, setNewSession] = useState({
        title: "",
        course: "",
        time: "",
        grade: ""
    })

    // Media Logic - Now integrated with Stream SDK
    const startCamera = async (sessionId: string) => {
        if (!videoClient || !sessionId) return
        
        try {
            const callId = getCallId('class', sessionId)
            const call = videoClient.call('default', callId)
            
            await call.getOrCreate({
                data: {
                    custom: {
                        type: 'academic-broadcast',
                        dbSessionId: sessionId
                    }
                }
            })

            // Signal to students
            const { getSocket } = await import("@/lib/socket")
            const socket = getSocket(currentUser?._id || currentUser?.id)
            if (socket) {
                // We'd need to find the session details to get the grade, 
                // but for now we'll broadcast a general live start
                socket.emit("class-live-started", {
                    callId,
                    courseName: "Special Live Session",
                    tutorName: currentUser?.name
                })
            }
            
            setActiveCall(call)
            setActiveSessionId(sessionId)
            setIsLive(true)
            toast({ title: "Live Session Started", description: "Students can now join your broadcast." })
        } catch (err: any) {
            console.error("Stream initialization failed", err)
            toast({
                variant: "destructive",
                title: "Broadcast Failed",
                description: err.message || "Could not initialize video server.",
            })
        }
    }

    const stopMedia = async () => {
        if (!activeCall) {
            setIsLive(false)
            return
        }
        
        setIsEnding(true)
        try {
            if (activeSessionId) {
                await liveApi.end(activeSessionId)
            }

            const s = activeCall.state.callingState
            if (s !== CallingState.LEFT && s !== CallingState.UNKNOWN) {
                await activeCall.leave()
            }
            
            setActiveCall(null)
            setIsLive(false)
            setActiveSessionId(null)
            fetchSessions()
            toast({ title: "Session Ended", description: "The live session has been closed successfully." })
        } catch (error: any) {
            console.error("Failed to end session", error)
            toast({ title: "End Session Error", description: error.message, variant: "destructive" })
        } finally {
            setIsEnding(false)
        }
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
        if (!isRecording) {
            if (!streamRef.current) {
                toast({ title: "No stream", description: "Please start the session before recording.", variant: "destructive" })
                return
            }
            try {
                const recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm" })
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) recordedChunks.current.push(e.data)
                }
                recorder.onstop = () => {
                    const blob = new Blob(recordedChunks.current, { type: "video/webm" })
                    recordedChunks.current = []
                    
                    // Trigger download
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.style.display = "none"
                    a.href = url
                    a.download = `live-session-${Date.now()}.webm`
                    document.body.appendChild(a)
                    a.click()
                    setTimeout(() => {
                        document.body.removeChild(a)
                        window.URL.revokeObjectURL(url)
                    }, 100)
                    
                    toast({
                        title: "Recording Saved",
                        description: "Your session recording has been downloaded.",
                    })
                }
                recorder.start()
                setMediaRecorder(recorder)
                setIsRecording(true)
                toast({
                    title: "Recording Started",
                    description: "The session is now being recorded.",
                })
            } catch (error: any) {
                toast({ title: "Recording Error", description: error.message, variant: "destructive" })
            }
        } else {
            if (mediaRecorder) {
                mediaRecorder.stop()
                setMediaRecorder(null)
            }
            setIsRecording(false)
        }
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

    const handleSchedule = async () => {
        try {
            if (!newSession.title || !newSession.course || !newSession.time) {
                toast({ title: "Missing Information", description: "Please fill in all fields.", variant: "destructive" })
                return
            }

            const sessionData = {
                title: newSession.title,
                subject: newSession.course,
                startTime: new Date(newSession.time).toISOString(),
                grade: newSession.grade
            }

            await liveApi.create(sessionData)
            toast({
                title: "Broadcast Scheduled",
                description: `Successfully scheduled "${newSession.title}" for students.`,
            })
            setIsSchedulingOpen(false)
            setNewSession({ title: "", course: "", time: "", grade: "" })
            fetchSessions()
        } catch (error: any) {
            toast({ title: "Scheduling Failed", description: error.message, variant: "destructive" })
        }
    }

    if (isLive && activeCall) {
        return (
            <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col overflow-hidden">
                <LiveClassroom 
                    call={activeCall} 
                    squadName="Global Academic Broadcast" 
                    dbSessionId={activeSessionId || undefined}
                    onLeave={stopMedia} 
                />
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
                {sessions.map((session, idx) => (
                    <div key={session._id || session.id || `session-${idx}`} className="group p-10 rounded-[48px] bg-white border border-slate-100 hover:border-rose-100 hover:shadow-2xl hover:shadow-rose-500/5 transition-all duration-700 relative overflow-hidden flex flex-col">
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
                                <h3 className="text-xl font-black text-slate-900 leading-[1.3] uppercase italic mb-1 group-hover:text-rose-600 transition-colors line-clamp-2">{session.title}</h3>
                                <div className="mb-4">
                                    <span className="px-2 py-1 rounded-lg bg-sky-50 text-sky-600 text-[9px] font-black uppercase tracking-widest border border-sky-100">
                                        {session.subject?.title || "Special Session"}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                        <Clock className="w-3.5 h-3.5" /> {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <span className="w-1 h-1 rounded-full bg-slate-200 hidden sm:block" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                        <Users2 className="w-3.5 h-3.5" /> {session.participants?.length || 0} Enrolled
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    if (session.active || session.isActive) startCamera(session._id)
                                    else setIsResourcesOpen(true)
                                }}
                                className={cn(
                                    "w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl mt-auto",
                                    (session.active || session.isActive)
                                        ? "bg-rose-500 text-white shadow-rose-500/20 hover:scale-105"
                                        : "bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-100"
                                )}
                            >
                                {(session.active || session.isActive) ? "Start Live Session" : "Prepare Resources"}
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
                            {loadingRecordings ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Archive...</p>
                                </div>
                            ) : recordings.length === 0 ? (
                                <div className="text-center py-20">
                                    <Disc className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No recordings found</p>
                                </div>
                            ) : recordings.map(rec => (
                                <div
                                    key={rec._id}
                                    onClick={() => setSelectedRecording(rec)}
                                    className={cn(
                                        "group flex flex-col gap-3 p-4 rounded-[24px] border transition-all cursor-pointer",
                                        selectedRecording?._id === rec._id ? "bg-sky-50 border-sky-200" : "bg-slate-50 border-slate-50 hover:border-sky-100 hover:bg-white"
                                    )}
                                >
                                    <div className="w-full aspect-video rounded-xl bg-slate-900 flex items-center justify-center relative overflow-hidden shrink-0">
                                        <div className="absolute inset-0 bg-sky-600/10" />
                                        <PlayCircle className="w-6 h-6 text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[8px] font-black text-white">READY</span>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-xs text-slate-900 uppercase italic truncate">{rec.title}</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            {new Date(rec.endTime).toLocaleDateString()} • {rec.subject?.title || "Live"}
                                        </p>
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
                                <div className="w-full aspect-video rounded-[32px] bg-black ring-1 ring-white/10 flex flex-col items-center justify-center gap-4 group overflow-hidden relative">
                                    {selectedRecording.recordingUrl ? (
                                        <video 
                                            src={selectedRecording.recordingUrl} 
                                            controls 
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform cursor-pointer shadow-2xl">
                                                <PlayCircle className="w-8 h-8 fill-current ml-1" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Processing Playback...</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h5 className="text-white font-black uppercase italic tracking-wider">{selectedRecording.title}</h5>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Recorded on {new Date(selectedRecording.endTime).toLocaleDateString()} • {selectedRecording.subject?.title}</p>
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
