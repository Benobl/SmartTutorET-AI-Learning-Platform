"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
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
}

const StreamContext = createContext<StreamContextType>({
    chatClient: null,
    videoClient: null,
    isReady: false,
})

export const useStream = () => useContext(StreamContext)

export const StreamProvider = ({ children }: { children: React.ReactNode }) => {
    const [chatClient, setChatClient] = useState<StreamChat | null>(null)
    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

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
        const interval = setInterval(updateUserId, 2000) // Polling fallback for logout/login
        return () => clearInterval(interval)
    }, [userId])

    useEffect(() => {
        if (!userId) {
            setIsReady(false)
            return
        }

        const user = getCurrentUser()
        if (!user) return

        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!

        const initStream = async () => {
            console.log("[StreamProvider] Initializing Stream for:", userId);
            try {
                // 1. Get Token
                const { token } = await authApi.getStreamToken()

                // 2. Chat Client Singleton
                const chat = StreamChat.getInstance(apiKey)

                // Aggressive Disconnect on Identity Change
                if (chat.userID && chat.userID !== userId) {
                    console.log(`[StreamProvider] Purging session for ${chat.userID}`);
                    await chat.disconnectUser();
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
                console.log("[StreamProvider] Stream Ready");
            } catch (error) {
                console.error("[StreamProvider] Init Failed:", error)
            }
        }

        initStream()
    }, [userId])

    return (
        <StreamContext.Provider value={{ chatClient, videoClient, isReady }}>
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
