const mongoose = require('mongoose');
const { Schema } = mongoose;
const SearchSchema = new Schema({

    title: String,
    category: String,
    author: String,
   
});
module.exports = mongoose.model('Search', SearchSchema);
