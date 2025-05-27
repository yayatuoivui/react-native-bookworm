import jwt from 'jsonwebtoken';
import User from '../models/Users.js';

// const response = await fetch('https://api.dicebear.com/9.x/adventurer/svg?seed=Nolan', {
//     method: 'POST',
//     body: JSON.stringify({
//         title,
//         caption,
//     }),
//     headers: { Authorization: `Bearer ${token}` },
//});

const protectRoute = async (req, res, next) => {

    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "No authentication token, access denied" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by ID
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Token is invalid" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        res.status(500).json({ message: "Token is invalid" });
    }
};

export default protectRoute;