const mongoose = require('mongoose');

const whiteboardSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  title: { type: String, default: 'Whiteboard' },
  canvasData: { type: String, default: '' }, // JSON string of strokes
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  allowStudentDraw: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WhiteboardSession', whiteboardSchema);
