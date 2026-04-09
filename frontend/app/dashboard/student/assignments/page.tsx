"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, FileText, AlertCircle, ChevronRight, Upload, Download, Paperclip, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { assignments } from "@/lib/student-data"
import { useState, useRef } from "react"

/**
 * Student Assignments page — with download/upload functionality,
 * tabs for upcoming/submitted/graded, and file management.
 */
export default function StudentAssignments() {
    const [uploadedFiles, setUploadedFiles] = useState<Record<number, string[]>>({})
    const [dragOver, setDragOver] = useState<number | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [activeUpload, setActiveUpload] = useState<number | null>(null)

    const handleFileSelect = (assignmentId: number, files: FileList | null) => {
        if (!files) return
        const names = Array.from(files).map((f) => f.name)
        setUploadedFiles((prev) => ({
            ...prev,
            [assignmentId]: [...(prev[assignmentId] || []), ...names],
        }))
        setActiveUpload(null)
    }

    const removeFile = (assignmentId: number, fileName: string) => {
        setUploadedFiles((prev) => ({
            ...prev,
            [assignmentId]: (prev[assignmentId] || []).filter((f) => f !== fileName),
        }))
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Assignments & Grades</h1>
                <p className="text-slate-500 text-sm font-medium">Keep track of your academic performance and upcoming deadlines.</p>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl gap-1 shadow-sm">
                    <TabsTrigger value="upcoming" className="rounded-xl data-[state=active]:bg-sky-500 data-[state=active]:text-white transition-all text-slate-500 px-6 font-bold">
                        Upcoming ({assignments.filter((a) => a.status === "pending").length})
                    </TabsTrigger>
                    <TabsTrigger value="submitted" className="rounded-xl data-[state=active]:bg-sky-500 data-[state=active]:text-white transition-all text-slate-500 px-6 font-bold">
                        Submitted
                    </TabsTrigger>
                    <TabsTrigger value="graded" className="rounded-xl data-[state=active]:bg-sky-500 data-[state=active]:text-white transition-all text-slate-500 px-6 font-bold">
                        Graded
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                    {/* Upcoming assignments */}
                    <TabsContent value="upcoming" className="space-y-4 m-0">
                        {assignments.filter((a) => a.status === "pending").map((asgn) => (
                            <div key={asgn.id} className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-sky-300 transition-all group shadow-sm hover:shadow-md">
                                <div className="flex items-start gap-4 md:gap-6">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm",
                                        asgn.priority === "high" ? "bg-red-50 text-red-500 border-red-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                    )}>
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                            <h4 className="font-bold text-lg text-slate-900 group-hover:text-sky-600 transition-colors">{asgn.title}</h4>
                                            {asgn.priority === "high" && (
                                                <Badge className="bg-red-50 text-red-500 border-red-100 text-[10px] font-bold px-2.5 py-0.5 rounded-lg shadow-sm">Urgent</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mb-4 text-[11px] font-bold uppercase tracking-wider">
                                            <span className="text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">{asgn.course}</span>
                                            <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                Due {asgn.due}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">{asgn.description}</p>

                                        {/* Download attachments */}
                                        {asgn.attachments.length > 0 && (
                                            <div className="mb-6">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Course Resources</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {asgn.attachments.map((file) => (
                                                        <button
                                                            key={file}
                                                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold hover:bg-white hover:border-sky-200 hover:text-sky-600 transition-all shadow-sm"
                                                        >
                                                            <Download className="w-4 h-4 text-sky-500" />
                                                            {file}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload zone */}
                                        <div
                                            className={cn(
                                                "border-2 border-dashed rounded-3xl p-6 transition-all relative overflow-hidden",
                                                dragOver === asgn.id
                                                    ? "border-sky-500 bg-sky-50/50 shadow-inner"
                                                    : "border-slate-200 bg-slate-50/10 hover:border-slate-300 hover:bg-slate-50/30"
                                            )}
                                            onDragOver={(e) => { e.preventDefault(); setDragOver(asgn.id) }}
                                            onDragLeave={() => setDragOver(null)}
                                            onDrop={(e) => {
                                                e.preventDefault()
                                                setDragOver(null)
                                                handleFileSelect(asgn.id, e.dataTransfer.files)
                                            }}
                                        >
                                            {/* Uploaded files list */}
                                            {(uploadedFiles[asgn.id]?.length ?? 0) > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                                                    {uploadedFiles[asgn.id]?.map((f) => (
                                                        <div key={f} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-emerald-100 text-emerald-600 text-xs font-bold shadow-sm group/file">
                                                            <Paperclip className="w-3.5 h-3.5" />
                                                            {f}
                                                            <button
                                                                onClick={() => removeFile(asgn.id, f)}
                                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex flex-col items-center justify-center gap-3 py-2 relative z-10">
                                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-sky-500 transition-colors">
                                                    <Upload className="w-5 h-5" />
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-xs text-slate-400 font-bold block mb-1">Drag & drop your files here</span>
                                                    <button
                                                        onClick={() => {
                                                            setActiveUpload(asgn.id)
                                                            fileInputRef.current?.click()
                                                        }}
                                                        className="text-xs text-sky-600 font-bold hover:text-sky-700 transition-colors bg-white px-3 py-1 rounded-lg border border-sky-100 shadow-sm"
                                                    >
                                                        Browse computer
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 blur-3xl rounded-full" />
                                        </div>
                                    </div>
                                    <button className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2 shrink-0 self-start group-hover:scale-105 active:scale-95">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Submit Work
                                    </button>
                                </div>
                            </div>
                        ))}
                    </TabsContent>

                    {/* Submitted */}
                    <TabsContent value="submitted" className="space-y-4 m-0">
                        {assignments.filter((a) => a.status === "submitted").map((asgn) => (
                            <div key={asgn.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex items-center gap-6 group">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-lg text-slate-900 mb-1">{asgn.title}</h4>
                                    <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
                                        <span className="text-indigo-600">{asgn.course}</span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-slate-400">Submitted {asgn.submittedDate}</span>
                                    </div>
                                </div>
                                <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 text-xs font-bold px-3 py-1 rounded-xl shadow-sm">Awaiting Review</Badge>
                            </div>
                        ))}
                        {assignments.filter((a) => a.status === "submitted").length === 0 && (
                            <div className="p-16 rounded-[40px] bg-white border border-slate-200 text-center shadow-sm">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <FileText className="w-8 h-8 text-slate-200" />
                                </div>
                                <p className="text-slate-400 font-bold">No submitted assignments pending review.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Graded */}
                    <TabsContent value="graded" className="space-y-4 m-0">
                        {assignments.filter((a) => a.status === "graded").map((asgn) => (
                            <div key={asgn.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 transition-all flex items-center gap-6 group">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shadow-sm group-hover:scale-110 transition-transform">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-lg text-slate-900 mb-1 truncate group-hover:text-emerald-600 transition-colors">{asgn.title}</h4>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{asgn.course} • Graded on Mar 05</p>
                                    {asgn.feedback && (
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <p className="text-xs text-slate-500 font-bold italic leading-relaxed">&ldquo;{asgn.feedback}&rdquo;</p>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right mx-4 shrink-0 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <p className="text-2xl font-black text-emerald-600 tracking-tighter">{asgn.grade}</p>
                                    <p className="text-[9px] text-emerald-500/60 uppercase tracking-widest font-black text-center">Final Score</p>
                                </div>
                                <button className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-sky-600 hover:bg-sky-50 hover:border hover:border-sky-100 transition-all shadow-sm shrink-0">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </TabsContent>
                </div>
            </Tabs>

            {/* Hidden file input for upload */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={(e) => {
                    if (activeUpload) {
                        handleFileSelect(activeUpload, e.target.files)
                    }
                }}
            />
        </div>
    )
}
