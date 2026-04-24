export function SmartTutorLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Logo: Combination of book (education) + AI spark */}
      <rect x="6" y="8" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 8V24M13 12H20M13 16H20M13 20H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* AI Spark */}
      <circle cx="24" cy="10" r="3" fill="currentColor" />
      <path d="M24 6V14M20 10H28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function SmartTutorBrand() {
  return (
    <div className="flex items-center gap-2">
      <SmartTutorLogo className="w-8 h-8 text-primary" />
      <div className="flex flex-col">
        <span className="text-sm font-bold text-foreground">SmartTutor</span>
        <span className="text-xs font-medium text-muted-foreground">ET</span>
      </div>
    </div>
  )
}
