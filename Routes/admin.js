const mongoose = require('mongoose');
const Router = require('express').Router;
const Admin = require('../Models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/user');
const AdminAuth = require('../Middleware/adminauth'); 
const Post = require('../Models/post');
const Secret = "secret";
const adminRouter = Router();
adminRouter.post('/register', async (req, res) => {
    try 
    {
        const name = req.body.name;
        const email = req.body.email;
        const password = await bcrypt.hash(req.body.password, 10);//hasing the pass
        const admin = new Admin({ name, email, password });
        await admin.save();
        res.json(admin);
    } catch (err) {
        console.log('Error in registration');
        res.json(err);
    }
});

adminRouter.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try 
    {
        const admin = await Admin.findOne({ name });

        if (!admin) 
        {
            return res.status(400).json({ error: 'Admin not found' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) 
        {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: admin._id, name: admin.name }, Secret);//jwt token generation for login requist by the admin

        admin.token = token;
        await admin.save();

        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ error: 'Invalid credentials' });
    }
});
adminRouter.get('/view-users', AdminAuth, async (req, res) => {
    try 
    {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) 
    {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
adminRouter.put('/block-user/:userId', AdminAuth, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) 
        {
            return res.status(404).json({ error: 'User not found' });
        }
        user.isBlocked = true;//blocking user
        await user.save();

        res.json({ message: 'User blocked successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
adminRouter.get('/list-blog-posts', AdminAuth, async (req, res) => {
    try 
    {
       
        const blogPosts = await Post.find({}, 'title author creationDate ratings');
        
        res.json(blogPosts);
    } catch (error) 
    {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
adminRouter.get('/view-blog-post/:postId', AdminAuth, async (req, res) => {
    try {
        const postId = req.params.postId;
        const blogPost = await Post.findById(postId);

        if (!blogPost) 
        {
            return res.status(404).json({ error: 'Blog Post not found' });
        }

        res.json(blogPost);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
adminRouter.put('/disable-blog/:postId', AdminAuth, async (req, res) => {
    try {
        const postId = req.params.postId;
        const blogPost = await Post.findById(postId);

        if (!blogPost) 
        {
            return res.status(404).json({ error: 'Blog Post not found' });
        }
        blogPost.isDisabled = true; 
        await blogPost.save();

        res.json({ message: 'Blog Post disabled successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = adminRouter;
