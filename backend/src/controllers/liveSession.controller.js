import LiveSession from "../models/LiveSession.js";

export const createLiveSession = async (req, res) => {
    try {
        const { title, roomType } = req.body;
        const newSession = new LiveSession({
            title,
            roomType,
            host: req.user._id,
            participants: [req.user._id],
        });
        await newSession.save();
        res.status(201).json(newSession);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const joinLiveSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await LiveSession.findById(sessionId);
        if (!session || !session.isActive) {
            return res.status(404).json({ message: "Live session not found or ended" });
        }

        await LiveSession.findByIdAndUpdate(sessionId, {
            $addToSet: { participants: req.user._id },
        });

        res.status(200).json({ message: "Joined session", session });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const endLiveSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await LiveSession.findById(sessionId);
        if (session.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only host can end session" });
        }

        session.isActive = false;
        session.endTime = Date.now();
        await session.save();

        res.status(200).json({ message: "Session ended" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
