import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    platformName: {
        type: String,
        default: "SmartTutorET"
    },
    supportEmail: {
        type: String,
        default: "support@smarttutoret.com"
    },
    platformFeePercentage: {
        type: Number,
        default: 10
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    registrationLockdown: {
        type: Boolean,
        default: false
    },
    alertProfile: {
        systemVitals: { type: Boolean, default: true },
        fraudDetection: { type: Boolean, default: true },
        newRegistry: { type: Boolean, default: true }
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
