const express = require('express');
const router = express.Router();
const Post = require('../Models/post');
router.get('/search', async (req, res) => {
    try {
        const keywords = req.query.keywords;
        const author = req.query.author;
        const query = {};
        if (keywords)
        {//check if the keywords have been provided or not
            query.$text = { $search: keywords };
        }

        if (author) //check if the author has been provided or not
        {
            query.author = author;
        }
        const searchResults = await Post.find(query);//find posts that have the above mentioned factors
        res.json(searchResults);
    } catch (error) {
        console.error('Error in search route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
