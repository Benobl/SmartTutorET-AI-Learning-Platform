"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, DollarSign, Milestone as MobilePhone, Building2 } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  tutorName?: string
  sessionCount?: number
  pricePerSession?: number
}

export function PaymentModal({
  isOpen,
  onClose,
  tutorName = "Sarah Johnson",
  sessionCount = 5,
  pricePerSession = 200,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "bank" | "card">("momo")
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const totalAmount = sessionCount * pricePerSession

  const handlePayment = async () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      alert("Payment successful! Your tutoring sessions are confirmed.")
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Secure Payment</CardTitle>
            <CardDescription>Book sessions with {tutorName}</CardDescription>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{sessionCount} sessions</span>
              <span className="font-medium">ETB {(sessionCount * pricePerSession).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform fee</span>
              <span className="font-medium">ETB {Math.round(totalAmount * 0.05).toLocaleString()}</span>
            </div>
            <div className="border-t border-primary/20 pt-3 flex justify-between font-semibold">
              <span>Total Amount</span>
              <span className="text-primary text-lg">ETB {Math.round(totalAmount * 1.05).toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Payment Method</Label>

            {[
              {
                id: "momo",
                name: "Mobile Money",
                icon: MobilePhone,
                description: "Telebirr, M-Pesa, or other mobile wallets",
              },
              {
                id: "bank",
                name: "Bank Transfer",
                icon: Building2,
                description: "Direct bank transfer (1-2 business days)",
              },
              {
                id: "card",
                name: "Debit/Credit Card",
                icon: DollarSign,
                description: "Visa, Mastercard, or local cards",
              },
            ].map((method: any) => {
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{method.name}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Form Fields */}
          {paymentMethod === "momo" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+251 9xx xxx xxx" type="tel" />
              </div>
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardname">Cardholder Name</Label>
                <Input id="cardname" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardnumber">Card Number</Label>
                <Input id="cardnumber" placeholder="4242 4242 4242 4242" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" />
                </div>
              </div>
            </div>
          )}

          {/* Terms */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="mt-1" />
            <span className="text-xs text-muted-foreground">
              I agree to the{" "}
              <a href="#" className="text-primary hover:underline">
                terms and conditions
              </a>
              . Payment is secure and encrypted.
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handlePayment} disabled={isProcessing}>
              {isProcessing ? "Processing..." : `Pay ETB ${Math.round(totalAmount * 1.05).toLocaleString()}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
