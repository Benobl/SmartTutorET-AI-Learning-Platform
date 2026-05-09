import express from "express";
import { AuthController } from "./auth.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
    signupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from "./auth.validation.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), AuthController.signup);
router.post("/register", validate(signupSchema), AuthController.signup);
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/google-login", AuthController.googleLogin);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);

router.get("/verify-email/:token", AuthController.verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), AuthController.resetPassword);

router.get("/me", verifyToken, AuthController.getMe);
router.get("/stream-token", verifyToken, AuthController.getStreamToken);

// EMERGENCY DEBUG ROUTE - DELETE AFTER FIXING
router.get("/emergency-admin", async (req, res) => {
    try {
        const User = (await import("../users/user.model.js")).default;
        const email = "admin@smarttutor.com";
        await User.deleteOne({ email });
        const user = await User.create({
            name: "System Admin",
            email,
            password: "adminpassword",
            role: "admin",
            isApproved: true,
            isVerified: true
        });
        res.json({ success: true, message: "Admin user created", email, password: "adminpassword" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
