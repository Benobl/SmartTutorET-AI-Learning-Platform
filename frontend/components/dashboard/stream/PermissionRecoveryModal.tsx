"use client"

import React from 'react'
import { VideoOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface PermissionRecoveryModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const PermissionRecoveryModal = ({ open, onOpenChange }: PermissionRecoveryModalProps) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md rounded-[2.5rem] bg-white/95 backdrop-blur-2xl border-none p-10 shadow-[0_50px_100px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
            <div className="flex flex-col items-center text-center gap-6">
                <div className="w-24 h-24 rounded-[2rem] bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
                    <VideoOff className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                    <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">Camera & Mic <span className="text-rose-500">Blocked</span></h2>
                    <p className="text-sm text-slate-500 font-medium px-4 leading-relaxed">
                        Your browser is preventing us from accessing your media because permissions were denied earlier.
                    </p>
                </div>
                <div className="w-full bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col items-start gap-4">
                    <div className="flex gap-4 items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">1</div>
                        <p className="text-xs font-bold text-slate-700 text-left">Click the <span className="text-sky-600 font-black">Lock (🔒)</span> or <span className="text-rose-500 font-black">Camera</span> icon in your address bar.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">2</div>
                        <p className="text-xs font-bold text-slate-700 text-left">Switch <span className="font-black text-slate-900">Camera</span> and <span className="font-black text-slate-900">Microphone</span> to "Allow".</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">3</div>
                        <p className="text-xs font-bold text-slate-700 text-left">Reload this laboratory to apply changes.</p>
                    </div>
                </div>
                <Button
                    onClick={async () => {
                        try {
                            if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
                                await navigator.mediaDevices.enumerateDevices()
                            }
                            window.location.reload()
                        } catch (e) {
                            window.location.reload()
                        }
                    }}
                    className="w-full h-14 rounded-[1.5rem] bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95"
                >
                    Sync & Refresh
                </Button>
                <button
                    onClick={() => window.location.reload()}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                    Or Restart Laboratory
                </button>
            </div>
        </DialogContent>
    </Dialog>
)
