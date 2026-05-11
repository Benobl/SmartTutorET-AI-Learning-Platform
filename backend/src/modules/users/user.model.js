import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
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
      select: false,
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
    isApproved: {
      type: Boolean,
      default: true,
    },
    accountStatus: {
      type: String,
      enum: ["active", "waiting", "suspended", "deactivated"],
      default: "active",
    },
    profile: {
      bio: { type: String, default: "" },
      expertise: { type: [String], default: [] },
      education: { type: String, default: "" },
      avatar: { type: String, default: "" },
    },
    tutorStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    // Student-specific fields
    grade: {
      type: Number,
      enum: [9, 10, 11, 12],
    },
    stream: {
      type: String,
      enum: ["Natural Science", "Social Science", "Common"],
    },
    section: {
      type: String,
      default: "Section A",
    },
    // Additional fields for tutor onboarding/application
    phone: String,
    subjects: [String],
    skills: String,
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
    refreshTokens: [String],
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

userSchema.pre("validate", function (next) {
  // Graceful migration for legacy documents that have fullName instead of name
  if (!this.name && this.get("fullName")) {
    this.name = this.get("fullName");
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  
  // Prevent double hashing
  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$") || this.password.startsWith("$2y$")) {
    console.log(`[AUTH-DEBUG] Skipping hash for already hashed password: ${this.email}`);
    return next();
  }

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
