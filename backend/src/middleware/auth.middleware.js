import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(decoded.userID).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User Not Found !!" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectRoute middleware:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
