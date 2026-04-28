"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { StreamChat } from "stream-chat"
import {
    StreamVideoClient,
    StreamVideo,
    User as StreamVideoUser,
} from "@stream-io/video-react-sdk"
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

    // Watch for session changes
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

        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY

        if (!apiKey) {
            console.warn("[StreamProvider] NEXT_PUBLIC_STREAM_API_KEY is not configured.")
            setInitError("Stream API key not configured. Live video is unavailable.")
            return
        }

        const initStream = async () => {
            console.log("[StreamProvider] Initializing Stream for:", userId)
            setInitError(null)
            try {
                // 1. Get Token
                const tokenRes = await authApi.getStreamToken()
                const token = tokenRes?.token
                if (!token) throw new Error("Failed to retrieve stream token from server")

                // 2. Chat Client Singleton
                const chat = StreamChat.getInstance(apiKey)

                // Disconnect on identity change
                if (chat.userID && chat.userID !== userId) {
                    console.log(`[StreamProvider] Purging session for ${chat.userID}`)
                    await chat.disconnectUser()
                }

                if (!chat.userID) {
                    await chat.connectUser(
                        { id: userId, name: user.fullName || "User", image: user.profilePic || "" },
                        token
                    )
                }
                setChatClient(chat)

                // 3. Video Client
                if (videoClient) {
                    await videoClient.disconnectUser()
                }
                const videoUser: StreamVideoUser = {
                    id: userId,
                    name: user.fullName || "User",
                    image: user.profilePic || ""
                }

                const vClient = new StreamVideoClient({ apiKey, user: videoUser, token })
                setVideoClient(vClient)
                setIsReady(true)
                console.log("[StreamProvider] Stream Ready")
            } catch (error: any) {
                const msg = error?.message || "Failed to initialize live stream"
                console.error("[StreamProvider] Init Failed:", msg)
                setInitError(msg)
                setIsReady(false)
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
