import jwt from "jsonwebtoken";
import User from "../modules/users/user.model.js";
export const protectRoute = async (req, res, next) => {
    try {
        let token = req.cookies?.jwt;
        if (!token && req.headers.authorization) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized -Invalid token" })
        }
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Unauthorized User not found" })
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware:", error.name, error.message);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized - Token expired" });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }
        next(error);
    }
}
