import { StreamChat } from "stream-chat"
import "dotenv/config"

const apikey = process.env.STREAM_API_KEY || process.env.STEAM_API_KEY
const apiSecret = process.env.STREAM_API_SECRET || process.env.STEAM_API_SECRET

let streamClient = null;

if (apikey && apiSecret) {
    streamClient = StreamChat.getInstance(apikey, apiSecret);
    console.log(`[Stream] SUCCESS: Service initialized with key ${apikey.slice(0, 4)}...`);
} else {
    console.error("[Stream] CRITICAL ERROR: API key or Secret missing in Environment Variables!");
    console.log("[Stream] Expected: STREAM_API_KEY and STREAM_API_SECRET");
}

export const upsertStreamUser = async (userData) => {
    if (!streamClient) return userData;
    try {
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.error("Error upserting Stream user:", error)
    }
}
export const generateStreamToken = (userId) => {
    if (!streamClient) return null;
    try {
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.error("Error generating Stream token", error);
    }
}
export const addStreamChannelMember = async (channelId, userId) => {
    if (!streamClient) return;
    try {
        const channel = streamClient.channel("messaging", channelId);
        await channel.addMembers([userId.toString()]);
    } catch (error) {
        console.error("Error adding member to Stream channel:", error);
    }
};
