import express from "express";
import { AuthController } from "./auth.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
    signupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from "./auth.validation.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), AuthController.signup);
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/google-login", AuthController.googleLogin);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);

router.get("/verify-email/:token", AuthController.verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), AuthController.resetPassword);

router.get("/me", protectRoute, AuthController.getMe);
router.get("/stream-token", protectRoute, AuthController.getStreamToken);

export default router;
