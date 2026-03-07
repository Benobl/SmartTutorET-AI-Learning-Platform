"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Share2, Award } from "lucide-react"

interface CertificateProps {
  studentName: string
  course: string
  completionDate: string
  grade: string
  certificateId: string
}

export function CertificatePreview({ studentName, course, completionDate, grade, certificateId }: CertificateProps) {
  return (
    <div className="space-y-6">
      {/* Certificate Preview */}
      <div className="aspect-video rounded-lg border-4 border-accent/30 bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10 p-12 flex items-center justify-center overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-accent/40"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-accent/40"></div>

        {/* Certificate Content */}
        <div className="text-center space-y-6 relative z-10">
          <Award className="w-16 h-16 text-accent mx-auto" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-widest">Certificate of Completion</p>
            <h1 className="text-4xl font-bold text-foreground">SmartTutorET</h1>
          </div>

          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">This certificate is proudly presented to</p>
            <p className="text-3xl font-bold text-primary">{studentName}</p>
            <p className="text-lg text-muted-foreground">for successfully completing the course</p>
            <p className="text-2xl font-semibold text-foreground">{course}</p>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-semibold">{completionDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Final Grade</p>
              <p className="font-semibold text-secondary">{grade}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Certificate ID</p>
              <p className="font-mono text-xs">{certificateId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Info */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
          <CardDescription>Your certificate can be shared and verified online</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Student Name</p>
              <p className="font-semibold">{studentName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Course</p>
              <p className="font-semibold">{course}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Completion Date</p>
              <p className="font-semibold">{completionDate}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Final Grade</p>
              <Badge className="w-fit">{grade}</Badge>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <p className="text-sm text-muted-foreground">Certificate ID</p>
            <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-border">
              <p className="font-mono text-sm">{certificateId}</p>
              <Button size="sm" variant="outline" className="bg-transparent">
                Copy
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-border grid md:grid-cols-2 gap-2">
            <Button className="gap-2 font-semibold">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent font-semibold">
              <Share2 className="w-4 h-4" />
              Share Certificate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
