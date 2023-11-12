const mongoose = require('mongoose');
const Router = require('express').Router;
const User = require('../Models/user');
const bcrypt = require('bcrypt');
const { json } = require('express');
const jwt = require('jsonwebtoken');
const UserAuth = require('../Middleware/UserAuth');
const Follow = require('../Models/follow');
const Post = require('../Models/post');
const router = new Router();
const Secret = "secret";
router.post('/register', async (req, res) => {
    try
    {
        console.log(req.body);
        const name = req.body.name;
        const email = req.body.email;
        const password = await bcrypt.hash(req.body.password, 10);
        const user = new User({ name, email, password });
        await user.save();
        res.json(user);
    }
    catch (err) {
        console.log('Error in registration');
        res.json(err);

    }
});

router.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        const user = await User.findOne({ name });

        if (!user)
        {
            return res.status(400).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch);
        if (!isMatch)
        {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id , name: user.name}, Secret);//jwt token generation
        user.token = token;
        await user.save();
        res.json({ token });


    } catch (error) 
    {
        console.error(error.message);
        res.status(400).json({ error: 'Invalid credentials' });
    }

}); 

router.put('/update-password', UserAuth, async (req, res) => {
    try 
    {
        const { name, password } = req.body;

        const user = await User.findOne({ name });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Update the password
        user.password = await bcrypt.hash(password, 10);
        await user.save();

        res.json('Password updated successfully');
    } catch (err) {
        console.error('Error in updating password:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post ('/logout', UserAuth, async (req, res) => {
    try 
    {
        const user = req.user;
        user.token = '';
        await user.save();

        res.json('Logged out successfully');
    } catch (err) {
        console.error('Error in logging out:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const express = require('express');
router.get('/notifications', UserAuth, (req, res) => {
    try 
    {
        console.log('Entering /user/notifications route');
        if (!req.user || !req.user.notifications) {
            console.log('User or notifications not found:', req.user);
            return res.json({ notifications: [] });
        }

        console.log('Sending notifications as response:', req.user.notifications);

        res.json({ notifications: req.user.notifications });
    } catch (error) {
        console.error('Error in /user/notifications route:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});
router.get('/users', async (req, res) => {
    try 
    {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/block-user/:userId', UserAuth, async (req, res) => {
    try 
    {
        const userIdToBlock = req.params.userId;

        
        await User.findByIdAndUpdate(userIdToBlock, { isActive: false });// block user update status to blocked

        res.json({ message: 'User blocked successfully' });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
module.exports = router;