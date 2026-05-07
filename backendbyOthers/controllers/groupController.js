const Group = require('../models/Group');
const Course = require('../models/Course');
const Notification = require('../models/Notification');

const createGroup = async (req, res) => {
  try {
    const { course: courseId, name, description, maxMembers } = req.body;

    // Verify tutor is assigned to this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    if (course.assignedTutor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this course' 
      });
    }

    const group = new Group({
      course: courseId,
      tutor: req.user._id,
      name,
      description,
      maxMembers
    });

    await group.save();
    await group.populate([
      { path: 'course', select: 'title' },
      { path: 'tutor', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: group
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGroups = async (req, res) => {
  try {
    const { course } = req.query;
    let query = {};

    if (course) query.course = course;

    // Students see groups they're assigned to
    if (req.user.role === 'student') {
      query.students = req.user._id;
    }

    // Tutors see groups they created
    if (req.user.role === 'tutor') {
      query.tutor = req.user._id;
    }

    const groups = await Group.find(query)
      .populate('course', 'title')
      .populate('tutor', 'firstName lastName')
      .populate('students', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: groups.length, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('course', 'title description')
      .populate('tutor', 'firstName lastName email')
      .populate('students', 'firstName lastName email avatar');

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('course tutor students', 'title firstName lastName email');

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Group updated successfully', 
      data: group 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const assignStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;
    
    const group = await Group.findById(req.params.id)
      .populate('course', 'title');

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    // Check max members
    if (group.students.length + studentIds.length > group.maxMembers) {
      return res.status(400).json({ 
        success: false, 
        message: 'Exceeds maximum group members' 
      });
    }

    // Add students (avoid duplicates)
    const newStudents = studentIds.filter(
      id => !group.students.includes(id)
    );
    group.students.push(...newStudents);
    await group.save();

    // Notify students
    for (const studentId of newStudents) {
      await Notification.create({
        recipient: studentId,
        type: 'group-assignment',
        title: 'Group Assignment',
        message: `You have been assigned to group "${group.name}" for ${group.course.title}`,
        relatedId: group._id,
        relatedModel: 'Group'
      });
    }

    await group.populate('students', 'firstName lastName email');

    res.json({ 
      success: true, 
      message: 'Students assigned successfully', 
      data: group 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    group.students = group.students.filter(
      s => s.toString() !== studentId
    );
    await group.save();

    res.json({ 
      success: true, 
      message: 'Student removed from group', 
      data: group 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  assignStudents,
  removeStudent
};
