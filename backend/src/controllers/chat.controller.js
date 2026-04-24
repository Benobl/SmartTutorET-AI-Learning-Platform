import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(rep,res){
    try {
        const token=generateStreamToken(require.user.id)
        res.status(200).json({token})
    } catch (error) {
console.log("Error in getStreamToken controoler:",error.message)
res.status(500).json({message:"Internal Server Error"})
    }
}
