const express = require('express');
const mongoose = require('mongoose');
const UserRoutes = require('./Routes/user');
const PostRoutes = require('./Routes/post');
const cors = require('cors');

const app = express();
app.use(express.json());

const followRoutes = require('./Routes/follow'); // Import the new follow routes
const adminRoutes = require('./Routes/admin');
app.use('/admin', adminRoutes); // Add admin routes


mongoose.connect('mongodb://127.0.0.1:27017/paper').
    then(() => console.log('Connected to MongoDB')).
    catch(err => console.error(err));

app.use(express.json());
app.use(cors());

app.use('/user', UserRoutes);
app.use('/post', PostRoutes); // Add this line to include the new post routes
app.use('/follow', followRoutes); // Include the new follow route
 // Include the new search route
 const searchRoutes = require('./Routes/search');
app.use('/search', searchRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));