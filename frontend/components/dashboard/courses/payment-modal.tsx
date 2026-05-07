"use client"

import { useState, useEffect } from "react"
import {
    X, Check, QrCode, Smartphone, ArrowRight,
    ShieldCheck, CreditCard, Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

import { paymentApi } from "@/lib/api"

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    courseName: string
    price: number
    courseId: string
    onSuccess: (paymentId: string) => void
}

export function PaymentModal({ isOpen, onClose, courseName, price, courseId, onSuccess }: PaymentModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [phoneNumber, setPhoneNumber] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const { toast } = useToast()

    const handleChapaPayment = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsProcessing(true)
        try {
            const res = await paymentApi.initialize({
                amount: price,
                subjectId: courseId,
                method: "chapa"
            })
            
            if (res.data?.checkout_url) {
                toast({ title: "Redirecting to Chapa", description: "Completing secure payment gateway connection..." })
                window.location.href = res.data.checkout_url
            } else {
                throw new Error("Failed to get checkout URL")
            }
        } catch (error: any) {
            toast({ title: "Payment Failed", description: error.message, variant: "destructive" })
        } finally {
            setIsProcessing(false)
        }
    }

    const handleSimulatedPayment = () => {
        setIsProcessing(true)
        // Simulate Chapa verification
        setTimeout(() => {
            setIsProcessing(false)
            setStep(3)
            toast({ title: "Payment Verified!", description: "Thank you for your purchase.", className: "bg-emerald-500 text-white border-none" })
            setTimeout(() => {
                onSuccess("CHAPA-" + Math.random().toString(36).substring(2, 9).toUpperCase())
                onClose()
            }, 2000)
        }, 2500)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none bg-white rounded-[32px] shadow-2xl">
                <div className="relative">
                    {/* Header Background */}
                    <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-sky-600" />

                    <div className="relative px-8 pt-8 pb-10">
                        <DialogHeader className="mb-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <DialogTitle className="text-white text-2xl font-black tracking-tight">Chapa Checkout</DialogTitle>
                                    <DialogDescription className="text-indigo-100/80 font-medium">
                                        Secure payment via <span className="text-amber-300 font-bold">Chapa</span> for {courseName}
                                    </DialogDescription>
                                </div>
                                <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </DialogHeader>

                        {/* Steps Indicator */}
                        <div className="flex justify-between items-center mb-10 px-4">
                            {[1, 2].map((s) => (
                                <div key={s} className="flex flex-col items-center gap-2">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-500",
                                        step >= s
                                            ? "bg-amber-400 border-amber-400 text-slate-900"
                                            : "bg-white/10 border-white/20 text-white/40"
                                    )}>
                                        {step > s ? <Check className="w-4 h-4 stroke-[3]" /> : s}
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest",
                                        step >= s ? "text-white" : "text-white/30"
                                    )}>
                                        {s === 1 ? "Initialize" : "Complete"}
                                    </span>
                                </div>
                            ))}
                            {/* Connector Lines */}
                            <div className="absolute left-[88px] top-[148px] right-[88px] h-[2px] bg-white/10 -z-10">
                                <div
                                    className="h-full bg-amber-400 transition-all duration-500"
                                    style={{ width: step === 1 ? '0%' : '100%' }}
                                />
                            </div>
                        </div>

                        {/* Content Card */}
                        <div className="bg-white rounded-[28px] p-6 shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {step === 1 && (
                                <form onSubmit={handleChapaPayment} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount to Pay</span>
                                            <span className="text-xl font-black text-slate-900">{price} ETB</span>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center gap-2"
                                    >
                                        {isProcessing ? "Initializing..." : <>Pay with Chapa <ArrowRight className="w-4 h-4" /></>}
                                    </Button>
                                    <p className="text-[10px] text-slate-400 text-center font-medium">
                                        You will be redirected to Chapa's secure checkout page to complete your payment.
                                    </p>
                                </form>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 text-center">
                                    <div className="relative mx-auto w-32 h-32 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center overflow-hidden">
                                        <QrCode className="w-20 h-20 text-slate-700 opacity-80" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Scan or Confirm</h4>
                                        <p className="text-xs text-slate-500 font-medium">
                                            A payment request has been sent to <span className="font-bold text-slate-700">{phoneNumber}</span>.
                                            Check your phone and enter your PIN.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleSimulatedPayment}
                                        disabled={isProcessing}
                                        className="w-full h-14 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs uppercase tracking-widest shadow-lg transition-all"
                                    >
                                        {isProcessing ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> Verifying...
                                            </span>
                                        ) : "I have Paid"}
                                    </Button>
                                    <button
                                        onClick={() => setStep(1)}
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                                    >
                                        Change Phone Number
                                    </button>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="py-8 space-y-6 text-center animate-in zoom-in-95 duration-500">
                                    <div className="relative mx-auto w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200">
                                        <Check className="w-10 h-10 text-white stroke-[3]" />
                                        {/* Pulse animation */}
                                        <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-black text-slate-900 tracking-tight">Enrollment Successful!</h4>
                                        <p className="text-xs text-slate-500 font-medium">
                                            Redirecting you to the course dashboard...
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center gap-4 pt-4">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Verified</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                            <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Telebirr</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="mt-8 flex items-center justify-center gap-4">
                            <div className="flex items-center gap-1 text-white/40">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Secure 256-bit SSL</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <div className="flex items-center gap-1 text-white/40">
                                <Info className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Help Center</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
