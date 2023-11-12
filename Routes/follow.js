const express = require('express');
const router = express.Router();
const UserAuth = require('../Middleware/UserAuth');
const Follow = require('../Models/follow');
const User = require('../Models/user');

router.post('/follow/:userId', UserAuth, async (req, res) => {
    try {
        const userIdToFollow = req.params.userId;

        if (userIdToFollow.toString() === req.user._id.toString()) 
        {
            return res.status(400).json({ error: "You can't follow yourself" });
        }

        if (req.user.following.includes(userIdToFollow)) 
        {
            return res.status(400).json({ error: "You are already following this user" });
        }
        req.user.following.push(userIdToFollow);
        await req.user.save();
        const follower = await User.findById(userIdToFollow);
        req.user.notifications.push(`New Follower: ${follower.name}`);//notify the user if a new follower has been added
        await req.user.save();

        res.json({ message: 'User followed successfully' });
    } catch (err) 
    {
        console.error('Error in following user:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

module.exports = router;
