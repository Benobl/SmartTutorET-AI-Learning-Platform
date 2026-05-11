"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { StreamChat } from "stream-chat"
import {
    StreamVideoClient,
    StreamVideo,
    User as StreamVideoUser,
} from "@stream-io/video-react-sdk"
import { toast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth-utils"

interface StreamContextType {
    chatClient: StreamChat | null
    videoClient: StreamVideoClient | null
    isReady: boolean
    initError: string | null
    retryInit: () => void
}

const StreamContext = createContext<StreamContextType>({
    chatClient: null,
    videoClient: null,
    isReady: false,
    initError: null,
    retryInit: () => {},
})

export const useStream = () => useContext(StreamContext)

export const StreamProvider = ({ children }: { children: React.ReactNode }) => {
    const [chatClient, setChatClient] = useState<StreamChat | null>(null)
    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [initError, setInitError] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const [retryTrigger, setRetryTrigger] = useState(0)

    const initializedRef = useRef<string | null>(null)

    // Watch for session changes (Client Side Only)
    useEffect(() => {
        const user = getCurrentUser()
        const currentId = (user?._id || user?.id)?.toString() || null
        
        if (currentId !== userId) {
            console.log("[StreamProvider] User identity changed:", currentId)
            setUserId(currentId)
            if (!currentId) {
                setChatClient(null)
                setVideoClient(null)
                setIsReady(false)
                initializedRef.current = null
            }
        }
    }, [userId])

    const retryInit = useCallback(() => {
        console.log("[StreamProvider] Manual Retry Triggered")
        setInitError(null)
        setIsReady(false)
        initializedRef.current = null
        setRetryTrigger(t => t + 1)
    }, [])

    useEffect(() => {
        // Defensive Guard: No User ID
        if (!userId) {
            console.log("[StreamProvider] Awaiting valid user session...")
            return
        }

        // Defensive Guard: Duplicate Initialization for same user
        if (initializedRef.current === userId && videoClient) {
            console.log("[StreamProvider] Already initialized for:", userId)
            return
        }

        const user = getCurrentUser()
        // Defensive Guard: Missing user object
        if (!user || (!user._id && !user.id)) {
            console.warn("[StreamProvider] Critical: User object missing ID")
            return
        }

        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || (typeof window !== 'undefined' ? (window as any).NEXT_PUBLIC_STREAM_API_KEY : null)

        if (!apiKey || apiKey === 'your_stream_api_key') {
            console.error("[StreamProvider] Missing API Key")
            setInitError("Stream configuration error: API Key missing")
            return
        }

        let isMounted = true

        const initStream = async () => {
            console.log("[StreamProvider] Starting secure initialization sequence for:", userId)
            try {
                const tokenRes = await authApi.getStreamToken()
                if (!isMounted) return
                
                const token = tokenRes?.token
                if (!token) throw new Error("Security handshake failed: No token returned from server")

                console.log("[StreamProvider] Handshake successful. Configuring clients...")

                // Chat Client
                const chat = StreamChat.getInstance(apiKey)
                if (chat.userID && chat.userID !== userId) {
                    await chat.disconnectUser()
                }
                if (!chat.userID) {
                    await chat.connectUser(
                        { id: userId, name: user.fullName || user.name || "User", image: user.profilePic || "" },
                        token
                    )
                }
                if (isMounted) setChatClient(chat)

                // Video Client - Defensive check before creation
                const existingUserId = videoClient?.user?.id
                if (!videoClient || existingUserId !== userId) {
                    console.log("[StreamProvider] Initializing new StreamVideoClient")
                    const vClient = new StreamVideoClient({ 
                        apiKey, 
                        user: { id: userId, name: user.fullName || user.name || "User", image: user.profilePic || "" }, 
                        token,
                        options: { timeout: 15000, region: 'us-east' } 
                    })
                    if (isMounted) setVideoClient(vClient)
                }
                
                if (isMounted) {
                    initializedRef.current = userId
                    setIsReady(true)
                    console.log("[StreamProvider] Deployment Ready")
                }
            } catch (error: any) {
                if (!isMounted) return
                console.error("[StreamProvider] Initialization Error:", error)
                setInitError(error.message || "Connection failed")
                setIsReady(false)
                initializedRef.current = null
            }
        }

        initStream()
        return () => { isMounted = false }
    }, [userId, retryTrigger, videoClient])

    // IMPORTANT: We NO LONGER wrap the children in StreamVideo here.
    // Wrapping here causes a full app remount when the client initializes.
    // Instead, we just provide the clients in context.
    // Individual components (like LiveClassroom) will wrap themselves in StreamVideo.
    
    const contextValue = React.useMemo(() => ({
        chatClient,
        videoClient,
        isReady,
        initError,
        retryInit
    }), [chatClient, videoClient, isReady, initError, retryInit])

    return (
        <StreamContext.Provider value={contextValue}>
            <div className="contents">{children}</div>
        </StreamContext.Provider>
    )
}
