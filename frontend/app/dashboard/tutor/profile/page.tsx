"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth-utils"
import { ProfileManager } from "@/components/dashboard/shared/profile-manager"

export default function TutorProfile() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        setUser(getCurrentUser())
    }, [])

    if (!user) return null

    return (
        <div className="py-8">
            <ProfileManager 
                currentUser={user} 
                onUpdate={(updated) => setUser(updated)} 
            />
        </div>
    )
}
