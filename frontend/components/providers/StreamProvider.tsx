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

    useEffect(() => {
        const user = getCurrentUser()
        if (!user) return

        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!

        const initStream = async () => {
            try {
                // 1. Get Token from backend
                const { token } = await authApi.getStreamToken()

                // 2. Initialize Chat Client
                const chat = StreamChat.getInstance(apiKey)
                await chat.connectUser(
                    {
                        id: user._id,
                        name: user.fullName,
                        image: user.profilePic || "",
                    },
                    token
                )
                setChatClient(chat)

                // 3. Initialize Video Client
                const videoUser: StreamVideoUser = {
                    id: user._id,
                    name: user.fullName,
                    image: user.profilePic || "",
                }
                const video = new StreamVideoClient({ apiKey, user: videoUser, token })
                setVideoClient(video)

                setIsReady(true)
            } catch (error) {
                console.error("Error initializing Stream:", error)
            }
        }

        initStream()

        return () => {
            if (chatClient) chatClient.disconnectUser()
            if (videoClient) videoClient.disconnectUser()
        }
    }, [])

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
