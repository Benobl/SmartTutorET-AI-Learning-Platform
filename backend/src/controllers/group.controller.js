import StudyGroup from "../models/StudyGroup.js";
import User from "../models/User.js";

export const createGroup = async (req, res) => {
    try {
        const { name, description, topic, avatar } = req.body;
        const newGroup = new StudyGroup({
            name,
            description,
            topic,
            avatar,
            creator: req.user._id,
            members: [req.user._id],
        });

        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (error) {
        console.error("Error in createGroup:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAllGroups = async (req, res) => {
    try {
        const groups = await StudyGroup.find({ isActive: true }).populate("creator", "fullName profilePic");
        res.status(200).json(groups);
    } catch (error) {
        console.error("Error in getAllGroups:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMyGroups = async (req, res) => {
    try {
        const groups = await StudyGroup.find({ members: req.user._id }).populate("creator", "fullName profilePic");
        res.status(200).json(groups);
    } catch (error) {
        console.error("Error in getMyGroups:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await StudyGroup.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.members.includes(req.user._id)) {
            return res.status(400).json({ message: "Already a member of this group" });
        }

        group.members.push(req.user._id);
        await group.save();

        res.status(200).json({ message: "Joined group successfully", group });
    } catch (error) {
        console.error("Error in joinGroup:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await StudyGroup.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        group.members = group.members.filter((id) => id.toString() !== req.user._id.toString());
        await group.save();

        res.status(200).json({ message: "Left group successfully" });
    } catch (error) {
        console.error("Error in leaveGroup:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
