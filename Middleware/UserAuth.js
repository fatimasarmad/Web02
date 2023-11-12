const UserModel = require("../Models/user");
const jwt = require("jsonwebtoken");

const UserAuth = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token)
        {
            throw new Error("Authorization header is missing");
        }
        const decoded = jwt.verify(token.replace("Bearer ", ""), "secret");
        const user = await UserModel.findOne({ _id: decoded.id });

        if (!user)
        {
            throw new Error("User not found");
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ error: "Not authorized to access this resource" });
    }
};

module.exports = UserAuth;
