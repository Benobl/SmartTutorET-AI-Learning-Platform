import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () { return !this.googleId; }, // Not required for Google OAuth users
      minlength: 6,
    },
    googleId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["student", "tutor", "admin", "manager"],
      default: "student",
    },
    tutorStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    // Student-specific fields
    grade: {
      type: String,
      enum: ["9", "10", "11", "12"],
    },
    // Tutor-specific fields
    phone: String,
    degree: String,
    experience: Number,
    subject: String, // Primary subject
    subjects: [String], // Multiple subjects they can teach
    skills: String, // Skill strengths description
    availability: [String],
    documents: {
      cv: String,
      degree: String,
      certifications: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    bio: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    refreshTokens: [String], // Store valid refresh tokens for rotation
    nativeLanguage: {
      type: String,
      default: "",
    },
    learningLanguage: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
