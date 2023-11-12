const Router = require('express').Router;
const Post = require('../Models/post');
const UserAuth = require('../Middleware/UserAuth');
const User = require('../Models/user');
const Follow = require('../Models/follow');
const router = new Router();
router.post('/notify/follow/:followerId', UserAuth, async (req, res) => {
    try {
      const followerId = req.params.followerId;
  
      if (!req.user.notifications.includes(`New Follower: ${followerId}`))
       {
        req.user.notifications.push(`New Follower: ${followerId}`);
        await req.user.save();
       }
  
      res.json({ message: 'Notification sent successfully' });
    } catch (err)
    {
      console.error('Error in sending follow notification:', err);
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  });

  router.post('/notify/comment/:postId', UserAuth, async (req, res) => {
    try {
      const postId = req.params.postId;
  
      if (!req.user.notifications.includes(`New Comment on Post: ${postId}`))
      {
        req.user.notifications.push(`New Comment on Post: ${postId}`);
        await req.user.save();
      }
  
      res.json({ message: 'Notification sent successfully' });
    } catch (err) 
    {
      console.error('Error in sending comment notification:', err);
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  });

router.post('/create', UserAuth, async (req, res) => {
    try {
        const { title, content } = req.body;
        
        const post = new Post({ title, content, owner: req.user._id });
        await post.save();
        res.json(post);
    } catch (err) 
    {
        console.error('Error in creating post:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/rate/:postId', UserAuth, async (req, res) => {
    try {
        const postId = req.params.postId;
        const { rating } = req.body;

        const post = await Post.findById(postId);

        if (!post)
        {
            return res.status(404).json({ error: 'Post not found' });
        }

       
        console.log('Before rating ', post);
        console.log('Before rating ', post.rating);

        if (post.rating > 0) 
        {
            return res.status(400).json({ error: 'User has already rated this post' });
        }

        post.rating = parseFloat(rating); 
       
        
        console.log('After rating', post);
        console.log('After rating', post.rating);

        await post.save();

        res.json(post);
    } catch (err) 
    {
        console.error('Error in rating post:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});


router.post('/comment/:postId', UserAuth, async (req, res) => {
    try {
        const postId = req.params.postId;
        const { text } = req.body;

        const post = await Post.findById(postId);

        if (!post)
        {
            return res.status(404).json({ error: 'Post not found' });
        }
        console.log('Before comment', post);
        console.log('Before comment', post.comments);
        post.comments.push({//comments added to the post here
            user: req.user._id,
            text,
        });

        console.log('After comment', post);
        console.log('After comment', post.comments);

        await post.save();

        res.json(post);
    } catch (err) 
    {
        console.error('Error in posting comment:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});


router.get('/list', async (req, res) => {
    try {
      
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; //pagination , set 10 posts per page
        const titleFilter = req.query.title; // Filter by post title if provided
        const filter = {};
        if (titleFilter) {
            filter.title = { $regex: new RegExp(titleFilter, 'i') }; // Case-insensitive title matching
        }

        // Calculate the skip value for pagination
        const skip = (page - 1) * limit;
        const posts = await Post.find(filter)
            .populate('owner', 'name')
            .skip(skip)
            .limit(limit);
        res.json(posts);//return according to the selected filters
    } catch (err) {
        console.error('Error in getting posts:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});
router.get('/get/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId).populate('owner', 'name');
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (err) 
    {
        console.error('Error in getting post by ID:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/update/:postId', UserAuth, async (req, res) => {
    try {
        const postId = req.params.postId;
        const { title, content } = req.body;
        const post = await Post.findById(postId);//user has to be the pwner of the post to edit it
        if (!post || post.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this post' });
        }
        post.title = title;//updation
        post.content = content;
        await post.save();

        res.json(post);
    } catch (err) {
        console.error('Error in updating post:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
const UserModel = require("../Models/user");
const mongoose = require('mongoose');
router.delete('/delete/:postId', UserAuth, async (req, res) => {
    try {
        const postId = req.params.postId;

        console.log('Entering delete route'); 
        const post = await Post.findById(postId);//to delete a post user must be the owner of it

        console.log('Before post.owner log');
        console.log('post.owner:', post.owner);
        console.log('req.user._id:', req.user._id);
        console.log('After post.owner log');

        if (!post || post.owner.toString() !== req.user._id.toString())
        {
            console.log('Not authorized to delete this post');
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        console.log('Before Post.deleteOne log');
        await Post.deleteOne({ _id: postId });//deletion
        console.log('After Post.deleteOne log');

        console.log('Post deleted successfully');
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Error in deleting post:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});
module.exports = router;
router.get('/feed', UserAuth, async (req, res) => {
    try {
        //display all posts of the user that the logged in user is following
        const posts = await Post.find({ owner: { $in: req.user.following } }).populate('owner', 'name');

        res.json(posts);
    } catch (err) {
        console.error('Error in getting user feed:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});
router.get('/search', async (req, res) => {
    try {
        console.log('Entering search route');

        const keyword = req.query.keywords;
        const author = req.query.author;

        let query = {
            $or: [
                { title: { $regex: new RegExp(keyword, 'i') } },  // Case-insensitive title search
                { content: { $regex: new RegExp(keyword, 'i') } },  // Case-insensitive content search
            ],
        };

        if (author) {
            //instead of the name of the author like in my db auther exists as new , give its id
            const authorObjectId = mongoose.Types.ObjectId(author);
            query.owner = authorObjectId;
        }
        const posts = await Post.find(query);// find posts that are according to the filters and search points mentioned above

        console.log('Search operation completed successfully');
        res.json(posts);
    } catch (error) {
        console.error('Error in search route:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});
module.exports = router;
module.exports = router;
