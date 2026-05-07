const StudySquad = require('../models/StudySquad');
const Notification = require('../models/Notification');

const createSquad = async (req, res) => {
  try {
    const { name, description, subject, course, maxMembers, isPublic, tags, meetingSchedule } = req.body;

    const squad = new StudySquad({
      name,
      description,
      subject,
      course,
      creator: req.user._id,
      maxMembers,
      isPublic,
      tags,
      meetingSchedule,
      members: [{
        user: req.user._id,
        role: 'leader'
      }]
    });

    await squad.save();
    await squad.populate([
      { path: 'creator', select: 'firstName lastName email' },
      { path: 'members.user', select: 'firstName lastName email' },
      { path: 'course', select: 'title' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Study squad created successfully',
      data: squad
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSquads = async (req, res) => {
  try {
    const { subject, course, search } = req.query;
    let query = { isActive: true };

    // Students can see public squads or squads they're members of
    if (req.user.role === 'student') {
      query.$or = [
        { isPublic: true },
        { 'members.user': req.user._id }
      ];
    }

    if (subject) query.subject = subject;
    if (course) query.course = course;
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const squads = await StudySquad.find(query)
      .populate('creator', 'firstName lastName')
      .populate('members.user', 'firstName lastName email')
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: squads.length, data: squads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSquadById = async (req, res) => {
  try {
    const squad = await StudySquad.findById(req.params.id)
      .populate('creator', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email avatar')
      .populate('course', 'title description');

    if (!squad) {
      return res.status(404).json({ 
        success: false, 
        message: 'Study squad not found' 
      });
    }

    res.json({ success: true, data: squad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const joinSquad = async (req, res) => {
  try {
    const squad = await StudySquad.findById(req.params.id);

    if (!squad) {
      return res.status(404).json({ 
        success: false, 
        message: 'Study squad not found' 
      });
    }

    // Check if already a member
    const isMember = squad.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already a member of this squad' 
      });
    }

    // Check max members
    if (squad.members.length >= squad.maxMembers) {
      return res.status(400).json({ 
        success: false, 
        message: 'Squad is full' 
      });
    }

    squad.members.push({
      user: req.user._id,
      role: 'member'
    });

    await squad.save();
    await squad.populate('members.user', 'firstName lastName email');

    // Notify squad leader
    await Notification.create({
      recipient: squad.creator,
      type: 'squad-join',
      title: 'New Squad Member',
      message: `${req.user.firstName} ${req.user.lastName} joined your study squad "${squad.name}"`,
      relatedId: squad._id,
      relatedModel: 'StudySquad'
    });

    res.json({ 
      success: true, 
      message: 'Joined squad successfully', 
      data: squad 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const leaveSquad = async (req, res) => {
  try {
    const squad = await StudySquad.findById(req.params.id);

    if (!squad) {
      return res.status(404).json({ 
        success: false, 
        message: 'Study squad not found' 
      });
    }

    // Check if creator
    if (squad.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Squad creator cannot leave. Delete the squad instead.' 
      });
    }

    squad.members = squad.members.filter(
      m => m.user.toString() !== req.user._id.toString()
    );

    await squad.save();

    res.json({ 
      success: true, 
      message: 'Left squad successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSquad = async (req, res) => {
  try {
    const squad = await StudySquad.findById(req.params.id);

    if (!squad) {
      return res.status(404).json({ 
        success: false, 
        message: 'Study squad not found' 
      });
    }

    // Only creator can update
    if (squad.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only squad creator can update' 
      });
    }

    Object.assign(squad, req.body);
    squad.updatedAt = Date.now();
    await squad.save();

    res.json({ 
      success: true, 
      message: 'Squad updated successfully', 
      data: squad 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSquad = async (req, res) => {
  try {
    const squad = await StudySquad.findById(req.params.id);

    if (!squad) {
      return res.status(404).json({ 
        success: false, 
        message: 'Study squad not found' 
      });
    }

    // Only creator can delete
    if (squad.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only squad creator can delete' 
      });
    }

    squad.isActive = false;
    await squad.save();

    res.json({ success: true, message: 'Squad deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMySquads = async (req, res) => {
  try {
    const squads = await StudySquad.find({
      'members.user': req.user._id,
      isActive: true
    })
      .populate('creator', 'firstName lastName')
      .populate('members.user', 'firstName lastName email')
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: squads.length, data: squads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSquad,
  getSquads,
  getSquadById,
  joinSquad,
  leaveSquad,
  updateSquad,
  deleteSquad,
  getMySquads
};
