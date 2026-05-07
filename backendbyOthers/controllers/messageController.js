const Message = require('../models/Message');
const Group = require('../models/Group');

const sendMessage = async (req, res) => {
  try {
    const { groupId, content, fileUrl, fileName, fileType } = req.body;

    // Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    // Verify user is a member of the group or the tutor
    const isMember = group.students.some(s => s.toString() === req.user._id.toString());
    const isTutor = group.tutor.toString() === req.user._id.toString();
    
    if (!isMember && !isTutor) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not a member of this group' 
      });
    }

    const message = new Message({
      group: groupId,
      sender: req.user._id,
      content,
      fileUrl,
      fileName,
      fileType
    });

    await message.save();
    await message.populate('sender', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    // Verify user is a member of the group or the tutor
    const isMember = group.students.some(s => s.toString() === req.user._id.toString());
    const isTutor = group.tutor.toString() === req.user._id.toString();
    
    if (!isMember && !isTutor) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not a member of this group' 
      });
    }

    const messages = await Message.find({ group: groupId })
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json({ 
      success: true, 
      count: messages.length, 
      data: messages 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendMessage,
  getGroupMessages
};
