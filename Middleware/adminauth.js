const AdminModel = require("../Models/admin");
const jwt = require("jsonwebtoken");
const AdminAuth = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token)
        {
            throw new Error("Authorization header is missing");
        }
    const decoded = jwt.verify(token.replace("Bearer ", ""), "secret");//jwt verification

    const admin = await AdminModel.findOne({ _id: decoded.id });//admin that has the above mentioned id
    if (!admin) 
        {
            throw new Error("Admin not found");
        }
        req.admin = admin;
        req.token = token;
        next();
    } catch (error)
    {
        console.error('Authentication error:', error.message);
        res.status(401).json({ error: "Not authorized to access this resource" });
    }
};

module.exports = AdminAuth;
