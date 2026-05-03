"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
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

    // Watch for session changes (Client Side Only)
    useEffect(() => {
        const updateUserId = () => {
            const user = getCurrentUser()
            const currentId = (user?._id || user?.id)?.toString() || null
            if (currentId !== userId) {
                setUserId(currentId)
            }
        }
        updateUserId()
        const interval = setInterval(updateUserId, 2000)
        return () => clearInterval(interval)
    }, [userId])

    const retryInit = useCallback(() => {
        setInitError(null)
        setIsReady(false)
        setRetryTrigger(t => t + 1)
    }, [])

    useEffect(() => {
        if (!userId) {
            setIsReady(false)
            return
        }

        const user = getCurrentUser()
        if (!user) return

        // Detailed debug for environment variables
        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || (typeof window !== 'undefined' ? (window as any).NEXT_PUBLIC_STREAM_API_KEY : null)

        if (!apiKey) {
            console.error("[StreamProvider] CRITICAL: NEXT_PUBLIC_STREAM_API_KEY is missing from environment.")
            console.log("[StreamProvider] Current Environment Keys:", Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')))
            setInitError("Video configuration missing. Please ensure NEXT_PUBLIC_STREAM_API_KEY is set in Vercel.")
            return
        }

        console.log("[StreamProvider] API Key Detected:", apiKey.slice(0, 3) + "...")

        const initStream = async () => {
            console.log("[StreamProvider] Initializing Stream for:", userId)
            setInitError(null)
            try {
                // 1. Get Token from your Render Backend
                const tokenRes = await authApi.getStreamToken()
                const token = tokenRes?.token
                
                if (!token) {
                    console.error("[StreamProvider] Token is null. Check Render Environment Variables for STREAM_API_KEY/SECRET.")
                    throw new Error("Server failed to generate a secure stream token. Please check backend environment variables.")
                }

                // 2. Chat Client Singleton
                // We use a singleton pattern to prevent multiple initializations
                const chat = StreamChat.getInstance(apiKey)

                // Disconnect on identity change to prevent session bleeding
                if (chat.userID && chat.userID !== userId) {
                    await chat.disconnectUser()
                }

                if (!chat.userID) {
                    await chat.connectUser(
                        { id: userId, name: user.fullName || user.name || "User", image: user.profilePic || "" },
                        token
                    )
                }
                setChatClient(chat)

                // 3. Video Client
                // For Video, we create a fresh client to ensure the token and user are perfectly synced
                const videoUser: StreamVideoUser = {
                    id: userId,
                    name: user.fullName || user.name || "User",
                    image: user.profilePic || ""
                }

                const vClient = new StreamVideoClient({ 
                    apiKey, 
                    user: videoUser, 
                    token,
                    // Explicitly set the region to ensure consistency across Vercel/Render
                    options: { timeout: 10000 } 
                })
                
                setVideoClient(vClient)
                setIsReady(true)
                console.log("[StreamProvider] Stream Production Ready")
            } catch (error: any) {
                const msg = error?.message || "Failed to initialize live stream"
                console.error("[StreamProvider] Init Failed:", error)
                setInitError(msg)
                setIsReady(false)
                
                // Use standard toast import
                toast({
                    title: "Live Stream Sync Error",
                    description: msg,
                    variant: "destructive"
                })
            }
        }

        initStream()
    }, [userId, retryTrigger])

    return (
        <StreamContext.Provider value={{ chatClient, videoClient, isReady, initError, retryInit }}>
            {videoClient ? (
                <StreamVideo client={videoClient}>
                    {children}
                </StreamVideo>
            ) : (
                children
            )}
        </StreamContext.Provider>
    )
}
